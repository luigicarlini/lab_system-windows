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

export const bookInstrument = async (id, userId) => {
  console.log("bookInstrument: Attempting to book instrument with ID:", id);
  //const response = await axios.post(`${BASE_URL}/api/instruments/book`, { id, userId });
  const response = await axios.post(`${BASE_URL}/api/instruments/book/${id}`, { userId });
  return response.data;
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
