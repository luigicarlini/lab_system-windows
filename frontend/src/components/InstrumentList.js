import React, { useEffect, useState } from "react";
import {
  getAllInstruments,
  bookInstrument,
  getInstrumentStatus,
  releaseInstrument,
} from "../api/api";
import { useUserContext } from "../context/UserContext";
import BookingModal from "./BookingModal";
import "./InstrumentList.css";

const InstrumentList = () => {
  const [instruments, setInstruments] = useState([]);
  const [instrumentStatuses, setInstrumentStatuses] = useState({});
  const { user } = useUserContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedInstrumentId, setSelectedInstrumentId] = useState(null);
  const [bookingMade, setBookingMade] = useState(false);
  const [expandedInstrumentId, setExpandedInstrumentId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [promptLoginForInstrumentId, setPromptLoginForInstrumentId] = useState(
    null
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [bookedByMode, setBookedByMode] = useState(false);
  const [instrumentsBookedByMe, setInstrumentsBookedByMe] = useState([]);
  const [filteredInstruments, setFilteredInstruments] = useState([]); // <-- Add state to handle filtered instruments

  useEffect(() => {
  if (!searchTerm) {
    setFilteredInstruments(sortInstruments(instruments));
  } else {
    setFilteredInstruments(
      sortInstruments(
        instruments.filter((instrument) =>
          instrument.description.toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    );
  }
}, [searchTerm, instruments, user]);  // Added 'user' as a dependency
  
  
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const allInstruments = await getAllInstruments();
        setInstruments(allInstruments);
        const statuses = await Promise.all(
          allInstruments.map((instrument) =>
            getInstrumentStatus(instrument._id)
          )
        );
        const statusMap = {};
        allInstruments.forEach((instrument, index) => {
          statusMap[instrument._id] = statuses[index].availability
            ? "Available"
            : "Booked";
        });
        setInstrumentStatuses(statusMap);
      } catch (error) {
        console.error("Error fetching instruments:", error);
      }
    };
    fetchData();
  }, [bookingMade]);

  const sortInstruments = (instrumentsToSort) => {
    return [...instrumentsToSort].sort((a, b) => {
      if (!user) {
        return 0;
      }

      const aIsBookedByUser = a.bookedBy && a.bookedBy._id === user.id;
      const bIsBookedByUser = b.bookedBy && b.bookedBy._id === user.id;

      if (aIsBookedByUser && !bIsBookedByUser) {
        return -1;
      }

      if (!aIsBookedByUser && bIsBookedByUser) {
        return 1;
      }

      return 0;
    });
  };

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
      setPromptLoginForInstrumentId(id);
      return;
    }
    console.log("Attempting to book instrument with ID:", id);
    setSelectedInstrumentId(id);
    setIsModalOpen(true);
  };

  const handleBookingSubmit = async (bookingData) => {
    if (user && selectedInstrumentId) {
      try {
        await bookInstrument(selectedInstrumentId, user.id, bookingData);
        setBookingMade(!bookingMade);
      } catch (error) {
        console.log("Error during booking:", error);
      }
    } else {
      console.log("You must be logged in to book an instrument.");
    }
  };

  const handleReleaseInstrument = async (id) => {
    try {
      setIsLoading(true);
      setTimeout(async () => {
      // Release the instrument
      await releaseInstrument(user.id, id);
  
      // Fetch the updated instrument data
      const updatedInstrument = await getInstrumentStatus(id);
  
      // Update instrumentStatuses
      setInstrumentStatuses((prevStatuses) => ({
        ...prevStatuses,
        [id]: updatedInstrument.availability ? "Available" : "Booked",
      }));
  
      // Update instrument details, including bookedBy, bookedFrom, and bookedUntil
      setInstruments((prevInstruments) =>
        prevInstruments.map((instrument) =>
          instrument._id === id
            ? {
                ...instrument,
                bookedBy: updatedInstrument.bookedBy || null,
                bookedFrom: updatedInstrument.bookedFrom || null,
                bookedUntil: updatedInstrument.bookedUntil || null,
              }
            : instrument
        )
      );
  
      // Update the filtered view (instrumentsBookedByMe) if applicable
      if (bookedByMode) {
        setInstrumentsBookedByMe((prevInstruments) =>
          prevInstruments.map((instrument) =>
            instrument._id === id
              ? {
                  ...instrument,
                  bookedBy: updatedInstrument.bookedBy || null,
                  bookedFrom: updatedInstrument.bookedFrom || null,
                  bookedUntil: updatedInstrument.bookedUntil || null,
                }
              : instrument
          )
        );
      }
  
      console.log("Instrument released successfully!");
      setIsLoading(false);
    }, 1000);
    } catch (error) {
      console.error("Failed to release instrument:", error);
    }
  };

  const handleViewBookedByMe = () => {
    setBookedByMode(true);
    try {
      const instrumentsBooked = instruments.filter(
        (instrument) =>
          instrument.bookedBy && instrument.bookedBy._id === user.id
      );
      setInstrumentsBookedByMe(sortInstruments(instrumentsBooked));
    } catch (error) {
      console.error("Error fetching instruments booked by you:", error);
    }
  };

  const handleViewAllInstruments = () => {
    setBookedByMode(false);
  };

  const handleViewBookedByAllUsers = () => {
    setBookedByMode(true);
    try {
      const instrumentsBooked = instruments.filter(
        (instrument) => instrument.bookedBy
      );
      setInstrumentsBookedByMe(sortInstruments(instrumentsBooked));
    } catch (error) {
      console.error("Error fetching instruments booked by all users:", error);
    }
  };

  return (
    <div>
      <h1 style={{ fontWeight: "bold" }}>Instrument List</h1>
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search by instrument name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      {bookedByMode ? (
        <div>
          <button
            onClick={handleViewAllInstruments}
            style={{
              marginTop: "10px",
              backgroundColor: "#28a745",
              color: "white",
              border: "none",
              padding: "5px 10px",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "1.3em", // Increased font size
            }}
          >
            View All Instruments
          </button>
          {/* <h2>Instruments Booked by Users</h2> */}
          {instrumentsBookedByMe.map((instrument) => (
            <div
              key={instrument._id}
              style={{
                marginBottom: "10px",
                border:
                  instrumentStatuses[instrument._id] === "Booked" &&
                  instrument.bookedBy
                    ? "1px solid #014C8C"
                    : instrumentStatuses[instrument._id] === "Available"
                    ? "3px solid #014C8C"
                    : "3px solid #014C8C",
                padding: "15px",
                borderRadius: "5px",
              }}
            >
              <div
                style={{
                  fontWeight: "bold",
                  fontSize: "1.1em",
                  color: "#014C8C",
                }}
              >
                {instrument.description}
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
                {expandedInstrumentId === instrument._id
                  ? "Collapse"
                  : "Expand"}
              </button>
              {/* All the additional details to be shown when expanded */}
              {expandedInstrumentId === instrument._id && (
                <div>
                  {/* All the additional details to be shown when expanded */}
                  <div>
                    <span style={{ fontWeight: "bold" }}>censimento: </span>
                    {instrument.censimento}
                  </div>
                  <div>
                    <span style={{ fontWeight: "bold" }}>producer: </span>
                    {instrument.producer}
                  </div>
                  <div>
                    <span style={{ fontWeight: "bold" }}> model: </span>
                    {instrument.model}
                  </div>
                  <div>
                    <span style={{ fontWeight: "bold" }}>equipment: </span>
                    {instrument.equipment}
                  </div>
                  <div>
                    <span style={{ fontWeight: "bold" }}>accessories: </span>
                    {instrument.accessories}
                  </div>
                  <div>
                    <span style={{ fontWeight: "bold" }}>serial_number: </span>
                    {instrument.serial_number}
                  </div>
                  <div>
                    <span style={{ fontWeight: "bold" }}>last_calibration: </span>
                    {instrument.last_calibration}
                  </div>
                  <div>
                    <span style={{ fontWeight: "bold" }}>due_calibration: </span>
                    {instrument.due_calibration}
                  </div>
                  <div>
                    <span style={{ fontWeight: "bold" }}>ip_address: </span>
                    {instrument.ip_address}
                  </div>
                  <div>
                    <span style={{ fontWeight: "bold" }}>reference_people: </span>
                    {instrument.reference_people}
                  </div>
                  <div>
                    <span style={{ fontWeight: "bold" }}>
                    test_bench_number:{" "}
                    </span>
                    {instrument.test_bench_number}
                  </div>
                  <div>
                    <span style={{ fontWeight: "bold" }}>
                    notes:{" "}
                    </span>
                    {instrument.notes}
                  </div>
                  <div>
                    <span style={{ fontWeight: "bold" }}>HCL_serial_number: </span>
                    {instrument.HCL_serial_number}
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
        </div>
      ) : (
        <>
          <button
            onClick={handleViewBookedByMe}
            style={{
              marginTop: "10px",
              backgroundColor: "#28a745",
              color: "white",
              border: "none",
              padding: "5px 10px",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "1.0em", // Increased font size
            }}
          >
          Booked by Me
          </button>
          <button
            onClick={handleViewBookedByAllUsers}
            style={{
              marginTop: "10px",
              backgroundColor: "#007BFF",
              color: "white",
              border: "none",
              padding: "5px 10px",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "1.0em", // Increased font size
            }}
          >
          Booked By All Users
          </button>
          {filteredInstruments.map((instrument) => (
            <div
              key={instrument._id}
              style={{
                marginBottom: "10px",
                border:
                  instrumentStatuses[instrument._id] === "Booked" &&
                  //instrument.bookedBy.username
                  instrument.bookedBy
                    ? "1px solid #014C8C"
                    : instrumentStatuses[instrument._id] === "Available"
                    ? "3px solid #014C8C"
                    : "3px solid #014C8C",
                padding: "15px",
                borderRadius: "5px",
              }}
            >
              <div
                style={{
                  fontWeight: "bold",
                  fontSize: "1.1em",
                  color: "#014C8C",
                }}
              >
              {instrument.description}
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
              <button onClick={() => toggleInstrumentDetails(instrument._id)}>
                {expandedInstrumentId === instrument._id
                  ? "Collapse"
                  : "Expand"}
              </button>
              {expandedInstrumentId === instrument._id && (
                <div>
                  {/* Insert New attribute from here */}
                  <div>
                    <span style={{ fontWeight: "bold" }}>censimento: </span>
                    {instrument.censimento}
                  </div>
                  <div>
                    <span style={{ fontWeight: "bold" }}>producer: </span>
                    {instrument.producer}
                  </div>
                  <div>
                    <span style={{ fontWeight: "bold" }}> model: </span>
                    {instrument.model}
                  </div>
                  <div>
                    <span style={{ fontWeight: "bold" }}>equipment: </span>
                    {instrument.equipment}
                  </div>
                  <div>
                    <span style={{ fontWeight: "bold" }}>accessories: </span>
                    {instrument.accessories}
                  </div>
                  <div>
                    <span style={{ fontWeight: "bold" }}>serial_number: </span>
                    {instrument.serial_number}
                  </div>
                  <div>
                    <span style={{ fontWeight: "bold" }}>last_calibration: </span>
                    {instrument.last_calibration}
                  </div>
                  <div>
                    <span style={{ fontWeight: "bold" }}>due_calibration: </span>
                    {instrument.due_calibration}
                  </div>
                  <div>
                    <span style={{ fontWeight: "bold" }}>ip_address: </span>
                    {instrument.ip_address}
                  </div>
                  <div>
                    <span style={{ fontWeight: "bold" }}>reference_people: </span>
                    {instrument.reference_people}
                  </div>
                  <div>
                    <span style={{ fontWeight: "bold" }}>
                    test_bench_number:{" "}
                    </span>
                    {instrument.test_bench_number}
                  </div>
                  <div>
                    <span style={{ fontWeight: "bold" }}>
                    notes:{" "}
                    </span>
                    {instrument.notes}
                  </div>
                  <div>
                    <span style={{ fontWeight: "bold" }}>HCL_serial_number: </span>
                    {instrument.HCL_serial_number}
                  </div>
                  {/* Insert new attribute until here */}
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
              {/* Add rendering for other instrument details here */}
              {/* ... */}
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
                        backgroundColor: "#808080",
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
        </>
      )}
      <BookingModal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        onSubmitBooking={handleBookingSubmit}
        setIsModalOpen={setIsModalOpen}
      />
    </div>
  );
};

export default InstrumentList;