const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const cors = require('cors');

const app = express();

app.use(cors())

app.use(express.json());


const uri = 'mongodb+srv://mohitsoni2006ms:Mohitsoni%40cluster0@cluster0.xsx2q.mongodb.net/'; 
const dbName = 'linkedindatabase';
const collectionName = 'users';


let db, userCollection;
MongoClient.connect(uri, { useUnifiedTopology: true })
  .then(client => {
    db = client.db(dbName);
    userCollection = db.collection(collectionName);
    console.log('Connected to MongoDB');
  })
  .catch(error => console.error(error));


app.get('/users', async (req, res) => {
  try {
    const users = await userCollection.find().toArray();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});





app.get('/users/:userId', async (req, res) => {
  const { userId } = req.params; // Extract userId from the URL

  try {
    const user = await userCollection.findOne({ userId });

    if (user) {
      res.status(200).json({ success: true, data: user });
    } else {
      res.status(404).json({ success: false, message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error });
  }
});




app.post('/users', async (req, res) => {
  const { userId, name, headline, location, connections } = req.body; // Extract user data

  try {
    const existingUser = await db.collection('users').findOne({ userId });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User ID already exists' });
    }

    const newUser = {
      userId,
      name,
      headline,
      location,
      connections: connections || 0, // Default connections to 0 if not provided
    };

    const result = await db.collection('users').insertOne(newUser);

    if (result.acknowledged) {
      res.status(201).json({ success: true, message: 'User created successfully', user: newUser });
    } else {
      res.status(500).json({ success: false, message: 'Failed to create user' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});



app.patch('/users/:userId', async (req, res) => {
  const { userId } = req.params; // Extract userId from the URL
  const { headline } = req.body; // Extract the new headline from the request body

  if (!headline) {
    return res.status(400).json({ success: false, message: 'Headline is required' });
  }

  try {
    const result = await db.collection('users').updateOne(
      { userId }, // Filter
      { $set: { headline } } // Update operation
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({
      success: true,
      message: 'User headline updated successfully',
      updatedCount: result.modifiedCount,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});


app.delete('/users/:userId', async (req, res) => {
  const { userId } = req.params; // Extract userId from the URL

  try {
    const result = await db.collection('users').deleteOne({ userId });

    if (result.deletedCount === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});



const PORT = 3002;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
