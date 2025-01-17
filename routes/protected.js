const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth');

router.get('/', authenticate, (req, res) => {
    res.send({ message: 'This is protected data', user: req.user });
});

module.exports = router;
