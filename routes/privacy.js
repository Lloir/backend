const express = require('express');
const router = express.Router();

// Route to serve the privacy policy page
router.get('/', (req, res) => {
    res.render('privacy', {
        title: 'Privacy Policy',
        message: 'Your privacy is important to us. This Privacy Policy explains how we handle your personal information.'
    });
});

module.exports = router;
