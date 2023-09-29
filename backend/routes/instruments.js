const express = require('express');
const router = express.Router();
const path = require('path');

// This will work on Windows, Linux, macOS, or any platform supported by Node.js
const Instrument = require(path.join(__dirname, '..', 'models', 'Instrument'));
const User = require(path.join(__dirname, '..', 'models', 'User'));

// GET /instruments: Retrieve all instruments
router.get('/', async (req, res) => {
  try {
    const instruments = await Instrument.find().populate('bookedBy', 'username');
    res.json(instruments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /instruments/:id: Retrieve a single instrument
router.get('/:id', async (req, res) => {
  try {
    const instrument = await Instrument.findById(req.params.id).populate('bookedBy', 'username');
    if (instrument) {
      res.json(instrument);
    } else {
      res.status(404).json({ message: 'Instrument not found' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /instruments/book: Book an instrument
router.post('/book/:id', async (req, res) => {
  try {
    const { userId, from, until } = req.body;
    const instrumentId = req.params.id;
    const user = await User.findById(userId);
    const instrument = await Instrument.findById(instrumentId);

    if (user && instrument) {
      if (instrument.availability === 'available') {
        instrument.availability = 'booked';
        instrument.bookedBy = user._id;
        instrument.bookedFrom = from;
        instrument.bookedUntil = until;
        await instrument.save();
        res.status(200).json({ message: 'Instrument booked successfully', instrument });
      } else {
        res.status(400).json({ message: 'Instrument is already booked' });
      }
    } else {
      res.status(404).json({ message: 'User or Instrument not found' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/release', async (req, res) => {  // new endpoint
  const { instrumentId } = req.body;
  const instrument = await Instrument.findById(instrumentId);
  if (!instrument) {
    return res.status(404).json({ message: 'Instrument not found' });
  }
  if (instrument.availability) {
    return res.status(400).json({ message: 'Instrument is not booked' });
  }
  instrument.availability = true;
  instrument.bookedBy = null;
  instrument.bookedFrom = null;
  instrument.bookedUntil = null;
  await instrument.save();
  res.status(200).json({ message: 'Instrument released successfully' });
});

// ... other CRUD routes (e.g., POST for creating a new instrument, PUT for updating, DELETE for removing)

module.exports = router;
