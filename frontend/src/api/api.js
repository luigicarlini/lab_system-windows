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
  console.log("bookInstrument: Attempting to move instrument to location:", bookingData.location);  // <-- New log
  
 try {
    console.log("Sending data to backend:", {
      userid: userid,
      bookedBy: bookingData.bookedBy,
      bookedFrom: bookingData.bookedFrom,
      bookedUntil: bookingData.bookedUntil,
      location: bookingData.location  // <-- Added the new location attribute
    });
      const response = await axios.post(`${BASE_URL}/api/instruments/book/${id}`, {
        userid: userid,
        bookedBy: bookingData.bookedBy,
        bookedFrom: bookingData.bookedFrom,
        bookedUntil: bookingData.bookedUntil,
        location: bookingData.location  // <-- Added the new location attribute
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

export const markInstrumentAsReturning = async (id, isReturning = true) => {
  console.log(`markInstrumentAsReturning: Attempting to set returning status for instrument with ID: ${id} to ${isReturning}`);
  try {
      const response = await axios.post(`${BASE_URL}/api/instruments/returning/${id}`, { returning: isReturning });
      return response.data;
  } catch (error) {
      console.error("Error during marking instrument as returning:", error);
      throw error;
  }
};

export const markInstrumentAsWaiting = async (id, isWaiting = true) => {
  console.log(`markInstrumentAsWaiting: Attempting to set waiting status for instrument with ID: ${id} to ${isWaiting}`);
  try {
      const response = await axios.post(`${BASE_URL}/api/instruments/waiting/${id}`, { waiting: isWaiting });
      return response.data;
  } catch (error) {
      console.error("Error during marking user as waiting:", error);
      throw error;
  }
};

export const markInstrumentAsReleased = async (id, isReleasing = false) => {
  console.log(`markInstrumentAsReleasing: Attempting to set releasing status for instrument with ID: ${id} to ${isReleasing}`);
  try {
      const response = await axios.post(`${BASE_URL}/api/instruments/releasing/${id}`, { releasing: isReleasing });
      return response.data;
  } catch (error) {
      console.error("Error during marking user as releasing:", error);
      throw error;
  }
};

export const markInstrumentAsCancelBooking = async (id, isWaiting = false, isReturning = false) => {
  console.log(`markInstrumentAsCancelBooking: Attempting to set waiting status for instrument with ID: ${id} to isWaiting= ${isWaiting} and isReturning= ${isReturning}`);
  try {
      const response = await axios.post(`${BASE_URL}/api/instruments/cancel/${id}`, { waiting: isWaiting, returning: isReturning });
      return response.data;
  } catch (error) {
      console.error("Error during marking user as canceling:", error);
      throw error;
  }
};

export const markInstrumentAsRejected = async (id, isRejecting = true) => {
  console.log(`markInstrumentAsRejecting: Attempting to set waiting status for instrument with ID: ${id} to isRejecting= ${isRejecting}`);
  try {
      const response = await axios.post(`${BASE_URL}/api/instruments/reject/${id}`, { rejecting: isRejecting });
      return response.data;
  } catch (error) {
      console.error("Error during marking user as rejecting:", error);
      throw error;
  }
};

export const markInstrumentRejectApproval = async (id, isRejectingApproval = true) => {
  console.log(`markInstrumentRejectingApproval: Attempting to set rejectingapproval status for instrument with ID: ${id} to isRejectingApproval= ${isRejectingApproval}`);
  try {
      const response = await axios.post(`${BASE_URL}/api/instruments/rejectapproval/${id}`, { rejectingapproval: isRejectingApproval });
      return response.data;
  } catch (error) {
      console.error("Error during marking user as rejectingApproval:", error);
      throw error;
  }
};


// Default export containing all functions
const api = {
  getAllInstruments,
  bookInstrument,
  releaseInstrument,
  getInstrumentStatus,
  markInstrumentAsReturning,    // <-- Added
  markInstrumentAsWaiting,      // <-- Added
  markInstrumentAsCancelBooking,// <-- Added
  markInstrumentAsRejected,     // <-- Added
  markInstrumentAsReleased,     // <-- Added
  markInstrumentRejectApproval
};

export default api;
// Add more API utility functions as needed