// You can use packages like papaparse for CSV or xlsx for Excel to read the data.
// First, install the package: npm install xlsx: npm install xlsx

const XLSX = require('xlsx');
const mongoose = require('mongoose');
const path = require('path');
//const Instrument = require('../models/instrument');
// This will work on Windows, Linux, macOS, or any platform supported by Node.js
const Instrument = require(path.join(__dirname, '..', 'models', 'Instrument'));


// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/instrumentDB', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// Define Mongoose schema and model
const InstrumentSchema = new mongoose.Schema({
  instrumentName: { type: String, required: true },
  manufacturer: { type: String, required: true },
  model: { type: String, required: true },
  frequencyRange: { type: String, required: true },
  description: { type: String, required: true },
  availability: { type: Boolean, required: true }
});

// const InstrumentModel = mongoose.model('Instrument', InstrumentSchema);

// Read Excel file
//const workbook = XLSX.readFile('./lab_instruments.xlsx');
const filePath = path.join(__dirname, 'lab_instruments.xlsx');
const workbook = XLSX.readFile(filePath);
const worksheet = workbook.Sheets[workbook.SheetNames[0]];
// Convert sheet to JSON
const data = XLSX.utils.sheet_to_json(worksheet);


// Using async/await with Promise.all() to handle asynchronous operations
const saveData = async () => {
  const promises = data.map(async (item) => {
      try {
          const instrument = new Instrument({
              instrumentName: item['Instrument Name'],
              manufacturer: item['Manufacturer'],
              model: item['Model'],
              frequencyRange: item['Frequency Range'],
              description: item['Description'],
              availability: item['Availability'].toLowerCase() === 'yes'
          });
          await instrument.save();
          console.log(`Instrument ${item['Instrument Name']} saved!`);
      } catch (error) {
          console.error('Error saving instrument:', error.message);
      }
  });

  await Promise.all(promises);
  mongoose.disconnect();
};

saveData();

// Close the MongoDB connection once everything's done
// setTimeout(() => mongoose.disconnect(), 5000); 

// To run the import script, execute node util/importExcel.js.
// 1) Open the Terminal or Command Prompt: Navigate to the root directory of your backend project where your importExcel.js file resides
// 2) Execute the Script: Run the following command in the terminal: node util/importExcel.js
// 3) Check the Console: After running the script, you should see a message like "Data imported" if everything goes well.
// 4) If there's an error, it will print "Data import failed" along with the error details.
