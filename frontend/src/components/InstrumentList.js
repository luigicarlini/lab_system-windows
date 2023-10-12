import React, { useEffect, useState } from "react";
import {
  getAllInstruments,
  bookInstrument,
  getInstrumentStatus,
  releaseInstrument,
} from "../api/api";
import { useUserContext } from "../context/UserContext";

//import Modal from 'react-modal';  //Modal component is rendered as part of the JSX.
import BookingModal from "./BookingModal";

import "./InstrumentList.css"; // Import the styles

const InstrumentList = () => {
  const [instruments, setInstruments] = useState([]);
  const [instrumentStatuses, setInstrumentStatuses] = useState({});
  const { user } = useUserContext(); // <-- Corrected destructuring
  const [isModalOpen, setIsModalOpen] = useState(false); // <-- State to control modal visibility
  const [selectedInstrumentId, setSelectedInstrumentId] = useState(null); // <-- State to keep track of selected instrument ID
  const [bookingMade, setBookingMade] = useState(false); // <-- State to keep track if booking has been made
  // Updated: added state for tracking expanded instrument
  const [expandedInstrumentId, setExpandedInstrumentId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [promptLoginForInstrumentId, setPromptLoginForInstrumentId] = useState(null);



  useEffect(() => {
    const fetchData = async () => {
      const allInstruments = await getAllInstruments();
      setInstruments(allInstruments);
      const statuses = await Promise.all(
        allInstruments.map((instrument) => getInstrumentStatus(instrument._id))
      );
      const statusMap = {};
      allInstruments.forEach((instrument, index) => {
        statusMap[instrument._id] = statuses[index].availability
          ? "Available"
          : "Booked";
      });
      setInstrumentStatuses(statusMap);
    };
    fetchData();
  }, [bookingMade]); // <-- Dependency array now includes bookingMade

  const sortedInstruments = [...instruments].sort((a, b) => {
    // Make sure user is defined and not null
    if (!user) {
      console.error('User is null or undefined:', user);
      // Optionally, handle this case with some fallback or error logic
      return 0; // Leaves the sort order unchanged
    }
  
    const aIsBookedByUser = a.bookedBy && a.bookedBy._id === user.id;
    const bIsBookedByUser = b.bookedBy && b.bookedBy._id === user.id;
    
    if (aIsBookedByUser && !bIsBookedByUser) {
      return -1;
    }
    
    if (!aIsBookedByUser && bIsBookedByUser) {
      return 1;
    }
    
    // Return 0 if neither condition above is met, which means
    // that the two elements being compared should remain in the same order
    return 0;
  });

  // Updated: Function to toggle the expand/collapse of an instrument details
  const toggleInstrumentDetails = (id) => {
    if (expandedInstrumentId === id) {
      setExpandedInstrumentId(null);
    } else {
      setExpandedInstrumentId(id);
    }
  };

  const handleBookInstrument = (id) => {
    if (!user) {
      console.log("You must be logged in to book an instrument.");
      setPromptLoginForInstrumentId(id); // Set the ID of the instrument for which the login prompt should be shown.
      return; // Ensure we don't continue with the function.
    }
    console.log("Attempting to book instrument with ID:", id);
    setSelectedInstrumentId(id); // Set the selected instrument ID
    setIsModalOpen(true); // Open the booking modal
  };

  // handleBookingSubmit(): This function should call your API to perform the booking using the bookingData and then close the modal.
  const handleBookingSubmit = async (bookingData) => {
    if (user && selectedInstrumentId) {
      try {
          //await bookInstrument(selectedInstrumentId, user._id, bookingData);
          console.log("User:", user);
          console.log("selectedInstrumentId :", selectedInstrumentId);
          await bookInstrument(selectedInstrumentId, user.id, bookingData);
          setBookingMade(!bookingMade); // <-- Toggle bookingMade state on successful booking
          // Consider refetching the instrument data or updating the state to reflect the new booking
      } catch (error) {
        console.log("Error during booking:", error);
        // Handle error feedback to user here if needed.
      }
    } else {
      console.log("You must be logged in to book an instrument.");
      // Handle feedback for not-logged-in state if needed.
    }
  };

  const handleReleaseInstrument = async (id) => {
    try {
      setIsLoading(true);
      setTimeout(async () => {
        console.log("InstrumentList.js : complete User:", user);
        console.log("InstrumentList.js : InstrumentID:", id);
        await releaseInstrument(user.id, id);

        // Update Local State to Reflect Changes Immediately:
        setInstrumentStatuses((prevStatuses) => ({
          ...prevStatuses,
          [id]: "Available",
        }));
        setInstruments((prevInstruments) =>
          prevInstruments.map((instrument) =>
            instrument._id === id
              ? {
                  ...instrument,
                  bookedBy: null,
                  bookedFrom: null,
                  bookedUntil: null,
                }
              : instrument
          )
        );

        console.log("Instrument released successfully!");
        // Optionally, you might want to show a success message to the user.
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error("Failed to release instrument:", error);
      // Handle error feedback to user here if needed.
    }
  };

  console.log("Instrument Statuses:", instrumentStatuses);
  console.log("user :", user);
  return (
    <div>
      {sortedInstruments.map((instrument) => (
        <div
          key={instrument._id}
          style={{
            marginBottom: "10px",
            border:
              instrumentStatuses[instrument._id] === "Booked" &&
              instrument.bookedBy.username
                ? "1px solid #014C8C"
                : instrumentStatuses[instrument._id] === "Available"
                ? "3px solid #014C8C"
                : "3px solid #014C8C",
            padding: "15px",
            borderRadius: "5px",
          }}
        >
          <div
            style={{ fontWeight: "bold", fontSize: "1.1em", color: "#014C8C" }}
          >
            {instrument.instrumentName}
          </div>
          <div>
            <span style={{ fontWeight: "bold" }}>Status:</span>
            <span
              style={{
                color:
                  instrumentStatuses[instrument._id] === "Booked"
                    ? "red"
                    : instrumentStatuses[instrument._id] === "Available"
                    ? "green"
                    : "black",
                fontWeight:
                  instrumentStatuses[instrument._id] === "Booked" ||
                  instrumentStatuses[instrument._id] === "Available"
                    ? "bold"
                    : "normal",
              }}
            >
              {instrumentStatuses[instrument._id]
                ? ` ${instrumentStatuses[instrument._id]}`
                : " Unknown"}
            </span>
          </div>
          {/* Updated: Expand/Collapse Button */}
          <button onClick={() => toggleInstrumentDetails(instrument._id)}>
            {expandedInstrumentId === instrument._id ? "Collapse" : "Expand"}
          </button>
          {/* All the additional details to be shown when expanded */}
          {expandedInstrumentId === instrument._id && (
            <div>
              {/* All the additional details to be shown when expanded */}
              <div>
                <span style={{ fontWeight: "bold" }}>Manufacturer: </span>
                {instrument.manufacturer}
              </div>
              <div>
                <span style={{ fontWeight: "bold" }}>Model: </span>
                {instrument.model}
              </div>
              <div>
                <span style={{ fontWeight: "bold" }}>Frequency Range: </span>
                {instrument.frequencyRange}
              </div>
              <div>
                <span style={{ fontWeight: "bold" }}>Description: </span>
                {instrument.description}
              </div>
              <div>
                <span style={{ fontWeight: "bold" }}>Booked by: </span>
                {instrument.bookedBy
                  ? typeof instrument.bookedBy === "object"
                    ? instrument.bookedBy.username
                    : instrument.bookedBy
                  : "N/A"}
              </div>
              <div>
                <span style={{ fontWeight: "bold" }}>Booked from: </span>
                {instrument.bookedFrom || "N/A"}
              </div>
              <div>
                <span style={{ fontWeight: "bold" }}>Booked until: </span>
                {instrument.bookedUntil || "N/A"}
              </div>
            </div>
          )}
          {instrumentStatuses[instrument._id] === "Available" && (
            <button
              onClick={() => handleBookInstrument(instrument._id)}
              style={{
                marginTop: "10px",
                backgroundColor: "#28a745",
                color: "white",
                border: "none",
                padding: "5px 10px",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Book
            </button>
          )}
          {instrument._id === promptLoginForInstrumentId && (
            <div className="login-prompt">
              You must be logged in to book this instrument.
            </div>
          )}
          {instrumentStatuses[instrument._id] === "Booked" &&
            instrument.bookedBy &&
            user &&
            (instrument.bookedBy._id === user.id ||
              instrument.bookedBy === user.id) && (
              <div>
                {isLoading && (
                  <div className="loading-container">
                    <div className="spinner"></div>
                    <span className="loading-text">Releasing...</span>
                  </div>
                )}
                <button
                  onClick={() => handleReleaseInstrument(instrument._id)}
                  style={{
                    marginTop: "10px",
                    backgroundColor: "#808080", // Choose a color that denotes a release action
                    color: "white",
                    border: "none",
                    padding: "5px 10px",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  Release
                </button>
              </div>
            )}
        </div>
      ))}

      <BookingModal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        onSubmitBooking={handleBookingSubmit}
        setIsModalOpen={setIsModalOpen} // Pass setIsModalOpen as a prop
      />
    </div>
  );
};

export default InstrumentList;
