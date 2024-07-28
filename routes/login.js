// routes/login.js
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');

const router = express.Router();
const jwtSecret = process.env.JWT_SECRET;

// Validation middleware
const validateLogin = [
    body('usernameOrEmail').isString().trim().escape(),
    body('password').isString().trim().escape(),
];

// Middleware to check validation results
const checkValidation = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

// Login a user
router.post('/login', validateLogin, checkValidation, async (req, res) => {
    const { usernameOrEmail, password } = req.body;

    try {
        let user = await User.findOne({
            where: {
                [Op.or]: [{ email: usernameOrEmail }, { username: usernameOrEmail }],
            },
        });

        if (!user) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        const payload = { user: { id: user.id } };
        const token = jwt.sign(payload, jwtSecret, { expiresIn: '1h' });

        res.json({ token });
    } catch (err) {
        console.error('Error in login route:', err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;
