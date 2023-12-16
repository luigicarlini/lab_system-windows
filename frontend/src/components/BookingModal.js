import React, { useState } from "react";
import Modal from "react-modal";
import { useNavigate } from "react-router-dom";
// import DatePicker from "react-datepicker";
// import "react-datepicker/dist/react-datepicker.css";
import "./InstrumentList.css";

// const availableLocations = ["MAG.BETE (Bancone 4)", "MAG.BETE (Scaffale,Fila,Mensola) E_3_4", 
// "TERZO PIANO (Stanza 15)", "LOCALE VOLPE", "MAG.BETE (Scaffale,Fila,Mensola) I_3_0", "CASSETTIERA", "MAG.BETE (Scaffale,Fila,Mensola) I_2_1", "CASSETTIERA (NO BATTERIA)", 
// "LAB (PICAM)", "MAG.BETE (Scaffale,Fila,Mensola) I_0_0", "CLT (Scenario 7, Sara)", "LAB SW (Davide/Gabriele)", "MAG.BETE (Scaffale,Fila,Mensola) I_3_1", "CLT (Sceanario 7,Sara)", 
// "Alaska lab; Floor -1","Bancone (MAG.BETE) B3 (Bete)", "MAG.BETE (Scaffale,Fila,Mensola) I_2_0", "MAG.BETE (Scaffale,Fila,Mensola) D_1_3", "CLT (Rack 22)", "CLT (Scenario 8, Nick)", 
// "CLT (Lorenzo Scenario 4)", "MAG.BETE (Scaffale,Fila,Mensola) I_0_1", "CLT (Scenario 8, Nick )", "MAG.BETE (Scaffale,Fila,Mensola) D_0_1", "CLT (Rack 12)", 
// "CLT (Scenario 8, Nick )", "MAG.BETE (Scaffale,Mensola) M_0", "MAG.BETE (Scaffale,Mensola) L_0", "RAdio lab; Floor -1", "Bancone (MAG.BETE) B3", 
// "MAG.BETE (Scaffale,Fila,Mensola) D_2_3 (in uso su uno strumento)", "MAG.BETE (Scaffale,Fila,Mensola) D_0_1", "MAG.BETE (Scaffale,Fila,Mensola) I_1_1", 
// "MAG.BETE (Scaffale,Fila,Mensola) I_1_0", "LOCALE BOCCIONI", "CLT (Rack 129,169)", "CLT (Rack XX Nick)", "CLT (Rack XX,in ANRITSU 1230, Nick)", 
// "CLT (Scenario 4 in ANRITSU 1230,Lorenzo)", "BOCCIONI", "PVV lab; Floor -1", "MAG.BETE (Scaffale,Fila,Mensola) E_1_4", "MAG.BETE (Scaffale,Fila,Mensola) F_1_1", 
// "MAG.BETE (Scaffale,Fila,Mensola) D_3_3", "LAB (5 G)", "RAdio lab; Floor -1 (Rack 8510C)", "MAG.BETE (Scaffale,Fila,Mensola) E_4_4", "MAG.BETE (Scaffale,Mensola) L_1", 
// "MAG.BETE (Scaffale,Mensola) L_3", "MAG.BETE (Scaffale,Mensola) L_2", "MAG.BETE (Scaffale,Fila,Mensola) I_1_1", "GRUPPO 5G", "CLT", "MAG.BETE (Scaffale,Fila,Mensola) F_1_2", 
// "MAG.BETE (Scaffale,Fila,Mensola) F_2_1", "MAG.BETE (Scaffale,Fila,Mensola) F_2_2", "MAG.BETE (Scaffale,Fila,Mensola) F_3_1", "MAG.BETE (Scaffale,Fila,Mensola) F_3_2",
// "MAG.BETE (Scaffale,Fila,Mensola) F_4_1", "MAG.BETE (Scaffale,Fila,Mensola) F_4_2", "MAG.BETE (Scaffale,Fila,Mensola) F_1_3", "MAG.BETE (Scaffale,Fila,Mensola) F_2_3", 
// "MAG.BETE (Scaffale,Fila,Mensola) D_1_2", "MAG.BETE (Scaffale,Fila,Mensola) D_1_1", "MAG.BETE (Scaffale,Fila,Mensola) D_2_1", "MAG.BETE (Scaffale,Fila,Mensola) D_2_2", 
// "MAG.BETE (Scaffale,Fila,Mensola) D_3_1", "MAG.BETE (Scaffale,Fila,Mensola) D_3_2", "MAG.BETE (Scaffale,Fila,Mensola) D_4_1", "MAG.BETE (Scaffale,Fila,Mensola) D_4_2", 
// "MAG.BETE (Scaffale,Fila,Mensola) C_1_1", "MAG.BETE (Scaffale,Fila,Mensola) C_1_2", "MAG.BETE (Scaffale,Fila,Mensola) C_2_1", "MAG.BETE (Scaffale,Fila,Mensola) C_2_2", 
// "MAG.BETE (Scaffale,Fila,Mensola) C_3_1", "MAG.BETE (Scaffale,Fila,Mensola) C_3_2", "MAG.BETE (Scaffale,Fila,Mensola) C_4_2", "MAG.BETE (Scaffale,Fila,Mensola) F_1_2", 
// "CLT (Rack XX, In ANRITSU MD1230, Nick)", "MAG.BETE (Scaffale,Fila,Mensola) B_2_1", "MAG.BETE (Scaffale,Fila,Mensola) B_2_2", "MAG.BETE (Scaffale,Fila,Mensola) B_3_1", 
// "MAG.BETE (Scaffale,Fila,Mensola) B_3_2", "MAG.BETE (Scaffale,Fila,Mensola) G_1_1", "MAG.BETE (Scaffale,Fila,Mensola) G_2_1", "MAG.BETE (Scaffale,Fila,Mensola) G_2_2", 
// "MAG.BETE (Scaffale,Fila,Mensola) G_3_1", "MAG.BETE (Scaffale,Fila,Mensola) G_3_2", "MAG.BETE (Scaffale,Fila,Mensola) G_4_1", "MAG.BETE (Scaffale,Fila,Mensola) G_4_2", 
// "MAG.BETE (Scaffale,Mensola) M_1", "MAG.BETE (Scaffale,Mensola) M_2", "MAG.BETE (Scaffale,Fila,Mensola) H_1_1", "PAVIMENTO MAG.BETE (Scaffale,Fila,Mensola) I_4_2", 
// "MAG.BETE (Scaffale,Fila,Mensola) E_2_4", "MAG.BETE (Scaffale,Fila,Mensola) G_2_1 (Borsa  B031663)", "Rack 19 (CLT)", "MAG.BETE (Scaffale,Fila,Mensola) F_3_3",
// "MAG.BETE (Scaffale,Fila,Mensola) D_2_3", "CLT (Lorenzo Scenario 8)", "CLT (Rack Giovanni)", "CLT (Rack Giovanni, into 34970)",
// "SW lab; Floor -1", "Sent to Ericsson", "CLT (Scenario 4 in Lorenzo)", "CLT (Rack Giovanni Bangara)"];

const availableLocations = [  "MAG.BETE", "LAB Ex Volpati", "LOCALE BOCCIONI", "LAB ALASKA", "LAB RADIO -1", "LAB CLT", "LAB PVV", "LAB SW", "LAB XHAUL"];

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
    location: availableLocations[0]  // Default to the first available location
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
            Request for Booking Successfull!
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
            {/* Add dropdown for location selection */}
            <label style={{ fontWeight: "bold", fontSize: "1.2em" }}>
              Location:
              <select
                name="location"
                value={bookingData.location}
                onChange={handleInputChange}
                style={{ fontWeight: "bold", fontSize: "0.9em", marginLeft: "10px" }} // Apply styles to the dropdown
              >
                {availableLocations.sort().map(loc => (  // Sorting the locations alphabetically
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
