// routes/comments.js
const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const Comment = require('../models/Comment');
const router = express.Router();

// @route POST /api/comments
// Add a comment
router.post('/', protect, async (req, res) => {
  const { postId, content } = req.body;
  
  try {
    const comment = new Comment({
      postId,
      author: req.user._id,
      content,
    });
    await comment.save();
    res.status(201).json(comment);
  } catch (error) {
    res.status(400).json({ message: 'Error adding comment' });
  }
});

// @route DELETE /api/comments/:id
// Delete a comment
router.delete('/:id', protect, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });

    if (comment.author.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await Comment.findByIdAndDelete(req.params.id);
    res.json({ message: 'Comment removed' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting comment' });
  }
});

// @route PUT /api/comments/:id
// Update a comment
router.put('/:id', protect, async (req, res) => {
  const { content } = req.body;

  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });

    if (comment.author.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    comment.content = content;
    await comment.save();
    res.json(comment);
  } catch (error) {
    res.status(500).json({ message: 'Error updating comment' });
  }
});

// @route GET /api/comments/:postId
// Get all comments for a post
router.get('/:postId', async (req, res) => {
  try {
    const comments = await Comment.find({ postId: req.params.postId }).populate('author', 'name');
    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching comments' });
  }
});

module.exports = router;
