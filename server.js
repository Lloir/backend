const express = require('express');
const path = require('path');
const helmet = require('helmet');
const cors = require('cors');
const dotenv = require('dotenv');
const { sequelize, models } = require('./models');
const greenlock = require('greenlock-express');

dotenv.config();

const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/posts');
const commentRoutes = require('./routes/comments');
const privacyRoutes = require('./routes/privacy');
const adminRoutes = require('./routes/admin');

const app = express();

const cspDirectives = {
    directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "https://cdnjs.cloudflare.com"],
        styleSrc: ["'self'", "https://cdnjs.cloudflare.com", "'unsafe-inline'", "https://fonts.googleapis.com"],
        imgSrc: ["'self'", "data:"],
        connectSrc: ["'self'", "https://localhost:5000"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: []
    }
};

app.use(helmet.contentSecurityPolicy(cspDirectives));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

sequelize.authenticate()
    .then(() => console.log('PostgreSQL connected'))
    .catch(err => console.error('Unable to connect to the database:', err));

// Ensure this path points to the correct 'build' directory of your frontend
app.use(express.static(path.join(__dirname, 'frontend', 'build')));

app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/privacy', privacyRoutes);

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'build', 'index.html'));
});

const greenlockConfig = {
    version: 'draft-12',
    configDir: '/etc/letsencrypt',
    server: 'https://acme-v02.api.letsencrypt.org/directory',
    approveDomains: ['ornabuilds.0x3d.uk'],
    email: 'admin@0x3d.uk',
    agreeTos: true,
    communityMember: false,
    telemetry: false,
    challenges: {
        'http-01': require('acme-http-01-standalone')
    }
};

// Create HTTP server for ACME HTTP-01 challenge and redirect to HTTPS
require('http').createServer(greenlock.middleware(app)).listen(80, () => {
    console.log(`ACME HTTP-01 challenge server running on port 80`);
});

// Create HTTPS server with Let's Encrypt
greenlock.init(greenlockConfig).serve(app);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on https://localhost:${PORT}`);
});
