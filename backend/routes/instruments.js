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
    //const { userid, bookedBy, bookedFrom, bookedUntil } = req.body;
    // Extracting booking details including the new location from the request body
    const { userid, bookedBy, bookedFrom, bookedUntil, location } = req.body;
    
    console.log("Complete req.body:", req.body);
    const instrumentId = req.params.id;

    console.log("Complete req.body:", req.body);
    //console.log('Complete req.params:', req.params);

    console.log("Userid:", req.body.userid);
    console.log("Booked by:", req.body.bookedBy);
    console.log("Booked from:", req.body.bookedFrom);
    console.log("Booked until:", req.body.bookedUntil);
    console.log("Instrument ID:", instrumentId);
    console.log("location:", req.body.location);


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
        // Store the current instrument location as originalLocation
        instrument.originalLocation = instrument.location;  // Update location with the new location provided in the request
        instrument.location = req.body.location;  // Assuming 'location' is the name of the attribute sent from the frontend
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

router.post('/release/:id', async (req, res) => {
  console.log("Entered the release handler");
  try {
    const { id, userid } = req.body;
    console.log("Complete req.body:", req.body);
    console.log("Userid:", userid);
    console.log("Instrument ID:", id);

    console.log(`Looking for user with ID: ${userid}`);
    const user = await User.findById(userid);
    if (!user) {
      console.error(`No user found for ID: ${userid}`);
      return res.status(404).json({ message: "User not found" });
    }
    console.log("Found user:", user);


    console.log(`Looking for instrument with ID: ${id}`);
    const instrument = await Instrument.findById(id);
    if (!instrument) {
      console.error(`No instrument found for ID: ${id}`);
      return res.status(404).json({ message: "Instrument not found" });
    }
    console.log("Found instrument:", instrument);

    if (user && instrument) {
      console.log("Release: Entered the user && instrument check");
      console.log("Complete instrument:", instrument);
      console.log("Availability instrument:", instrument.availability);
      if (instrument.availability === false) {
        console.log("Enter Availability instrument:");
        instrument.availability = true;
        console.log("Availability instrument:", instrument.availability);
        // Revert the location back to originalLocation
        if (instrument.originalLocation) {
            instrument.location = instrument.originalLocation;
        }
        // Clear the originalLocation attribute        
        instrument.originalLocation = null;
        instrument.bookedBy = null;
        instrument.bookedFrom = null; // Adjusted the property names
        instrument.bookedUntil = null; // Adjusted the property names
        instrument.returning = false;
        instrument.waiting = false;
        instrument.rejecting = false;
        await instrument.save();
        res
          .status(200)
          .json({ message: "Instrument released successfully", instrument });
      } else {
        res.status(400).json({ message: "Instrument is already released" });
      }
    } else {
      res.status(404).json({ message: "User or Instrument not found" });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Route to toggle an instrument's "returning" status
router.post('/returning/:id', async (req, res) => {
  try {
    const instrument = await Instrument.findById(req.params.id);
    if (!instrument) {
        return res.status(404).json({ message: "Instrument not found" });
    }
    // Toggle the 'returning' status based on the request body
    // If 'returning' is not provided in the request, default to true
    console.log("backend instrument.returning:", req.body.returning);
    instrument.returning = req.body.returning; // This should be set according to what was passed in the request body
    console.log("backend instrument.returning:", instrument.returning);
    //instrument.waiting = false;
    //instrument.waiting = instrument.returning === true ? false : true;
    console.log("backend instrument.waiting:", instrument.waiting);
    await instrument.save();
    res.status(200).json({ message: `Instrument marked as ${instrument.returning ? 'returning' : 'not returning'}`, instrument });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Route for a user to toggle the "waiting" status for an instrument
router.post('/waiting/:id', async (req, res) => {
  try {
    const instrument = await Instrument.findById(req.params.id);
    if (!instrument) {
        return res.status(404).json({ message: "Instrument not found" });
    }
    // Toggle the 'waiting' status based on the request body
    // If 'waiting' is not provided in the request, default to true
    console.log("backend instrument.waiting:", req.body.waiting);
    instrument.waiting = req.body.waiting;
    //instrument.waiting = req.body.waiting !== undefined ? req.body.waiting : true;
    console.log("backend instrument.waiting:", instrument.waiting);
    instrument.returning = false;
    instrument.releasing = false;
    //instrument.returning = instrument.waiting === true ? false : true;
    console.log("backend instrument.returning:", instrument.returning);
    await instrument.save();
    res.status(200).json({ message: `User marked as ${instrument.waiting ? 'waiting for' : 'not waiting for'} instrument`, instrument });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Route for a user to toggle the "waiting" status for an instrument
router.post('/releasing/:id', async (req, res) => {
  try {
    const instrument = await Instrument.findById(req.params.id);
    if (!instrument) {
        return res.status(404).json({ message: "Instrument not found" });
    }
    // If 'releasing' is not provided in the request, default to false
    console.log("backend instrument.releasing:", req.body.releasing);
    instrument.releasing = req.body.releasing;
    console.log("backend instrument.releasing:", instrument.releasing);
    await instrument.save();
    res.status(200).json({ message: `User marked as ${instrument.releasing ? 'releasing for' : 'not releasing for'} instrument`, instrument });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Route for a user to toggle the "cancel" the booking for an instrument
router.post('/cancel/:id', async (req, res) => {
  try {
    const instrument = await Instrument.findById(req.params.id);
    if (!instrument) {
        return res.status(404).json({ message: "Instrument not found" });
    }
    // Toggle the 'waiting' status based on the request body
    // If 'waiting' is not provided in the request, default to true
    console.log("backend instrument.waiting:", req.body.waiting);
    console.log("backend instrument.waiting:", req.body.returning);
    instrument.waiting = req.body.waiting;
    instrument.returning = req.body.returning;
    instrument.originalLocation = null;
    instrument.bookedBy = null;
    instrument.bookedFrom = null; // Adjusted the property names
    instrument.bookedUntil = null; // Adjusted the property names
    instrument.returning = false;
    instrument.waiting = false;
    instrument.rejecting = false;
    await instrument.save();
    res.status(200).json({ 
      message: `User booking canceled for instrument. Waiting: ${instrument.waiting}, Returning: ${instrument.returning}`, 
      instrument 
  });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Route for a user to toggle the "cancel" the booking for an instrument
router.post('/reject/:id', async (req, res) => {
  try {
    const instrument = await Instrument.findById(req.params.id);
    if (!instrument) {
        return res.status(404).json({ message: "Instrument not found" });
    }
    // Toggle the 'waiting' status based on the request body
    // If 'waiting' is not provided in the request, default to true
    console.log("backend instrument.rejecting:", req.body.rejecting);

    instrument.rejecting = req.body.rejecting;
    instrument.waiting = false;
    instrument.returning = false;
    if (!instrument.rejecting) {
      instrument.originalLocation = null;
      instrument.bookedBy = null;
      instrument.bookedFrom = null; // Adjusted the property names
      instrument.bookedUntil = null; // Adjusted the property names
    }
    await instrument.save();
    res.status(200).json({ 
      message: `User booking rejected for instrument. Waiting: ${instrument.waiting}, Returning: ${instrument.returning}, Rejecting: ${instrument.rejecting}`, 
      instrument 
  });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// ... other CRUD routes (e.g., POST for creating a new instrument, PUT for updating, DELETE for removing)

module.exports = router;
