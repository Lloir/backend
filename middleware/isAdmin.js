const jwt = require('jsonwebtoken');
const User = require('../models/User');

const isAdmin = async (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
        return res.status(401).send({ message: 'Access denied' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findByPk(decoded.user.id);

        if (user && user.isAdmin) {
            req.user = user;
            next();
        } else {
            res.status(403).send({ message: 'Access denied' });
        }
    } catch (err) {
        res.status(400).send({ message: 'Invalid token' });
    }
};

module.exports = isAdmin;
