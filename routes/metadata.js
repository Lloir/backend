const express = require('express');
const path = require('path');
const fs = require('fs');
const csv = require('csv-parser');

const router = express.Router();

const readCSV = (filePath) => {
    return new Promise((resolve, reject) => {
        const results = [];
        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (data) => results.push(data))
            .on('end', () => resolve(results))
            .on('error', (err) => reject(err));
    });
};

router.get('/classes', async (req, res) => {
    try {
        const classes = await readCSV(path.join(__dirname, '../public/class_data.csv'));
        res.json(classes);
    } catch (error) {
        console.error('Error reading class data:', error);
        res.status(500).send({ message: 'Server error' });
    }
});

router.get('/specializations', async (req, res) => {
    try {
        const specializations = await readCSV(path.join(__dirname, '../public/specialization_data.csv'));
        res.json(specializations);
    } catch (error) {
        console.error('Error reading specialization data:', error);
        res.status(500).send({ message: 'Server error' });
    }
});

module.exports = router;
