const mongoose = require('mongoose');

const instrumentSchema = new mongoose.Schema({
  // Existing fields
  instrumentName: {
    type: String,
    required: true
  },
  manufacturer: {
    type: String,
    required: true
  },
  model: {
    type: String,
    required: true
  },
  frequencyRange: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  availability: {
    type: Boolean,
    required: true,
    default: true
  },
  // New fields for booking
  bookedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  bookedFrom: {
    type: Date,
    default: null
  },
  bookedUntil: {
    type: Date,
    default: null
  }
});

module.exports = mongoose.model('Instrument', instrumentSchema);
