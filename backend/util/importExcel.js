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
  catalogo: { type: String, required: false },
  model: { type: String, required: false },
  description: { type: String, required: false },  
  note: { type: String, required: false },
  quantity: { type: Number, required: false },
  serial_num: { type: String, required: false },
  ericsson: { type: String, required: false },
  location: { type: String, required: false },
  owner: { type: String, required: false },
  progetto: { type: String, required: false },
  data2: { type: String, required: false },
  imm_num: { type: String, required: false },
  imm_num_old: { type: String, required: false },
  comments: { type: String, required: false },
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
              catalogo: item['Catalogue'],
              model: item['Model'],
              description: item['Description'],
              note: item['Option/Note'],
              quantity: item['Quantity'],
              serial_num: item['Serial_Num'],
              ericsson: item['Ericsson'],
              location: item['Location'],
              owner: item['Owner'],
              progetto: item['Project'],
              data2: item['data2'],
              imm_num: item['imm_number'],
              imm_num_old: item['imm_number_old'],
              comments: item['comments'],
          });
          await instrument.save();
          console.log(`Instrument ${item['Description']} saved!`);
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

