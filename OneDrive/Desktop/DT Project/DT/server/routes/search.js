const express = require('express');
const router = express.Router();
const Medicine = require('../models/Medicine');
const Pharmacy = require('../models/Pharmacy');

// @route   GET /api/search/medicine
// @desc    Search for medicine across all pharmacies
// @access  Public
router.get('/medicine', async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    // Search medicines by name or brand
    const medicines = await Medicine.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { brandManufacturer: { $regex: query, $options: 'i' } }
      ],
      stock: { $gt: 0 } // Only show medicines with stock
    })
      .populate('pharmacyId', 'pharmacyName address phoneNumber email location status')
      .sort({ stock: -1 });

    // Increment searchCount for matching medicines
    if (medicines.length > 0) {
      await Medicine.updateMany(
        {
          $or: [
            { name: { $regex: query, $options: 'i' } },
            { brandManufacturer: { $regex: query, $options: 'i' } }
          ]
        },
        { $inc: { searchCount: 1 } }
      );
    }

    // Format results with full pharmacy object included
    const results = medicines.map(medicine => ({
      _id: medicine._id,
      medicineName: medicine.name,
      brand: medicine.brandManufacturer,
      stock: medicine.stock,
      pharmacyId: {
        _id: medicine.pharmacyId._id,
        pharmacyName: medicine.pharmacyId.pharmacyName,
        address: medicine.pharmacyId.address,
        phone: medicine.pharmacyId.phoneNumber,
        email: medicine.pharmacyId.email,
        location: medicine.pharmacyId.location,
        status: medicine.pharmacyId.status
      }
    }));

    res.json(results);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/search/pharmacy
// @desc    Search for pharmacy by name
// @access  Public
router.get('/pharmacy', async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    console.log(`🔍 Searching for pharmacy with query: "${query}"`);

    const pharmacies = await Pharmacy.find({
      pharmacyName: { $regex: query, $options: 'i' }
    }).select('-password');

    console.log(`✅ Found ${pharmacies.length} pharmacies matching "${query}"`);
    if (pharmacies.length > 0) {
      pharmacies.forEach(p => {
        console.log(`   - ${p.pharmacyName} (${p.address})`);
      });
    }

    res.json(pharmacies);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/search/illness
// @desc    Search medicines by illness/purpose
// @access  Public
router.get('/illness', async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    // Search medicines by purpose
    // Split query into words and remove empty strings
    const searchTerms = query.split(' ').filter(term => term.trim().length > 0 && term !== '&');

    console.log(`Searching medicines for illness tokens: ${searchTerms.join(', ')}`);

    // Create OR query for each word
    const orConditions = searchTerms.map(term => ({
      purposes: { $regex: term, $options: 'i' }
    }));

    // Search medicines by purpose (any matching word)
    const medicines = await Medicine.find({
      $or: orConditions,
      stock: { $gt: 0 }
    })
      .populate('pharmacyId', 'pharmacyName address phoneNumber email location')
      .sort({ name: 1 });

    // Increment searchCount for found medicines
    if (medicines.length > 0) {
      await Medicine.updateMany(
        { $or: orConditions },
        { $inc: { searchCount: 1 } }
      );
    }

    res.json(medicines);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/search/pharmacy/:id/medicine
// @desc    Search medicines in a specific pharmacy
// @access  Public
router.get('/pharmacy/:id/medicine', async (req, res) => {
  try {
    const { query } = req.query;
    const pharmacyId = req.params.id;

    let searchQuery = { pharmacyId, stock: { $gt: 0 } };

    if (query) {
      searchQuery.$or = [
        { name: { $regex: query, $options: 'i' } },
        { brandManufacturer: { $regex: query, $options: 'i' } },
        { purposes: { $regex: query, $options: 'i' } }
      ];
    }

    console.log(`🔍 Searching medicines for pharmacy: ${pharmacyId} with query: "${query || ''}"`);
    console.log('Search Query Object:', JSON.stringify(searchQuery));

    // Try finding without stock filter if initial query fails, for debugging
    const totalMeds = await Medicine.countDocuments({ pharmacyId });
    console.log(`📊 Total medicines in DB for this pharmacy (ignoring stock/query): ${totalMeds}`);

    const medicines = await Medicine.find(searchQuery).sort({ name: 1 });
    console.log(`✅ Found ${medicines.length} medicines for pharmacy ${pharmacyId} with query and stock > 0`);

    // Map brandManufacturer to brand for frontend compatibility
    const results = medicines.map(m => ({
      _id: m._id,
      name: m.name,
      brand: m.brandManufacturer, // Map database field to expected frontend field
      purposes: m.purposes,
      stock: m.stock,
      manufacturer: m.brandManufacturer,
      sideEffects: m.sideEffects,
      pharmacyId: m.pharmacyId
    }));

    res.json(results);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/search/nearby-pharmacies
// @desc    Get nearby pharmacies (mock - can be enhanced with real location)
// @access  Public
router.get('/nearby-pharmacies', async (req, res) => {
  try {
    const pharmacies = await Pharmacy.find({ status: 'Open' })
      .select('-password')
      .limit(10)
      .sort({ createdAt: -1 });

    res.json(pharmacies);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/search/medicine/:id/pharmacies
// @desc    Get all pharmacies that have a specific medicine
// @access  Public
router.get('/medicine/:id/pharmacies', async (req, res) => {
  try {
    const medicineId = req.params.id;

    // First get the medicine to find its name
    const medicine = await Medicine.findById(medicineId);
    if (!medicine) {
      return res.status(404).json({ message: 'Medicine not found' });
    }

    // Find all pharmacies with this medicine
    const medicines = await Medicine.find({
      name: { $regex: medicine.name, $options: 'i' },
      stock: { $gt: 0 }
    })
      .populate('pharmacyId', 'pharmacyName address phoneNumber email location status')
      .sort({ stock: -1 });

    const results = medicines.map(m => ({
      pharmacyId: m.pharmacyId._id,
      pharmacyName: m.pharmacyId.pharmacyName,
      address: m.pharmacyId.address,
      phone: m.pharmacyId.phoneNumber,
      email: m.pharmacyId.email,
      location: m.pharmacyId.location,
      status: m.pharmacyId.status,
      stock: m.stock,
      brand: m.brand
    }));

    res.json(results);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/search/all-pharmacies
// @desc    Get all pharmacies (for debugging)
// @access  Public
router.get('/all-pharmacies', async (req, res) => {
  try {
    const pharmacies = await Pharmacy.find()
      .select('pharmacyName address location phoneNumber')
      .limit(50);

    console.log('✅ All pharmacies in database:');
    pharmacies.forEach((p, index) => {
      console.log(`${index + 1}. ${p.pharmacyName} | Address: ${p.address} | Location: Lat=${p.location.latitude}, Lon=${p.location.longitude}`);
    });

    const withLocationCount = pharmacies.filter(p => p.location.latitude !== 0 && p.location.longitude !== 0).length;
    const withoutLocationCount = pharmacies.length - withLocationCount;

    console.log(`📊 Summary: ${withLocationCount} with location, ${withoutLocationCount} without location`);

    res.json({
      total: pharmacies.length,
      withLocation: withLocationCount,
      withoutLocation: withoutLocationCount,
      pharmacies: pharmacies.map(p => ({
        name: p.pharmacyName,
        address: p.address,
        phone: p.phoneNumber,
        latitude: p.location.latitude,
        longitude: p.location.longitude,
        hasValidLocation: p.location.latitude !== 0 && p.location.longitude !== 0
      }))
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Haversine formula to calculate distance between two coordinates
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// @route   PUT /api/search/pharmacy/:pharmacyId/location
// @desc    Update pharmacy location (for testing/fixing)
// @access  Public
router.put('/pharmacy/:pharmacyId/location', async (req, res) => {
  try {
    const { pharmacyId } = req.params;
    const { latitude, longitude } = req.body;

    if (!latitude || !longitude) {
      return res.status(400).json({ message: 'Latitude and longitude are required' });
    }

    const updatedPharmacy = await Pharmacy.findByIdAndUpdate(
      pharmacyId,
      {
        location: {
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude)
        }
      },
      { new: true }
    );

    console.log(`✅ Updated pharmacy location: ${updatedPharmacy.pharmacyName} → Lat: ${latitude}, Lon: ${longitude}`);

    res.json({
      message: 'Location updated successfully',
      pharmacy: {
        name: updatedPharmacy.pharmacyName,
        location: updatedPharmacy.location
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/search/pharmacies-by-location
// @desc    Get all pharmacies sorted by distance from user location
// @access  Public
router.get('/pharmacies-by-location', async (req, res) => {
  try {
    const { latitude, longitude, radiusKm } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({ message: 'Latitude and longitude are required' });
    }

    const userLat = parseFloat(latitude);
    const userLon = parseFloat(longitude);
    const radius = parseInt(radiusKm) || 100; // Default 100 km radius

    console.log(`📍 Searching for pharmacies near: ${userLat}, ${userLon} within ${radius}km`);

    // Get all pharmacies with valid location
    const pharmacies = await Pharmacy.find({
      'location.latitude': { $exists: true, $ne: null, $ne: 0 },
      'location.longitude': { $exists: true, $ne: null, $ne: 0 }
    }).select('pharmacyName ownerName address phoneNumber email location pharmacyType status');

    console.log(`✅ Found ${pharmacies.length} pharmacies with valid location data`);

    // Log first pharmacy location for debugging
    if (pharmacies.length > 0) {
      console.log('First pharmacy location:', {
        name: pharmacies[0].pharmacyName,
        lat: pharmacies[0].location.latitude,
        lon: pharmacies[0].location.longitude
      });
    }

    // Calculate distance for each pharmacy and filter by radius
    const pharmaciesWithDistance = pharmacies
      .map(pharmacy => {
        const distance = calculateDistance(
          userLat,
          userLon,
          pharmacy.location.latitude,
          pharmacy.location.longitude
        );
        return {
          _id: pharmacy._id,
          pharmacyName: pharmacy.pharmacyName,
          ownerName: pharmacy.ownerName,
          address: pharmacy.address,
          phone: pharmacy.phoneNumber,
          email: pharmacy.email,
          location: pharmacy.location,
          pharmacyType: pharmacy.pharmacyType,
          status: pharmacy.status,
          distance: parseFloat(distance.toFixed(2)) // Distance in km
        };
      })
      .filter(p => p.distance <= radius) // Filter by radius
      .sort((a, b) => a.distance - b.distance); // Sort by distance ascending

    console.log(`✅ Returning ${pharmaciesWithDistance.length} pharmacies within ${radius}km`);

    res.json(pharmaciesWithDistance);
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

