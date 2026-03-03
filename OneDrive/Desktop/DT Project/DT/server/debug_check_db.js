
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const Medicine = require('./models/Medicine');
const Pharmacy = require('./models/Pharmacy');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/instamed', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

const debug = async () => {
    await connectDB();

    console.log('\n--- PHARMACIES ---');
    const pharmacies = await Pharmacy.find({});
    console.log(`Found ${pharmacies.length} pharmacies.`);
    pharmacies.forEach(p => {
        console.log(`ID: ${p._id} | Name: ${p.pharmacyName}`);
    });

    console.log('\n--- MEDICINES ---');
    const medicines = await Medicine.find({});
    console.log(`Found ${medicines.length} medicines.`);

    // Check distribution
    const distribution = {};
    medicines.forEach(m => {
        const pid = m.pharmacyId && m.pharmacyId.toString();
        if (!distribution[pid]) distribution[pid] = 0;
        distribution[pid]++;
        // Print first 3 medicines to check structure
        if (medicines.indexOf(m) < 3) {
            console.log(`Med ID: ${m._id} | Name: ${m.name} | PharmacyId: ${m.pharmacyId} | Stock: ${m.stock}`);
        }
    });

    console.log('\n--- DISTRIBUTION ---');
    console.log(distribution);

    process.exit();
};

debug();
