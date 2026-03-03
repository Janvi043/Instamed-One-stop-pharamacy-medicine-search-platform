const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Pharmacy = require('../models/Pharmacy');
const generateToken = require('../utils/generateToken');
const { body, validationResult } = require('express-validator');

// @route   POST /api/auth/user/register
// @desc    Register a new user
// @access  Public
router.post('/user/register', [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('userId').trim().notEmpty().withMessage('User ID is required'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('phoneNumber').trim().notEmpty().withMessage('Phone number is required'),
  body('password').trim().isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('confirmPassword').trim().custom((value, { req }) => {
    // After trim, the password will be in req.body.password
    const password = req.body.password;
    if (value !== password) {
      throw new Error('Passwords do not match');
    }
    return true;
  })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, userId, email, phoneNumber, password } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ $or: [{ userId }, { email }] });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this ID or email' });
    }

    // Create user
    const user = await User.create({
      name,
      userId,
      email,
      phoneNumber,
      password
    });

    console.log('✅ User created successfully:', user);

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        userId: user.userId,
        email: user.email,
        phoneNumber: user.phoneNumber,
        token: generateToken(user._id, 'user')
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message || error });
  }
});

// @route   POST /api/auth/user/login
// @desc    Login user
// @access  Public
router.post('/user/login', [
  body('username').trim().notEmpty().withMessage('Username is required'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, password } = req.body;

    // Find user by userId or email
    const user = await User.findOne({
      $or: [{ userId: username }, { email: username }]
    });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        userId: user.userId,
        email: user.email,
        phoneNumber: user.phoneNumber,
        token: generateToken(user._id, 'user')
      });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});
// @route   POST /api/auth/pharmacy/register
// @desc    Register a new pharmacy
// @access  Public
router.post('/pharmacy/register', [
  body('pharmacyName').trim().notEmpty().withMessage('Pharmacy name is required'),
  body('pharmacyType').isIn(['independent', 'chain']).withMessage('Please select valid pharmacy type'),
  body('ownerName').trim().notEmpty().withMessage('Owner name is required'),
  body('npiNumber').trim().notEmpty().withMessage('NPI number is required'),
  body('licenseNumber').trim().notEmpty().withMessage('License number is required'),
  body('address').trim().notEmpty().withMessage('Address is required'),
  body('phoneNumber').trim().notEmpty().withMessage('Phone number is required'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('userId').trim().notEmpty().withMessage('User ID is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('Passwords do not match');
    }
    return true;
  })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { pharmacyName, pharmacyType, ownerName, npiNumber, licenseNumber, address, phoneNumber, email, userId, password, location } = req.body;

    console.log('📝 Pharmacy registration payload:', {
      pharmacyName,
      address,
      location: location,
      coordinates: location ? `${location.latitude}, ${location.longitude}` : 'none'
    });

    // Check if pharmacy already exists
    const pharmacyExists = await Pharmacy.findOne({ 
      $or: [{ userId }, { email }, { npiNumber }, { licenseNumber }] 
    });
    if (pharmacyExists) {
      return res.status(400).json({ message: 'Pharmacy already exists with this information' });
    }

    // Create pharmacy
    const pharmacy = await Pharmacy.create({
      pharmacyName,
      pharmacyType,
      ownerName,
      npiNumber,
      licenseNumber,
      address,
      phoneNumber,
      email,
      userId,
      password,
      location: location || { latitude: 0, longitude: 0 }
    });

    console.log('✅ Pharmacy created successfully:', {
      name: pharmacy.pharmacyName,
      location: pharmacy.location,
      address: pharmacy.address
    });

    if (pharmacy) {
      res.status(201).json({
        _id: pharmacy._id,
        pharmacyName: pharmacy.pharmacyName,
        pharmacyType: pharmacy.pharmacyType,
        ownerName: pharmacy.ownerName,
        npiNumber: pharmacy.npiNumber,
        licenseNumber: pharmacy.licenseNumber,
        address: pharmacy.address,
        phoneNumber: pharmacy.phoneNumber,
        email: pharmacy.email,
        userId: pharmacy.userId,
        location: pharmacy.location,
        token: generateToken(pharmacy._id, 'pharmacy')
      });
    } else {
      res.status(400).json({ message: 'Invalid pharmacy data' });
    }
  } catch (error) {
    console.error('Pharmacy Registration Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message || error });
  }
});
// @route   POST /api/auth/pharmacy/login
// @desc    Login pharmacy owner
// @access  Public
router.post('/pharmacy/login', [
  body('userId').trim().notEmpty().withMessage('User ID is required'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { userId, password } = req.body;

    // Find pharmacy by userId
    const pharmacy = await Pharmacy.findOne({ userId });

    if (pharmacy && (await pharmacy.matchPassword(password))) {
      res.json({
        _id: pharmacy._id,
        pharmacyName: pharmacy.pharmacyName,
        pharmacyType: pharmacy.pharmacyType,
        ownerName: pharmacy.ownerName,
        userId: pharmacy.userId,
        email: pharmacy.email,
        address: pharmacy.address,
        phoneNumber: pharmacy.phoneNumber,
        location: pharmacy.location,
        token: generateToken(pharmacy._id, 'pharmacy')
      });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

