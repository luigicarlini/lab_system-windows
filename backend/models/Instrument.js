const mongoose = require('mongoose');

const instrumentSchema = new mongoose.Schema({
  // Existing fields
  catalogo: {
    type: String,
    required: false
  },
  model: {
    type: String,
    required: false
  },
  description: {  //instrumentName
    type: String,
    required: false
  },
  note: {
    type: String,
    required: false
  },
  quantity: {
    type: Number,
    required: false
  },
  serial_num: {
    type: String,
    required: false
  },
  ericsson: {
    type: String,
    required: false
  },
  location: {
    type: String,
    required: false
  },
  owner: {
    type: String,
    required: false
  },
  progetto:{
    type: String,
    required: false
  },
  data2:{
    type: String,
    required: false
  },
  imm_num:{
    type: String,
    required: false
  },
  imm_num_old:{
    type: String,
    required: false
  },
  comments:{
    type: String,
    required: false
  },
  // New fields for booking
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