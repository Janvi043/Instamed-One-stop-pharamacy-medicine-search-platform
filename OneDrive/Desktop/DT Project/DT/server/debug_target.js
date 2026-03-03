
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const Medicine = require('./models/Medicine');
const Pharmacy = require('./models/Pharmacy');

const TARGET_PHARMACY_ID = '697c339ded401e308d2d50b7';

const debug = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/instamed', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log(`MongoDB Connected`);

        const meds = await Medicine.find({ pharmacyId: TARGET_PHARMACY_ID });
        console.log(`\nFound ${meds.length} medicines for pharmacy ${TARGET_PHARMACY_ID}`);

        meds.forEach(m => {
            console.log(JSON.stringify({
                _id: m._id,
                name: m.name,
                stock: m.stock,
                pharmacyId: m.pharmacyId
            }, null, 2));
        });

        // Test the query that the route uses
        const routeQuery = { pharmacyId: TARGET_PHARMACY_ID, stock: { $gt: 0 } };
        const visibleMeds = await Medicine.find(routeQuery);
        console.log(`\nVisible via route query (stock > 0): ${visibleMeds.length}`);

    } catch (error) {
        console.error(error);
    } finally {
        process.exit();
    }
};

debug();
