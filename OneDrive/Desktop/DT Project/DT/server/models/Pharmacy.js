const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const pharmacySchema = new mongoose.Schema({
  pharmacyName: {
    type: String,
    required: [true, 'Please provide pharmacy name'],
    trim: true
  },
  pharmacyType: {
    type: String,
    enum: ['independent', 'chain'],
    required: [true, 'Please select pharmacy type'],
    default: 'independent'
  },
  ownerName: {
    type: String,
    required: [true, 'Please provide owner name'],
    trim: true
  },
  npiNumber: {
    type: String,
    required: [true, 'Please provide NPI number'],
    unique: true,
    trim: true
  },
  licenseNumber: {
    type: String,
    required: [true, 'Please provide license number'],
    unique: true,
    trim: true
  },
  address: {
    type: String,
    required: [true, 'Please provide address'],
    trim: true
  },
  phoneNumber: {
    type: String,
    required: [true, 'Please provide phone number'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please provide email'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  userId: {
    type: String,
    required: [true, 'Please provide a user ID'],
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 6
  },
  location: {
    latitude: {
      type: Number,
      default: 0
    },
    longitude: {
      type: Number,
      default: 0
    }
  },
  openHours: {
    type: String,
    default: '8:00 AM - 10:00 PM'
  },
  status: {
    type: String,
    enum: ['Open', 'Closed'],
    default: 'Open'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
pharmacySchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare password
pharmacySchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('Pharmacy', pharmacySchema);

