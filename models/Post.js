const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

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
    },
    videos: {
        type: DataTypes.ARRAY(DataTypes.STRING),
    },
    class: {
        type: DataTypes.STRING,
    },
    specialization: {
        type: DataTypes.STRING,
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
}, {
    timestamps: true,
});

Post.associate = (models) => {
    Post.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
    Post.hasMany(models.Comment, { foreignKey: 'postId', as: 'comments' });
};

module.exports = Post;
