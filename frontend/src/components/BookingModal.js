import React, { useState } from "react";
import Modal from "react-modal";
import { useNavigate } from "react-router-dom"; // Using useNavigate

const BookingModal = ({
  isOpen,
  onRequestClose,
  onSubmitBooking,
  setIsModalOpen,
}) => {
  const [bookingData, setBookingData] = useState({
    // bookedBy: "",
    bookedFrom: "",
    bookedUntil: "",
  });

  const navigate = useNavigate();
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBookingData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      //setIsModalOpen(false);  // Ensure the modal is closed when navigating back
      await onSubmitBooking(bookingData);
      setBookingSuccess(true);
    } catch (error) {
      console.error("Booking failed:", error);
      // Optionally handle user feedback for booking failure here
    }
  };

  const handleNavigate = () => {
    setIsModalOpen(false); // Ensure the modal is closed when navigating back
    navigate("/instruments"); // Redirect user to instruments after successful login
    setBookingSuccess(false); // Reset bookingSuccess state
  };

  // Additional function to handle closing of modal and reset bookingSuccess state
  const handleModalClose = () => {
    onRequestClose(); // Call parent's request to close function if it exists
    setBookingSuccess(false); // Reset bookingSuccess state
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={handleModalClose} // Using the new function here
      contentLabel="Book Instrument Modal"
    >
      <h2>Book Instrument</h2>
      {bookingSuccess ? (
        <>
          {/* <p>Booking Successful!</p> */}
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
          <button onClick={handleSubmit}>Submit Booking</button>
          <button onClick={handleModalClose}>Close</button>
        </>
      )}
    </Modal>
  );
};

export default BookingModal;
