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

// const last_calibration = new Date(); // Replace this with your retrieved date
// const last_calibr = last_calibration.toLocaleDateString('en-GB'); // 'en-GB' represents the 'dd/mm/yyyy' format
// const due_calibration = new Date(); // Replace this with your retrieved date
// const due_calibr = due_calibration.toLocaleDateString('en-GB'); // 'en-GB' represents the 'dd/mm/yyyy' format

// Define Mongoose schema and model
const InstrumentSchema = new mongoose.Schema({
  censimento: { type: String, required: false },
  description: { type: String, required: false },
  producer: { type: String, required: false },  
  model: { type: String, required: false },
  equipment: { type: String, required: false },
  accessories: { type: String, required: false },
  quantity: { type: String, required: false },
  serial_number: { type: String, required: false },
  last_calibration: { type: String, required: false },
  due_calibration: { type: String, required: false },
  ip_address: { type: String, required: false },
  location: { type: String, required: false },
  location_description: { type: String, required: false },
  location_inside_room: { type: String, required: false },
  project: { type: Number, required: false },
  reference_people: { type: Number, required: false },
  test_bench_number: { type: Number, required: false },
  notes: { type: Number, required: false },
  HCL_serial_number: { type: Number, required: false },
  property: { type: Number, required: false },
  
});

//const Instrument = mongoose.model('Instrument', InstrumentSchema);

// Function to convert Excel date serial number to "dd/mm/yyyy" string
// const excelDateToString = (excelDate) => {
//   const date = new Date(Date.UTC(1899, 11, 30)); // Excel's date epoch
//   date.setDate(date.getDate() + excelDate);
//   const day = date.getUTCDate().toString().padStart(2, '0');
//   const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
//   const year = date.getUTCFullYear();
//   return `${day}/${month}/${year}`;
// };

const excelDateToString = (excelDate) => {
    const date = new Date(Date.UTC(1899, 11, 30)); // Excel's date epoch
    date.setDate(date.getDate() + excelDate);
  
    // Adjust for months with 30 and 31 days
    const day = date.getUTCDate();
    const month = date.getUTCMonth() + 1;
    const year = date.getUTCFullYear();
  
    if (day === 31 && (month === 4 || month === 6 || month === 9 || month === 11)) {
      // Handle months with 30 days and day 31
      return `30/${month.toString().padStart(2, '0')}/${year}`;
    } else if (month === 2 && day === 29 && !isLeapYear(year)) {
      // Handle February in non-leap years
      return `28/${month.toString().padStart(2, '0')}/${year}`;
    } else {
      // Default case
      return `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}/${year}`;
    }
  };
  
  // Function to check if a year is a leap year
  const isLeapYear = (year) => {
    return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
  };

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
        const lastCalibration = excelDateToString(item['Last calibration Date']);
        const dueCalibration = excelDateToString(item['Calibration Due Date']);
        const instrument = new Instrument({
          censimento: item["NUMERO PROGRESSIVO CENSIMENTO"],
          description: item["Short Description"],
          producer: item["Equipment Producer"],
          model: item["Model"],
          equipment: item["Equipment Description"],
          accessories: item["SW Options / Accessories"],
          quantity: item["Quantity"],
          serial_number: item["Producer Serial Number"],
          //last_calibration: item["Last calibration Date"],
          //due_calibration: item["Calibration Due Date"],
          last_calibration: lastCalibration,
          due_calibration: dueCalibration,
          ip_address: item["IP ADDRESS (if available)"],
          location: item["Room Site Number"],
          location_description: item["Room Site Description"],
          location_inside_room: item["Location inside the Room"],
          project: item["Project Description"],
          reference_people: item["Project Reference People"],
          test_bench_number: item["Test Bench Number and/or Description"],
          notes: item["Notes and comments"],
          HCL_serial_number: item["HCL Serial numer / Internal coding"],
          property: item["PROPERTY  (who buyed the equipment)"],
        });
        console.log(`Instrument ${item["Short Description"]} saved!`);
        await instrument.save();
        console.log(`Instrument ${item["Short Description"]} saved!`);
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
