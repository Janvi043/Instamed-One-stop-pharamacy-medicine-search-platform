const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protectUser } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

// @route   GET /api/user/profile
// @desc    Get user profile
// @access  Private (User)
router.get('/profile', protectUser, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/user/profile
// @desc    Update user profile
// @access  Private (User)
router.put('/profile', protectUser, [
  body('name').optional().trim().notEmpty(),
  body('phoneNumber').optional().trim().notEmpty(),
  body('email').optional().isEmail()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, phoneNumber, email } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update fields
    if (name) user.name = name;
    if (phoneNumber) user.phoneNumber = phoneNumber;
    if (email) user.email = email;

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      userId: updatedUser.userId,
      email: updatedUser.email,
      phoneNumber: updatedUser.phoneNumber
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/user/change-password
// @desc    Change user password
// @access  Private (User)
router.put('/change-password', protectUser, [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id);

    if (!(await user.matchPassword(currentPassword))) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});
// @route   POST /api/user/save-search
// @desc    Save a search query to user history
// @access  Private (User)
router.post('/save-search', protectUser, async (req, res) => {
  try {
    const { query, type } = req.body;
    console.log(`📥 Saving search: "${query}" (${type}) for user: ${req.user.userId}`);

    const user = await User.findById(req.user._id);

    if (!user) {
      console.error('❌ User not found in save-search');
      return res.status(404).json({ message: 'User not found' });
    }

    // Initialize if it doesn't exist
    if (!user.searchHistory) {
      user.searchHistory = [];
    }

    // De-duplicate: Remove existing entry with same query and type
    user.searchHistory = user.searchHistory.filter(
      item => !(item.query.toLowerCase() === query.toLowerCase() && item.type === type)
    );

    // Add to history (at the beginning)
    user.searchHistory.unshift({ query, type });

    // Limit history to 20 items
    if (user.searchHistory.length > 20) {
      user.searchHistory = user.searchHistory.slice(0, 20);
    }

    await user.save();
    console.log('✅ Search history saved successfully. Total items:', user.searchHistory.length);
    res.status(201).json(user.searchHistory);
  } catch (error) {
    console.error('❌ Error in /save-search:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/user/search-history
// @desc    Get user search history
// @access  Private (User)
router.get('/search-history', protectUser, async (req, res) => {
  try {
    console.log(`📤 Fetching search history for user: ${req.user.userId}`);
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    console.log(`✅ Found ${user.searchHistory ? user.searchHistory.length : 0} history items`);
    res.json(user.searchHistory || []);
  } catch (error) {
    console.error('❌ Error in /search-history:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

