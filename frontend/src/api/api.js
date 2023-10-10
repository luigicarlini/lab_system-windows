// API Utilities: 
// Create utility functions for new backend functionalities like booking, getting status, and finding out who booked an instrument.
// API Utilities: src/api/api.js
import axios from 'axios';

const BASE_URL = process.env.REACT_APP_BACKEND_URL;

export const getAllInstruments = async () => {
  console.log("getAllInstruments: Attempting to get all instrument");
  const response = await axios.get(`${BASE_URL}/api/instruments`);
  return response.data;
};

export const bookInstrument = async (id, userid, bookingData) => {  
  console.log("bookInstrument: Attempting to book instrument with ID:", id);
  console.log("bookInstrument: Attempting to book instrument with UserId:", userid);
  console.log("bookInstrument: Attempting to book instrument with User:", bookingData.bookedBy);
  console.log("bookInstrument: Attempting to book instrument with startDate:", bookingData.bookedFrom);
  console.log("bookInstrument: Attempting to book instrument with endDate:", bookingData.bookedUntil);
  
 try {
    console.log("Sending data to backend:", {
      userid: userid,
      bookedBy: bookingData.bookedBy,
      bookedFrom: bookingData.bookedFrom,
      bookedUntil: bookingData.bookedUntil
    });
      const response = await axios.post(`${BASE_URL}/api/instruments/book/${id}`, {
        userid: userid,
        bookedBy: bookingData.bookedBy,
        bookedFrom: bookingData.bookedFrom,
        bookedUntil: bookingData.bookedUntil
      });
 
      return response.data;
  } catch (error) {
      console.error("Error during booking:", error);
      // handle error appropriately, maybe return a specific error object or throw an error
      throw error; 
  }
};

export const releaseInstrument = async (userid, id) => { 
  try {
    console.log("Sending data to backend:", {
      userid: userid,
      id: id
     });
      const response = await axios.post(`${BASE_URL}/api/instruments/release/${id}`, {
        userid: userid,
        id: id
      });
 
      return response.data;
  } catch (error) {
      console.error("Error during release:", error);
      // handle error appropriately, maybe return a specific error object or throw an error
      throw error; 
  }
};

export const getInstrumentStatus = async (id) => {
  console.log("getInstrumentStatus: Attempting to get all instrument");
  const response = await axios.get(`${BASE_URL}/api/instruments/${id}`);
  return response.data;
};

// Default export containing all functions
const api = {
  getAllInstruments,
  bookInstrument,
  getInstrumentStatus
};

export default api;
// Add more API utility functions as needed