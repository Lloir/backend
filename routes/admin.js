const express = require('express');
const isAdmin = require('../middleware/isAdmin');
const Post = require('../models/Post');
const router = express.Router();

router.use(isAdmin);

// Delete a post
router.delete('/posts/:id', async (req, res) => {
    try {
        const post = await Post.findByPk(req.params.id);
        if (!post) {
            return res.status(404).send({ message: 'Post not found' });
        }
        await post.destroy();
        res.send({ message: 'Post deleted successfully' });
    } catch (err) {
        res.status(500).send({ message: 'Server error' });
    }
});

router.post('/banner', async (req, res) => {
    const { message } = req.body;
    try {
        const Banner = require('../models/Banner');
        const banner = await Banner.create({ message });
        res.send(banner);
    } catch (err) {
        res.status(500).send({ message: 'Server error' });
    }
});

module.exports = router;
