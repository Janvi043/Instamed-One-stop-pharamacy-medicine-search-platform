const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide medicine name'],
    trim: true,
    index: true
  },
  brandManufacturer: {
    type: String,
    required: [true, 'Please provide brand/manufacturer'],
    trim: true
  },
  composition: {
    type: String,
    default: ''
  },
  purposes: {
    type: [String],
    required: [true, 'Please provide purposes'],
    default: []
  },
  sideEffects: {
    type: [String],
    required: [true, 'Please provide side effects'],
    default: []
  },
  dosage: {
    type: String,
    default: ''
  },
  warnings: {
    type: String,
    default: ''
  },
  pharmacyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pharmacy',
    required: [true, 'Please provide pharmacy ID']
  },
  stock: {
    type: Number,
    required: [true, 'Please provide stock quantity'],
    min: 0,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  searchCount: {
    type: Number,
    default: 0
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
medicineSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

// Index for search
medicineSchema.index({ name: 'text', brandManufacturer: 'text', purposes: 'text' });

module.exports = mongoose.model('Medicine', medicineSchema);

