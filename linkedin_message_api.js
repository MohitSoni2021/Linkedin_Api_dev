const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');

const app = express();


app.use(express.json());


const uri = 'mongodb+srv://mohitsoni2006ms:Mohitsoni%40cluster0@cluster0.xsx2q.mongodb.net/'; 
const dbName = 'linkedindatabase';
const collectionName = 'messages';


let db, msgCollection;
MongoClient.connect(uri, { useUnifiedTopology: true })
  .then(client => {
    db = client.db(dbName);
    msgCollection = db.collection(collectionName);
    console.log('Connected to MongoDB');
  })
  .catch(error => console.error(error));




// GET /messages/:userId: Fetch messages for a user
// localhost:3002/messages/:userId
app.get('/messages/:userId', async (req, res) => {
    const { userId } = req.params;
  
    try {
      const messages = await db.collection('messages').find({ to: userId }).toArray();
  
      if (messages.length === 0) {
        return res.status(404).json({ success: false, message: 'No messages found for this user' });
      }
  
      res.status(200).json({ success: true, data: messages });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
  });
  
  // POST /messages: Send a message
  // localhost:3002/messages
  app.post('/messages', async (req, res) => {
    const { messageId, from, to, content } = req.body;
  
    if (!messageId || !from || !to || !content) {
      return res.status(400).json({ success: false, message: 'messageId, from, to, and content are required' });
    }
  
    try {
      const newMessage = {
        messageId,
        from,
        to,
        content,
        sentAt: new Date(),
      };
  
      const result = await db.collection('messages').insertOne(newMessage);
  
      if (result.acknowledged) {
        res.status(201).json({ success: true, message: 'Message sent successfully', data: newMessage });
      } else {
        res.status(500).json({ success: false, message: 'Failed to send message' });
      }
    } catch (error) {
      res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
  });
  
  // DELETE /messages/:messageId: Delete a message
  // localhost:3002/messages/:messageId
  app.delete('/messages/:messageId', async (req, res) => {
    const { messageId } = req.params;
  
    try {
      const result = await db.collection('messages').deleteOne({ messageId });
  
      if (result.deletedCount === 0) {
        return res.status(404).json({ success: false, message: 'Message not found' });
      }
  
      res.status(200).json({ success: true, message: 'Message deleted successfully' });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
  });




const PORT = 3002;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

