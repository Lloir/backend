const express = require('express');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const Comment = require('../models/Comment');
const User = require('../models/User'); // Assuming User model is imported
const authenticate = require('../middleware/auth');

const router = express.Router();

// Get comments for a specific post
router.get('/:postId', authenticate, async (req, res) => {
    const { postId } = req.params;
    if (!postId) {
        return res.status(400).json({ message: 'Post ID is required' });
    }

    try {
        const comments = await Comment.findAll({
            where: { postId },
            include: [{ model: User, attributes: ['username'] }],
        });
        res.json(comments);
    } catch (err) {
        console.error('Error fetching comments:', err.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// Post a new comment
router.post('/', authenticate, async (req, res) => {
    const { postId, content } = req.body;
    const userId = req.user.user.id;

    if (!postId || !content) {
        return res.status(400).json({ message: 'Post ID and content are required' });
    }

    try {
        const comment = await Comment.create({ postId, content, userId });
        res.status(201).json(comment);
    } catch (err) {
        console.error('Error creating comment:', err.message);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
