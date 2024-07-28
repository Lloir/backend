require('dotenv').config();
const express = require('express');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');
const User = require('../models/User');

const router = express.Router();
const jwtSecret = process.env.JWT_SECRET;

// Rate limiter configuration
const registrationLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 registration requests per windowMs
    message: 'Too many accounts created from this IP, please try again later.',
});

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // Limit each IP to 10 login requests per windowMs
    message: 'Too many login attempts from this IP, please try again later.',
});

// Validation middleware
const validateRegistration = [
    body('username').isLength({ min: 3 }).trim().escape(),
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }).trim().escape(),
];

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

// Account lockout mechanism
const failedLoginAttempts = {}; // Store failed login attempts
const MAX_FAILED_ATTEMPTS = 5; // Max failed attempts before locking account
const LOCKOUT_TIME = 15 * 60 * 1000; // Lockout time in milliseconds (15 minutes)

// Register a new user
router.post('/register', registrationLimiter, validateRegistration, checkValidation, async (req, res) => {
    const { username, email, password } = req.body;

    try {
        let user = await User.findOne({ where: { email } });
        if (user) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        user = await User.create({ username, email, password: hashedPassword });

        const payload = { user: { id: user.id } };
        const token = jwt.sign(payload, jwtSecret, { expiresIn: '1h' });

        res.json({ token });
    } catch (err) {
        console.error('Error in register route:', err.message);
        res.status(500).send('Server error');
    }
});

// Login a user
router.post('/login', loginLimiter, validateLogin, checkValidation, async (req, res) => {
    const { usernameOrEmail, password } = req.body;
    const userKey = usernameOrEmail.toLowerCase();

    try {
        let user = await User.findOne({
            where: {
                [Op.or]: [{ email: usernameOrEmail }, { username: usernameOrEmail }],
            },
        });

        if (!user) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        if (failedLoginAttempts[userKey] && failedLoginAttempts[userKey].count >= MAX_FAILED_ATTEMPTS) {
            const timePassed = Date.now() - failedLoginAttempts[userKey].time;
            if (timePassed < LOCKOUT_TIME) {
                return res.status(429).json({ msg: 'Account locked. Too many failed login attempts.' });
            } else {
                delete failedLoginAttempts[userKey]; // Reset failed attempts after lockout time passes
            }
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            if (!failedLoginAttempts[userKey]) {
                failedLoginAttempts[userKey] = { count: 1, time: Date.now() };
            } else {
                failedLoginAttempts[userKey].count++;
            }

            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        delete failedLoginAttempts[userKey]; // Reset failed attempts on successful login

        const payload = { user: { id: user.id } };
        const token = jwt.sign(payload, jwtSecret, { expiresIn: '1h' });

        res.cookie('token', token, { httpOnly: true, secure: true, sameSite: 'strict' });
        res.json({ token });
    } catch (err) {
        console.error('Error in login route:', err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;
