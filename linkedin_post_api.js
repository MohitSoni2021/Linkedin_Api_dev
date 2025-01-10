const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');

const app = express();


app.use(express.json());


const uri = 'mongodb+srv://mohitsoni2006ms:Mohitsoni%40cluster0@cluster0.xsx2q.mongodb.net/'; 
const dbName = 'linkedindatabase';
const collectionName = 'posts';


let db, postCollection;
MongoClient.connect(uri, { useUnifiedTopology: true })
  .then(client => {
    db = client.db(dbName);
    postCollection = db.collection(collectionName);
    console.log('Connected to MongoDB');
  })
  .catch(error => console.error(error));



// GET route to fetch all posts
// http://localhost:3002/posts
app.get('/posts', async (req, res) => {
    try {
      const posts = await db.collection('posts').find({}).toArray();
  
      if (posts.length === 0) {
        return res.status(404).json({ success: false, message: 'No posts found' });
      }
  
      res.status(200).json({ success: true, data: posts });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
  });

  

  // GET /posts/:postId: Fetch a specific post
  // http://localhost:3002/posts/:postId
app.get('/posts/:postId', async (req, res) => {
    const { postId } = req.params;
  
    try {
      const post = await db.collection('posts').findOne({ postId });
  
      if (!post) {
        return res.status(404).json({ success: false, message: 'Post not found' });
      }
  
      res.status(200).json({ success: true, data: post });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
  });
  



  // POST /posts: Create a new post
  // http://localhost:3002/posts
  app.post('/posts', async (req, res) => {
    const { postId, userId, content, likes, createdAt } = req.body;
  
    if (!postId || !userId || !content) {
      return res.status(400).json({ success: false, message: 'postId, userId, and content are required' });
    }
  
    try {
      const newPost = {
        postId,
        userId,
        content,
        likes: likes || 0,
        createdAt: createdAt || new Date(),
      };
  
      const result = await db.collection('posts').insertOne(newPost);
  
      if (result.acknowledged) {
        res.status(201).json({ success: true, message: 'Post created successfully', data: newPost });
      } else {
        res.status(500).json({ success: false, message: 'Failed to create post' });
      }
    } catch (error) {
      res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
  });



  
  // PATCH /posts/:postId/likes: Add a like to a post
  // http://localhost:3002/posts/:postId/likes
  app.patch('/posts/:postId/likes', async (req, res) => {
    const { postId } = req.params;
  
    try {
      const result = await db.collection('posts').updateOne(
        { postId },
        { $inc: { likes: 1 } }
      );
  
      if (result.matchedCount === 0) {
        return res.status(404).json({ success: false, message: 'Post not found' });
      }
  
      res.status(200).json({ success: true, message: 'Like added successfully' });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
  });


// DELETE /posts/:postId: Delete a post
app.delete('/posts/:postId', async (req, res) => {
  const { postId } = req.params;

  try {
    const result = await db.collection('posts').deleteOne({ postId });

    if (result.deletedCount === 0) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    res.status(200).json({ success: true, message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});





const PORT = 3002;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
