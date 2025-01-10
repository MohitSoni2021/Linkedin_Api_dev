const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');

const app = express();

app.use(express.json());

const uri = 'mongodb+srv://mohitsoni2006ms:Mohitsoni%40cluster0@cluster0.xsx2q.mongodb.net/';
const dbName = 'linkedindatabase';
const collectionName = 'users';

let db, usersCollection;
MongoClient.connect(uri, { useUnifiedTopology: true })
  .then(client => {
    db = client.db(dbName);
    usersCollection = db.collection(collectionName);
    console.log('Connected to MongoDB');
  })
  .catch(error => console.error(error));

// GET /users/:userId/profile-views: Fetch profile views count
// http://localhost:3002/users/:userId/profile-views
app.get('/users/:userId/profile-views', async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await db.collection('users').findOne({ userId }, { projection: { profileViews: 1 } });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({ success: true, data: { profileViews: user.profileViews } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// PUT /users/:userId/skills: Add a skill to a user
// http://localhost:3002/users/:userId/skills
app.put('/users/:userId/skills', async (req, res) => {
  const { userId } = req.params;
  const { skill } = req.body;

  if (!skill) {
    return res.status(400).json({ success: false, message: 'Skill is required' });
  }

  try {
    const result = await db.collection('users').updateOne(
      { userId },
      { $push: { skills: skill } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({ success: true, message: 'Skill added successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// PATCH /users/:userId/premium: Upgrade to premium account
// http://localhost:3002/users/:userId/premium
app.patch('/users/:userId/premium', async (req, res) => {
  const { userId } = req.params;

  try {
    const result = await db.collection('users').updateOne(
      { userId },
      { $set: { isPremium: true } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({ success: true, message: 'User upgraded to premium successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

const PORT = 3002;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});



