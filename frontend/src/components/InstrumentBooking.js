import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import UserContext from '../context/UserContext';
// import { UserContext } from '../context/UserContext';
import api from '../api/api';

const BASE_URL = process.env.REACT_APP_BACKEND_URL;

function InstrumentBooking() {
  const { instrumentId } = useParams();
  const { user } = useContext(UserContext);
  const [instrument, setInstrument] = useState(null);
  const [bookingData, setBookingData] = useState({
    startDate: '',
    endDate: '',
  });
  
  // Fetch instrument details when the component mounts
  useEffect(() => {
    api.get(`${BASE_URL}/instruments/${instrumentId}`) //Replace hardcoded URLs http://localhost:5000 with the BASE_URL.
      .then(response => {
        setInstrument(response.data);
      })
      .catch(error => {
        console.error('Error fetching instrument details:', error);
      });
  }, [instrumentId]);
  
  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setBookingData({
      ...bookingData,
      [name]: value,
    });
  };
  
  const handleBooking = () => {
    api.post(`${BASE_URL}/instruments/book/${instrumentId}`, { ///Replace hardcoded URLs http://localhost:5000 with the BASE_URL.
    //api.post(`${BASE_URL}/instruments/book`, {..., instrumentId: instrumentId})
      userId: user._id,
      startDate: bookingData.startDate,
      endDate: bookingData.endDate,
    })
    .then(response => {
      alert('Instrument successfully booked!');
      // Refresh instrument data to reflect new booking status
      setInstrument(response.data);
    })
    .catch(error => {
      console.error('Error booking instrument:', error);
    });
  };
  
  return (
    <div>
      {instrument ? (
        <>
          <h1>{instrument.name}</h1>
          <p>Status: {instrument.status}</p>
          <p>Current User: {instrument.currentUser ? instrument.currentUser.name : 'None'}</p>
          
          {/* Booking form */}
          <form>
            <label>
              Start Date:
              <input type="date" name="startDate" onChange={handleInputChange} />
            </label>
            <label>
              End Date:
              <input type="date" name="endDate" onChange={handleInputChange} />
            </label>
            <button type="button" onClick={handleBooking}>Book Instrument</button>
          </form>
        </>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}

export default InstrumentBooking;
