const mongoose = require('mongoose');

const instrumentSchema = new mongoose.Schema({
  // Existing fields
  censimento: {
    type: String,
    required: false
  },
  description: { //instrumentName
    type: String,
    required: false
  },
  producer: {
    type: String,
    required: false
  },
  model: {
    type: String,
    required: false
  },
  equipment: {
    type: String,
    required: false
  },
  accessories: {
    type: String,
    required: false
  },
  quantity: {
    type: String,
    required: false
  },
  serial_number: {
    type: String,
    required: false
  },
  materiale_ericsson: {
    type: String,
    required: false
  },
  location: {
    type: String,
    required: false
  },
  last_calibration: {
    type: String,
    required: false
  },
  due_calibration: {
    type: String,
    required: false
  },
  ip_address: {
    type: String,
    required: false
  },
  room_site_number: {
    type: String,
    required: false
  },
  room_site_description: {
    type: String,
    required: false
  },
  location_inside_room: {
    type: String,
    required: false
  },
  project: {
    type: String,
    required: false
  },
  reference_people: {
    type: String,
    required: false
  },
  test_bench_number: {
    type: String,
    required: false
  },
  notes: {
    type: String,
    required: false
  },
  HCL_serial_number: {
    type: String,
    required: false
  },
  property: {
    type: String,
    required: false
  },
  // New fields for booking
  originalLocation: {
    type: String,
    trim: true,
  },
  returning: {
    type: Boolean,
    default: false
  },
  waiting: {
    type: Boolean,
    default: false
  },
  availability: {
    type: Boolean,
    required: true,
    default: true
  },
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