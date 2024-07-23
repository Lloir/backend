require('dotenv').config();
const express = require('express');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const sharp = require('sharp');
const { Op } = require('sequelize');
const Post = require('../models/Post');
const User = require('../models/User');
const authenticate = require('../middleware/auth');

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
            return cb(new Error('Only image files are allowed'));
        }
        cb(null, true);
    },
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB size limit
});

router.post('/', authenticate, upload.array('media'), async (req, res) => {
    try {
        const { title, content, class: postClass, specialization, youtubeLink } = req.body;
        const images = [];

        if (req.files) {
            for (const file of req.files) {
                const resizedImageBuffer = await sharp(file.buffer)
                    .resize({ width: 800 })
                    .toBuffer();
                const imagePath = `uploads/${Date.now()}-${file.originalname}`;
                await sharp(resizedImageBuffer).toFile(imagePath);
                images.push(imagePath);
            }
        }

        const post = await Post.create({
            title,
            content,
            images,
            class: postClass,
            specialization,
            youtubeLink,
            userId: req.user.user.id,
        });

        res.status(201).send(post);
    } catch (error) {
        console.error('Error creating post:', error.message);
        res.status(400).send({ message: error.message });
    }
});

router.get('/', async (req, res) => {
    try {
        const posts = await Post.findAll({
            include: [{ model: User, attributes: ['username'] }],
        });
        res.send(posts);
    } catch (error) {
        console.error('Error fetching posts:', error.message);
        res.status(400).send({ message: error.message });
    }
});

router.get('/search', async (req, res) => {
    try {
        const { query, class: postClass, specialization } = req.query;
        const searchConditions = {};
        if (query) searchConditions[Op.or] = [
            { title: { [Op.iLike]: `%${query}%` } },
            { content: { [Op.iLike]: `%${query}%` } }
        ];
        if (postClass) searchConditions.class = postClass;
        if (specialization) searchConditions.specialization = specialization;

        const results = await Post.findAll({
            where: searchConditions,
            include: [{ model: User, attributes: ['username'] }],
        });
        res.send(results);
    } catch (error) {
        console.error('Error searching posts:', error.message);
        res.status(400).send({ message: error.message });
    }
});

module.exports = router;
