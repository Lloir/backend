// routes/posts.js
const express = require('express');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const { Op } = require('sequelize');
const Post = require('../models/Post');
const User = require('../models/User');
const authenticate = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

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

router.post(
    '/',
    authenticate,
    upload.single('media'),
    [
        body('title').trim().escape().isLength({ min: 1 }).withMessage('Title is required'),
        body('content').trim().escape().isLength({ min: 1 }).withMessage('Content is required'),
        body('class').trim().escape().isLength({ min: 1 }).withMessage('Class is required'),
        body('specialization').optional({ checkFalsy: true }).trim().escape(),
        body('youtubeLink').optional({ checkFalsy: true }).isURL().withMessage('Invalid URL')
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const { title, content, class: postClass, specialization, youtubeLink } = req.body;
            const media = req.file ? req.file.path : null;

            const post = await Post.create({
                title,
                content,
                images: media && req.file.mimetype.startsWith('image') ? [media] : [],
                videos: media && req.file.mimetype.startsWith('video') ? [media] : [],
                class: postClass,
                specialization,
                youtubeLink,
                userId: req.user.id,
            });

            res.status(201).send(post);
        } catch (error) {
            console.error('Error creating post:', error.message);
            res.status(400).send({ message: error.message });
        }
    }
);

router.get('/', async (req, res) => {
    try {
        const posts = await Post.findAll({
            include: [{ model: User, attributes: ['username'], as: 'user' }],
        });
        res.send(posts);
    } catch (error) {
        console.error('Error fetching posts:', error.message);
        res.status(400).send({ message: error.message });
    }
});

module.exports = router;
