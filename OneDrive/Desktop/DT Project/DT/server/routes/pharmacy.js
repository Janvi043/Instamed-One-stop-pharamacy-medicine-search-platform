const express = require('express');
const router = express.Router();
const Pharmacy = require('../models/Pharmacy');
const Medicine = require('../models/Medicine');
const { protectPharmacy } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

// @route   GET /api/pharmacy/profile
// @desc    Get pharmacy profile
// @access  Private (Pharmacy)
router.get('/profile', protectPharmacy, async (req, res) => {
  try {
    const pharmacy = await Pharmacy.findById(req.user._id).select('-password');
    if (!pharmacy) {
      return res.status(404).json({ message: 'Pharmacy not found' });
    }
    res.json(pharmacy);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/pharmacy/profile
// @desc    Update pharmacy profile
// @access  Private (Pharmacy)
router.put('/profile', protectPharmacy, [
  body('pharmacyName').optional().trim().notEmpty(),
  body('ownerName').optional().trim().notEmpty(),
  body('licenseNumber').optional().trim().notEmpty(),
  body('address').optional().trim().notEmpty(),
  body('phoneNumber').optional().trim().notEmpty(),
  body('email').optional().isEmail()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { pharmacyName, ownerName, licenseNumber, address, phoneNumber, email } = req.body;

    const pharmacy = await Pharmacy.findById(req.user._id);

    if (!pharmacy) {
      return res.status(404).json({ message: 'Pharmacy not found' });
    }

    // Update fields
    if (pharmacyName) pharmacy.pharmacyName = pharmacyName;
    if (ownerName) pharmacy.ownerName = ownerName;
    if (licenseNumber) pharmacy.licenseNumber = licenseNumber;
    if (address) pharmacy.address = address;
    if (phoneNumber) pharmacy.phoneNumber = phoneNumber;
    if (email) pharmacy.email = email;

    const updatedPharmacy = await pharmacy.save();

    res.json({
      _id: updatedPharmacy._id,
      pharmacyName: updatedPharmacy.pharmacyName,
      ownerName: updatedPharmacy.ownerName,
      licenseNumber: updatedPharmacy.licenseNumber,
      address: updatedPharmacy.address,
      phoneNumber: updatedPharmacy.phoneNumber,
      email: updatedPharmacy.email
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/pharmacy/change-password
// @desc    Change pharmacy password
// @access  Private (Pharmacy)
router.put('/change-password', protectPharmacy, [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { currentPassword, newPassword } = req.body;

    const pharmacy = await Pharmacy.findById(req.user._id);

    if (!(await pharmacy.matchPassword(currentPassword))) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    pharmacy.password = newPassword;
    await pharmacy.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/pharmacy/medicines
// @desc    Get all medicines for pharmacy
// @access  Private (Pharmacy)
router.get('/medicines', protectPharmacy, async (req, res) => {
  try {
    const { search } = req.query;
    let query = { pharmacyId: req.user._id };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } }
      ];
    }

    const medicines = await Medicine.find(query).sort({ createdAt: -1 });
    res.json(medicines);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/pharmacy/stats
// @desc    Get pharmacy statistics
// @access  Private (Pharmacy)
router.get('/stats', protectPharmacy, async (req, res) => {
  try {
    const totalMedicines = await Medicine.countDocuments({ pharmacyId: req.user._id });
    const lowStock = await Medicine.countDocuments({
      pharmacyId: req.user._id,
      stock: { $lt: 20, $gt: 0 }
    });
    const outOfStock = await Medicine.countDocuments({
      pharmacyId: req.user._id,
      stock: 0
    });

    // Calculate total searches across all medicines in this pharmacy
    const totalSearchesResult = await Medicine.aggregate([
      { $match: { pharmacyId: req.user._id } },
      { $group: { _id: null, total: { $sum: '$searchCount' } } }
    ]);

    const totalSearches = totalSearchesResult.length > 0 ? totalSearchesResult[0].total : 0;

    const topSearchedMedicines = await Medicine.find({
      pharmacyId: req.user._id,
      searchCount: { $gt: 0 }
    })
      .sort({ searchCount: -1 })
      .limit(10);

    res.json({
      totalMedicines,
      lowStock,
      outOfStock,
      totalSearches,
      topSearchedMedicines
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/pharmacy/:id
// @desc    Get public pharmacy details by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const pharmacy = await Pharmacy.findById(req.params.id).select('-password');
    if (!pharmacy) {
      return res.status(404).json({ message: 'Pharmacy not found' });
    }
    res.json(pharmacy);
  } catch (error) {
    console.error(error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Pharmacy not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

