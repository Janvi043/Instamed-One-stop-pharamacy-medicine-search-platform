const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Pharmacy = require('../models/Pharmacy');

// Protect routes - for both users and pharmacy owners
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Check if user exists
      let user = await User.findById(decoded.id);
      if (!user) {
        user = await Pharmacy.findById(decoded.id);
      }

      if (!user) {
        return res.status(401).json({ message: 'User not found' });
      }

      req.user = user;
      req.userType = decoded.userType; // 'user' or 'pharmacy'
      next();
    } catch (error) {
      console.error(error);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

// Protect routes - only for users
const protectUser = async (req, res, next) => {
  await protect(req, res, () => {
    if (req.userType !== 'user') {
      return res.status(403).json({ message: 'Access denied. User access only.' });
    }
    next();
  });
};

// Protect routes - only for pharmacy owners
const protectPharmacy = async (req, res, next) => {
  await protect(req, res, () => {
    if (req.userType !== 'pharmacy') {
      return res.status(403).json({ message: 'Access denied. Pharmacy owner access only.' });
    }
    next();
  });
};

module.exports = { protect, protectUser, protectPharmacy };

