const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');

const app = express();


app.use(express.json());


const uri = 'mongodb+srv://mohitsoni2006ms:Mohitsoni%40cluster0@cluster0.xsx2q.mongodb.net/'; 
const dbName = 'linkedindatabase';
const collectionName = 'connections';


let db, userCollection;
MongoClient.connect(uri, { useUnifiedTopology: true })
  .then(client => {
    db = client.db(dbName);
    userCollection = db.collection(collectionName);
    console.log('Connected to MongoDB');
  })
  .catch(error => console.error(error));


// GET route to fetch all connections for a user
// localhost:3002/connections/:userId
app.get('/connections/:userId', async (req, res) => {
    const { userId } = req.params; // Extract userId from the URL
  
    try {
      const connections = await db.collection('connections').find({ user1: userId }).toArray();
  
      if (connections.length === 0) {
        return res.status(404).json({ success: false, message: 'No connections found for this user' });
      }
  
      res.status(200).json({ success: true, data: connections });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
  });

  

  // POST route to send a connection request
  // localhost:3002/connections
app.post('/connections', async (req, res) => {
    const { connectionId, user1, user2, status } = req.body; // Extract connection details from the request body
  
    if (!connectionId || !user1 || !user2) {
      return res.status(400).json({ success: false, message: 'connectionId, user1, and user2 are required' });
    }
  
    try {
      // Check if a connection request already exists between these users
      const existingConnection = await db.collection('connections').findOne({ user1, user2 });
      if (existingConnection) {
        return res.status(400).json({ success: false, message: 'Connection request already exists' });
      }
  
      // Insert the new connection request
      const newConnection = {
        connectionId,
        user1,
        user2,
        status: status || 'pending', // Default status to 'pending' if not provided
      };
  
      const result = await db.collection('connections').insertOne(newConnection);
  
      if (result.acknowledged) {
        res.status(201).json({ success: true, message: 'Connection request sent successfully', data: newConnection });
      } else {
        res.status(500).json({ success: false, message: 'Failed to send connection request' });
      }
    } catch (error) {
      res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
  });

  

  // PATCH route to accept a connection request
  // localhost:3002/connections/:connectionId
app.patch('/connections/:connectionId', async (req, res) => {
    const { connectionId } = req.params; // Extract connectionId from the URL
  
    try {
      // Update the connection status to 'connected'
      const result = await db.collection('connections').updateOne(
        { connectionId }, // Filter
        { $set: { status: 'connected' } } // Update operation
      );
  
      if (result.matchedCount === 0) {
        return res.status(404).json({ success: false, message: 'Connection request not found' });
      }
  
      res.status(200).json({ success: true, message: 'Connection request accepted successfully' });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
  });
  


  // DELETE route to remove a connection by connectionId
  // localhost:3002/connections/:connectionId
app.delete('/connections/:connectionId', async (req, res) => {
    const { connectionId } = req.params; // Extract connectionId from the URL
  
    try {
      // Delete the connection document matching the connectionId
      const result = await db.collection('connections').deleteOne({ connectionId });
  
      if (result.deletedCount === 0) {
        return res.status(404).json({ success: false, message: 'Connection not found' });
      }
  
      res.status(200).json({ success: true, message: 'Connection removed successfully' });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
  });
  






const PORT = 3002;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

