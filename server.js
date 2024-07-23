require('dotenv').config();
const express = require('express');
const path = require('path');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const fs = require('fs');
const https = require('https');
const csrfProtection = require('./middleware/csrf');
const sequelize = require('./config/database');
const authRoutes = require('./routes/auth');
const postsRoutes = require('./routes/posts');
const privacyRoutes = require('./routes/privacy');
const protectedRoutes = require('./routes/protected');

const app = express();

// Middleware
app.use(helmet());
app.use(cors({
    origin: 'https://127.0.0.1:5000', // Adjust this to your frontend URL
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Apply CSRF protection middleware
app.use(csrfProtection);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/posts', postsRoutes);
app.use('/privacy', privacyRoutes);
app.use('/api/protected', protectedRoutes);

// Example route to get CSRF token
app.get('/api/csrf-token', (req, res) => {
    res.json({ csrfToken: req.csrfToken() });
});

// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'frontend', 'build')));

// Catchall handler to serve React's index.html for any unknown requests
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'build', 'index.html'));
});

// Connect to the database
sequelize.sync()
    .then(() => console.log('Database connected'))
    .catch(err => console.error('Database connection error:', err));

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Server error');
});

// SSL options
const httpsOptions = {
    key: fs.readFileSync('./key.pem'),
    cert: fs.readFileSync('./cert.pem')
};

// Server setup
const PORT = process.env.PORT || 5000;
https.createServer(httpsOptions, app).listen(PORT, () => {
    console.log(`Server running on https://192.168.1.117:${PORT}`);
});
