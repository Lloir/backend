const express = require('express');
const jwt = require('jsonwebtoken');
const Comment = require('../models/Comment');

const router = express.Router();

function authenticate(req, res, next) {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).send({ message: 'Access denied' });

    try {
        const decoded = jwt.verify(token, 'secretKey');
        req.user = decoded;
        next();
    } catch (err) {
        res.status(400).send({ message: 'Invalid token' });
    }
}

router.post('/:postId', authenticate, async (req, res) => {
    try {
        const { content } = req.body;
        const comment = new Comment({ content, postId: req.params.postId, userId: req.user.userId });
        await comment.save();
        res.status(201).send(comment);
    } catch (error) {
        res.status(400).send(error);
    }
});

router.get('/:postId', async (req, res) => {
    try {
        const comments = await Comment.find({ postId: req.params.postId }).populate('userId', 'username');
        res.send(comments);
    } catch (error) {
        res.status(400).send(error);
    }
});

module.exports = router;
