import React, { useState } from "react";
import Modal from "react-modal";
import { useNavigate } from "react-router-dom";
// import DatePicker from "react-datepicker";
// import "react-datepicker/dist/react-datepicker.css";
import "./InstrumentList.css";

// Define a function to check if a date string is valid
function isValidDate(dateString) {
  const date = new Date(dateString);
  return !isNaN(date);
}

const BookingModal = ({
  isOpen,
  onRequestClose,
  onSubmitBooking,
  setIsModalOpen,
}) => {
  const [bookingData, setBookingData] = useState({
    bookedFrom: "",
    bookedUntil: "",
  });

  const navigate = useNavigate();
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error] = useState(""); // To store and display errors
  const [showDateWarning, setShowDateWarning] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBookingData((prevData) => ({ ...prevData, [name]: value }));
    // Once the user starts to input data, hide the warning.
    setShowDateWarning(false);
  };

  const handleSubmit = async () => {
    // Check if dates are set
    if (!bookingData.bookedFrom || !bookingData.bookedUntil) {
      setShowDateWarning(true);
      return; // Exit the function early.
    }

    const fromDate = new Date(bookingData.bookedFrom);
    const toDate = new Date(bookingData.bookedUntil);
    const today = new Date();

    if (fromDate <= today) {
      setShowDateWarning(true);
      return; // Exit the function early.
    }

    if (fromDate > toDate) {
      setShowDateWarning(true);
      return; // Exit the function early.
    }
  
    try {
      setIsLoading(true);
      setTimeout(async () => {
        await onSubmitBooking(bookingData);
        setBookingSuccess(true);
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error("Booking failed:", error);
      // Optionally handle user feedback for booking failure here
    }
  };

  const handleNavigate = () => {
    setIsModalOpen(false);
    navigate("/instruments");
    setBookingSuccess(false);
  };

  const handleModalClose = () => {
    onRequestClose();
    setBookingSuccess(false);
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={handleModalClose}
      contentLabel="Book Instrument Modal"
    >
      <h2 style={{ fontWeight: "bold", fontSize: "1.4em" }}>Book Instrument</h2>
      {bookingSuccess ? (
        <>
          <p style={{ fontWeight: "bold", color: "green" }}>
            Booking Successful!
          </p>
          <button onClick={handleNavigate}>Return to Instrument List</button>
        </>
      ) : (
        <>
          <br />
          <label style={{ fontWeight: "bold", fontSize: "1.2em" }}>
            Booked from:
            <input
              type="date"
              name="bookedFrom"
              value={
                isValidDate(bookingData.bookedFrom)
                  ? new Date(bookingData.bookedFrom).toISOString().slice(0, 10)
                  : ""
              }
              onChange={handleInputChange}
              className="calendar-input"
            />
          </label>
          <br />
          <label style={{ fontWeight: "bold", fontSize: "1.2em" }}>
            Booked until:
            <input
              type="date"
              name="bookedUntil"
              value={
                isValidDate(bookingData.bookedUntil)
                  ? new Date(bookingData.bookedUntil).toISOString().slice(0, 10)
                  : ""
              }
              onChange={handleInputChange}
              className="calendar-input"
            />
          </label>
          <br />
          {showDateWarning && (
            <p style={{ color: "red", fontWeight: "bold" }}>
              Please insert valid dates ("Booking from" from Today, "Booking from" before "Booking Until").
            </p>
          )}
          {error && <p style={{ color: "red", fontWeight: "bold" }}>{error}</p>}
          <div>
            {isLoading && (
              <div className="loading-container">
                <div className="spinner"></div>
                <span className="loading-text">Booking...</span>
              </div>
            )}
            <button onClick={handleSubmit}>Submit Booking</button>
          </div>
          <button onClick={handleModalClose}>Close</button>
        </>
      )}
    </Modal>
  );
};

export default BookingModal;
