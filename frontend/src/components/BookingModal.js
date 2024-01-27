import React, { useState } from "react";
import Modal from "react-modal";
import { useNavigate } from "react-router-dom";
import "./InstrumentList.css";

const availableLocations = [
  "MAG.BETE",
  "LAB Ex Volpati",
  "LOCALE BOCCIONI",
  "LAB ALASKA",
  "LAB RADIO -1",
  "LAB CLT",
  "LAB PVV",
  "LAB SW",
  "LAB XHAUL",
];

function isValidDate(dateString) {
  const date = new Date(dateString);
  return !isNaN(date);
}

const BookingModal = ({
  isOpen,
  onRequestClose,
  onSubmitBooking,
  setIsModalOpen,
  instrumentInfo, // Pass instrumentInfo as a prop
}) => {
  const [bookingData, setBookingData] = useState({
    bookedFrom: "",
    bookedUntil: "",
    location: availableLocations[0],
  });

  const navigate = useNavigate();
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error] = useState("");
  const [showDateWarning, setShowDateWarning] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBookingData((prevData) => ({ ...prevData, [name]: value }));
    setShowDateWarning(false);
  };

  const handleSubmit = async () => {
    if (!bookingData.bookedFrom || !bookingData.bookedUntil) {
      setShowDateWarning(true);
      return;
    }

    const fromDate = new Date(bookingData.bookedFrom);
    const toDate = new Date(bookingData.bookedUntil);
    const today = new Date();

    if (fromDate <= today) {
      setShowDateWarning(true);
      return;
    }

    if (fromDate > toDate) {
      setShowDateWarning(true);
      return;
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
            Request for Booking Successful!
          </p>
          <button onClick={handleNavigate}>Return to Instrument List</button>
        </>
      ) : (
        <>
          <br />
            {/* Display instrument details from InstrumentInfo inside a blue frame */}
            <div style={{ border: "2px solid #014C8C", padding: "10px", borderRadius: "5px" }}>
            <p style={{ fontWeight: "bold", fontSize: "1.2em", color: "green" }}>
                You are booking the instrument:
              </p>
              {instrumentInfo ? (
                <>
                  <div style={{ fontWeight: "bold", fontSize: "1.0em", color: "black" }}>
                    Category:{" "}
                    <span style={{ fontWeight: "bold", fontSize: "1.1em", color: "#014C8C" }}>
                      {instrumentInfo.type}
                    </span>
                  </div>
                  <div style={{ fontWeight: "bold", fontSize: "1.0em", color: "black" }}>
                    Equipment name:{" "}
                    <span style={{ fontWeight: "bold", fontSize: "1.1em", color: "#014C8C" }}>
                      {instrumentInfo.description}
                    </span>
                  </div>
                  <div style={{ fontWeight: "bold", fontSize: "1.0em", color: "black" }}>
                    Model:{" "}
                    <span style={{ fontWeight: "bold", fontSize: "1.1em", color: "#014C8C" }}>
                      {instrumentInfo.model}
                    </span>
                  </div>
                  <div style={{ fontWeight: "bold", fontSize: "1.0em", color: "black" }}>
                    Equipment Description:{" "}
                    <span style={{ fontWeight: "bold", fontSize: "1.1em", color: "#014C8C" }}>
                      {instrumentInfo.equipment}
                    </span>
                  </div>
                </>
              ) : (
                <p>Loading instrument details...</p>
              )}
            </div>
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
          <label style={{ fontWeight: "bold", fontSize: "1.2em" }}>
            Location:
            <select
              name="location"
              value={bookingData.location}
              onChange={handleInputChange}
              style={{
                fontWeight: "bold",
                fontSize: "0.9em",
                marginLeft: "10px",
              }}
            >
              {availableLocations.sort().map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </label>
          <br />
          {showDateWarning && (
            <p style={{ color: "red", fontWeight: "bold" }}>
              Please insert valid dates ("Booking from" from Tomorrow, "Booking
              from" before "Booking Until").
            </p>
          )}
          {error && (
            <p style={{ color: "red", fontWeight: "bold" }}>{error}</p>
          )}
          <div>
            {isLoading && (
              <div className="loading-container">
                <div className="spinner"></div>
                <span className="loading-text">Booking...</span>
              </div>
            )}
            <button onClick={handleSubmit}>Submit Booking</button>
          </div>
          <button onClick={handleModalClose}>Cancel</button>
        </>
      )}
    </Modal>
  );
};

export default BookingModal;
