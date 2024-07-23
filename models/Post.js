const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User'); // Assuming you have a User model

const Post = sequelize.define('Post', {
    title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    images: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        allowNull: true,
    },
    videos: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        allowNull: true,
    },
    class: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    specialization: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User, // Assuming User is a defined Sequelize model
            key: 'id',
        }
    },
}, {
    timestamps: true,
});

Post.belongsTo(User, { foreignKey: 'userId' });

module.exports = Post;
