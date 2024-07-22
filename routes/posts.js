const express = require('express');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const Post = require('../models/Post');

const router = express.Router();

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    },
});

const upload = multer({ storage: storage });

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

router.post('/', authenticate, upload.array('media'), async (req, res) => {
    try {
        const { title, content, class: postClass, specialization } = req.body;
        const images = req.files.filter(file => file.mimetype.startsWith('image')).map(file => file.path);
        const videos = req.files.filter(file => file.mimetype.startsWith('video')).map(file => file.path);
        const post = new Post({ title, content, images, videos, class: postClass, specialization, userId: req.user.userId });
        await post.save();
        res.status(201).send(post);
    } catch (error) {
        res.status(400).send(error);
    }
});

router.get('/', async (req, res) => {
    try {
        const posts = await Post.find().populate('userId', 'username');
        res.send(posts);
    } catch (error) {
        res.status(400).send(error);
    }
});

router.get('/search', async (req, res) => {
    try {
        const { query, class: postClass, specialization } = req.query;
        const searchConditions = {};
        if (query) searchConditions.$text = { $search: query };
        if (postClass) searchConditions.class = postClass;
        if (specialization) searchConditions.specialization = specialization;

        const results = await Post.find(searchConditions);
        res.send(results);
    } catch (error) {
        res.status(400).send(error);
    }
});

module.exports = router;
