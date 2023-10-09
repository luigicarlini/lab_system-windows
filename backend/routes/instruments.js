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

router.post("/book/:id", async (req, res) => {
  console.log("Entered the booking route handler");
  try {
    const { userid, bookedBy, bookedFrom, bookedUntil } = req.body;
    console.log("Complete req.body:", req.body);
    const instrumentId = req.params.id;

    console.log("Complete req.body:", req.body);
    //console.log('Complete req.params:', req.params);

    console.log("Userid:", req.body.userid);
    console.log("Booked by:", req.body.bookedBy);
    console.log("Booked from:", req.body.bookedFrom);
    console.log("Booked until:", req.body.bookedUntil);
    console.log("Instrument ID:", instrumentId);

    console.log(`Looking for user with ID: ${req.body.userid}`);
    const user = await User.findById(req.body.userid);
    if (!user) {
      console.error(`No user found for ID: ${req.body.userid}`);
      return res.status(404).json({ message: "User not found" });
    }
    console.log("Found user:", user);


    console.log(`Looking for instrument with ID: ${instrumentId}`);
    const instrument = await Instrument.findById(instrumentId);
    if (!instrument) {
      console.error(`No instrument found for ID: ${instrumentId}`);
      return res.status(404).json({ message: "Instrument not found" });
    }
    console.log("Found instrument:", instrument);


    if (user && instrument) {
      console.log("Entered the user && instrument check");
      console.log("Complete instrument:", instrument);
      console.log("Availability instrument:", instrument.availability);
      if (instrument.availability === true) {
        console.log("Enter Availability instrument:");
        instrument.availability = false;
        console.log("Availability instrument:", instrument.availability);
        instrument.bookedBy = req.body.userid;
        instrument.bookedFrom = req.body.bookedFrom; // Adjusted the property names
        instrument.bookedUntil = req.body.bookedUntil; // Adjusted the property names
        console.log("Booked by user ID:", instrument.bookedBy); // Using the user id
        console.log("Booked from:", instrument.bookedFrom);
        console.log("Booked until:", instrument.bookedUntil);
        await instrument.save();
        res
          .status(200)
          .json({ message: "Instrument booked successfully", instrument });
      } else {
        res.status(400).json({ message: "Instrument is already booked" });
      }
    } else {
      res.status(404).json({ message: "User or Instrument not found" });
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
