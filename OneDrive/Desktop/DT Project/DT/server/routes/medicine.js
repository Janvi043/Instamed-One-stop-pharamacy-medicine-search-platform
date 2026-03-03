const express = require('express');
const router = express.Router();
const Medicine = require('../models/Medicine');
const Pharmacy = require('../models/Pharmacy');
const { protectPharmacy } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

// @route   POST /api/medicine
// @desc    Add new medicine
// @access  Private (Pharmacy)
router.post('/', protectPharmacy, async (req, res) => {
  try {
    console.log('Medicine POST request received:', req.body);
    
    const { name, brandManufacturer, composition, purposes, sideEffects, stock, dosage, warnings } = req.body;

    // Basic validation without express-validator
    if (!name || !brandManufacturer || !composition || !purposes || !sideEffects || !stock) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const medicine = await Medicine.create({
      name,
      brandManufacturer,
      composition: composition || '',
      purposes: Array.isArray(purposes) ? purposes : purposes.split(',').map(p => p.trim()),
      sideEffects: Array.isArray(sideEffects) ? sideEffects : sideEffects.split(',').map(s => s.trim()),
      stock: parseInt(stock) || 0,
      dosage: dosage || '',
      warnings: warnings || '',
      pharmacyId: req.user._id
    });

    console.log('Medicine created successfully:', medicine);
    res.status(201).json(medicine);
  } catch (error) {
    console.error('Error creating medicine:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/medicine
// @desc    Get all medicines for the current pharmacy
// @access  Private (Pharmacy)
router.get('/', protectPharmacy, async (req, res) => {
  try {
    const medicines = await Medicine.find({ pharmacyId: req.user._id }).sort({ createdAt: -1 });
    res.json(medicines);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/medicine/:id
// @desc    Get medicine by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const medicine = await Medicine.findById(req.params.id).populate('pharmacyId', 'pharmacyName address phoneNumber email location');
    
    if (!medicine) {
      return res.status(404).json({ message: 'Medicine not found' });
    }

    res.json(medicine);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/medicine/:id
// @desc    Update medicine
// @access  Private (Pharmacy)
router.put('/:id', protectPharmacy, [
  body('name').optional().trim().notEmpty(),
  body('brandManufacturer').optional().trim().notEmpty(),
  body('composition').optional().trim().notEmpty(),
  body('stock').optional().isInt({ min: 0 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const medicine = await Medicine.findById(req.params.id);

    if (!medicine) {
      return res.status(404).json({ message: 'Medicine not found' });
    }

    // Check if medicine belongs to this pharmacy
    if (medicine.pharmacyId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this medicine' });
    }

    // Update fields
    const { name, brandManufacturer, composition, purposes, sideEffects, stock, dosage, warnings } = req.body;
    
    if (name) medicine.name = name;
    if (brandManufacturer) medicine.brandManufacturer = brandManufacturer;
    if (composition) medicine.composition = composition;
    if (purposes) {
      medicine.purposes = Array.isArray(purposes) ? purposes : purposes.split(',').map(p => p.trim());
    }
    if (sideEffects) {
      medicine.sideEffects = Array.isArray(sideEffects) ? sideEffects : sideEffects.split(',').map(s => s.trim());
    }
    if (stock !== undefined) medicine.stock = stock;
    if (dosage !== undefined) medicine.dosage = dosage;
    if (warnings !== undefined) medicine.warnings = warnings;

    const updatedMedicine = await medicine.save();

    res.json(updatedMedicine);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   DELETE /api/medicine/:id
// @desc    Delete medicine
// @access  Private (Pharmacy)
router.delete('/:id', protectPharmacy, async (req, res) => {
  try {
    const medicine = await Medicine.findById(req.params.id);

    if (!medicine) {
      return res.status(404).json({ message: 'Medicine not found' });
    }

    // Check if medicine belongs to this pharmacy
    if (medicine.pharmacyId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this medicine' });
    }

    await medicine.deleteOne();

    res.json({ message: 'Medicine deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

