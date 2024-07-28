const { Sequelize, DataTypes } = require('sequelize');
const sequelize = new Sequelize('ornabuild', 'ornabuild', 'L3m0npi312', {
    host: '192.168.1.117',
    dialect: 'postgres',
    port: 5432,
});

const Banner = sequelize.define('Banner', {
    message: {
        type: DataTypes.STRING,
        allowNull: false,
    },
}, {
    timestamps: true,
});

module.exports = Banner;
