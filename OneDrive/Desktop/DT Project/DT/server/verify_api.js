
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');
const http = require('http');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const app = express();
app.use(express.json());
app.use(cors());

// Import the modified search route
const searchRoute = require('./routes/search');
app.use('/api/search', searchRoute);

const PORT = 5002;

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/instamed', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log(`MongoDB Connected`);

        const server = app.listen(PORT, () => {
            console.log(`Test Server running on port ${PORT}`);

            const pharmacyId = '697c339ded401e308d2d50b7';
            const url = `http://localhost:${PORT}/api/search/pharmacy/${pharmacyId}/medicine`;

            console.log(`Fetching: ${url}`);

            http.get(url, (res) => {
                let data = '';
                res.on('data', (chunk) => {
                    data += chunk;
                });
                res.on('end', () => {
                    try {
                        const jsonData = JSON.parse(data);
                        console.log(`Response Status: ${res.statusCode}`);
                        console.log(`Response Data Length: ${Array.isArray(jsonData) ? jsonData.length : 'Not Array'}`);
                        if (Array.isArray(jsonData) && jsonData.length > 0) {
                            console.log('First Item:', JSON.stringify(jsonData[0], null, 2));
                        } else {
                            console.log('Data:', JSON.stringify(jsonData, null, 2));
                        }
                    } catch (e) {
                        console.error("Error parsing JSON:", e);
                        console.log("Raw Response:", data);
                    }

                    server.close();
                    mongoose.disconnect();
                    process.exit(0);
                });
            }).on('error', (err) => {
                console.error('Fetch error:', err);
                server.close();
                mongoose.disconnect();
                process.exit(1);
            });
        });

    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

run();
