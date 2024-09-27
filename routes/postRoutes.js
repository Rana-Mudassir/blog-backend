const express = require('express');
const Post = require('../models/Post');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

// @route POST /api/posts
// Create a new post
router.post('/', protect, async (req, res) => {
  const { title, content, categories } = req.body;
  try {
    const newPost = new Post({
      title,
      content,
      author: req.user._id,
      categories,
    });
    await newPost.save();
    res.status(201).json(newPost);
  } catch (error) {
    res.status(500).json({ message: 'Error creating post' });
  }
});

// @route GET /api/posts
// Get all posts
router.get('/', async (req, res) => {
  try {
    const posts = await Post.find().populate('author', 'name').sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching posts' });
  }
});

// @route GET /api/posts/:id
// Get a single post
router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate('author', 'name');
    if (post) {
      res.json(post);
    } else {
      res.status(404).json({ message: 'Post not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error fetching post' });
  }
});

// @route PUT /api/posts/:id
// Update a post
router.put('/:id', protect, async (req, res) => {
  const { title, content, categories } = req.body;
  try {
    const post = await Post.findById(req.params.id);

    if (post && post.author.toString() === req.user._id.toString()) {
      post.title = title;
      post.content = content;
      post.categories = categories;
      const updatedPost = await post.save();
      res.json(updatedPost);
    } else {
      res.status(401).json({ message: 'Not authorized' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error updating post' });
  }
});

// @route DELETE /api/posts/:id
// Delete a post
router.delete('/:id', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (post && post.author.toString() === req.user._id.toString()) {
      await post.remove();
      res.json({ message: 'Post removed' });
    } else {
      res.status(401).json({ message: 'Not authorized' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error deleting post' });
  }
});

module.exports = router;
