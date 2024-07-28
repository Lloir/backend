const express = require('express');
const Comment = require('../models/Comment');
const Post = require('../models/Post');
const router = express.Router();

// Get comments for a specific post
router.get('/:postId', async (req, res) => {
    try {
        const comments = await Comment.findAll({
            where: { postId: req.params.postId },
            include: [{
                model: Post,
                as: 'post',
                attributes: ['title'], // Include post title or any other attribute
            }]
        });
        res.send(comments);
    } catch (err) {
        console.error('Error fetching comments:', err);
        res.status(500).send({ message: 'Server error' });
    }
});

// Create a new comment for a post
router.post('/', async (req, res) => {
    const { content, postId, userId } = req.body;

    try {
        const comment = await Comment.create({ content, postId, userId });
        res.status(201).send(comment);
    } catch (err) {
        console.error('Error creating comment:', err);
        res.status(500).send({ message: 'Server error' });
    }
});

module.exports = router;
