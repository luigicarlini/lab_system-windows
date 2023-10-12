import React, { useState } from "react";
import Modal from "react-modal";
import { useNavigate } from "react-router-dom";
import "./InstrumentList.css";

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
  const [error, setError] = useState(""); // To store and display errors
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
      <h2>Book Instrument</h2>
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
          <label>
            Booked from:
            <input
              type="date"
              name="bookedFrom"
              value={bookingData.bookedFrom}
              onChange={handleInputChange}
            />
          </label>
          <br />
          <label>
            Booked until:
            <input
              type="date"
              name="bookedUntil"
              value={bookingData.bookedUntil}
              onChange={handleInputChange}
            />
          </label>
          <br />
          {showDateWarning && (
            <p style={{ color: "red", fontWeight: "bold" }}>
              Both booking dates are mandatory.
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
