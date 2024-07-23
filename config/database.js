const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');

dotenv.config();

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    dialect: 'postgres',
    port: process.env.DB_PORT || 5432, // Default PostgreSQL port
    logging: (msg) => {
        // Sanitize or limit logging here
        if (msg.startsWith('Executing')) {
            console.log('Executing SQL query...');
        } else {
            console.log(msg);
        }
    },
});

module.exports = sequelize;
