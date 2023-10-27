//"first section,"
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
  const SUPER_USER_USERNAME = "super user"
  const [instruments, setInstruments] = useState([]);
  const [instrumentStatuses, setInstrumentStatuses] = useState({});
  const { user } = useUserContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedInstrumentId, setSelectedInstrumentId] = useState(null);
  const [bookingMade, setBookingMade] = useState(false);
  const [expandedInstrumentId, setExpandedInstrumentId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [promptLoginForInstrumentId, setPromptLoginForInstrumentId] = useState(null);
  const [promptLoginForViewing, setPromptLoginForViewing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [bookedByMode, setBookedByMode] = useState(false);
  const [instrumentsBookedByMe, setInstrumentsBookedByMe] = useState([]);
  const [filteredInstruments, setFilteredInstruments] = useState([]); // <-- Add state to handle filtered instruments
  const [equipmentSearchTerm, setEquipmentSearchTerm] = useState("");
  const [modelSearchTerm, setModelSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("all"); // possible values: "all", "byMe", "byAll"
  const isSuperUser = user && user.username === SUPER_USER_USERNAME;


  

  useEffect(() => {
    const fetchData = async () => {
      try {
        const allInstruments = await getAllInstruments();

        // Combine filtering based on search term, bookedByMode, equipmentSearchTerm, and modelSearchTerm
        let filtered = allInstruments;

        if (searchTerm) {
          const searchTermLC = searchTerm.toLowerCase();
          filtered = filtered.filter((instrument) =>
            instrument.description.toLowerCase().includes(searchTermLC)
          );
        }

         // Filtering based on viewMode
        if (viewMode === "byMe" && user) {
          filtered = filtered.filter((instrument) =>
            instrument.bookedBy && instrument.bookedBy._id === user.id
          );
        } else if (viewMode === "byAll") {
          filtered = filtered.filter((instrument) => instrument.bookedBy);
        } // for viewMode === "all", we don't filter further since we want all instruments

        // Apply equipment and model filters
        if (equipmentSearchTerm) {
          const equipmentSearchTermLC = equipmentSearchTerm.toLowerCase();
          filtered = filtered.filter((instrument) =>
            instrument.equipment.toLowerCase().includes(equipmentSearchTermLC)
          );
        }

        if (modelSearchTerm) {
          const modelSearchTermLC = modelSearchTerm.toLowerCase();
          filtered = filtered.filter((instrument) =>
            instrument.model.toLowerCase().includes(modelSearchTermLC)
          );
        }

        // Update the filtered instruments
        setFilteredInstruments(sortInstruments(filtered));

        // Log relevant values for debugging
        console.log("searchTerm:", searchTerm);
        console.log("equipmentSearchTerm:", equipmentSearchTerm);
        console.log("modelSearchTerm:", modelSearchTerm);
        console.log("bookedByMode:", bookedByMode);
        console.log("user:", user);
        console.log("filteredInstruments:", filteredInstruments);
      } catch (error) {
        console.error("Error fetching instruments:", error);
      }
    };

    fetchData();
  }, [searchTerm, equipmentSearchTerm, modelSearchTerm, bookedByMode, user]);


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
        // Fetch the updated instrument data after booking
        const updatedInstrument = await getInstrumentStatus(selectedInstrumentId);

        // Update the filteredInstruments list
        setFilteredInstruments((prevFilteredInstruments) =>
          prevFilteredInstruments.map((instrument) =>
            instrument._id === selectedInstrumentId
              ? {
                ...instrument,
                bookedBy: updatedInstrument.bookedBy || null,
                bookedFrom: updatedInstrument.bookedFrom || null,
                bookedUntil: updatedInstrument.bookedUntil || null,
              }
              : instrument
          )
        );
      } catch (error) {
        console.log("Error during booking:", error);
      }
    } else {
      console.log("You must be logged in to book an instrument.");
    }
  };

  // const handleReleaseInstrument = async (id) => {
  //   try {
  //     setIsLoading(true);
  //     setTimeout(async () => {
  //       // Release the instrument
  //       await releaseInstrument(user.id, id);

  //       // Fetch the updated instrument data
  //       const updatedInstrument = await getInstrumentStatus(id);

  //       // Update instrumentStatuses
  //       setInstrumentStatuses((prevStatuses) => ({
  //         ...prevStatuses,
  //         [id]: updatedInstrument.availability ? "Available" : "Booked",
  //       }));

  //       // Update instrument details, including bookedBy, bookedFrom, and bookedUntil
  //       setInstruments((prevInstruments) =>
  //         prevInstruments.map((instrument) =>
  //           instrument._id === id
  //             ? {
  //               ...instrument,
  //               bookedBy: updatedInstrument.bookedBy || null,
  //               bookedFrom: updatedInstrument.bookedFrom || null,
  //               bookedUntil: updatedInstrument.bookedUntil || null,
  //             }
  //             : instrument
  //         )
  //       );

  //       // Update the filtered view (instrumentsBookedByMe) if applicable
  //       if (bookedByMode) {
  //         setInstrumentsBookedByMe((prevInstruments) =>
  //           prevInstruments.map((instrument) =>
  //             instrument._id === id
  //               ? {
  //                 ...instrument,
  //                 bookedBy: updatedInstrument.bookedBy || null,
  //                 bookedFrom: updatedInstrument.bookedFrom || null,
  //                 bookedUntil: updatedInstrument.bookedUntil || null,
  //               }
  //               : instrument
  //           )
  //         );
  //       }
  //       console.log("Instrument released successfully!");
  //       setIsLoading(false);
  //     }, 1000);
  //   } catch (error) {
  //     console.error("Failed to release instrument:", error);
  //   }
  // };

  const handleReleaseInstrument = async (id) => {
    try {
      setIsLoading(true);

      // Determine if the current user is a super user
      const isSuperUser = user && user.username === "super user"; // replace "superUser" with the actual super user's username

      // Find the instrument being released
      const instrumentToRelease = instruments.find(instr => instr._id === id);

      // If the instrument is not found, return early
      if (!instrumentToRelease) {
        console.error("Instrument not found:", id);
        return;
      }

      // Check if the current user is the one who booked the instrument or if they are a super user
      const canRelease = (user && instrumentToRelease.bookedBy && (instrumentToRelease.bookedBy._id === user.id || instrumentToRelease.bookedBy === user.id)) || isSuperUser;

      if (!canRelease) {
        console.log("You do not have permission to release this instrument.");
        return;
      }

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

        setFilteredInstruments((prevFilteredInstruments) =>
          prevFilteredInstruments.map((instrument) =>
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
    if (!user) {
      console.log("You must be logged in to view instruments booked by you.");
      setPromptLoginForViewing(true);
      return;
    }
    setBookedByMode(true);
    setViewMode("byMe");
    try {
      const instrumentsBooked = instruments.filter(
        (instrument) =>
          instrument.bookedBy && instrument.bookedBy._id === user.id
      );
      //setInstrumentsBookedByMe(sortInstruments(instrumentsBooked));
      setFilteredInstruments(sortInstruments(instrumentsBooked));


      // Add console log to check instruments booked by the current user
      console.log("Instruments booked by current user:", instrumentsBooked);

      // Add console log to check which instruments are selected
      console.log(
        "Instruments selected in handleViewBookedByMe:",
        instrumentsBookedByMe
      );
    } catch (error) {
      console.error("Error fetching instruments booked by you:", error);
    }
  };

  const handleViewAllInstruments = () => {
    setPromptLoginForViewing(false);
    setBookedByMode(false);
    setViewMode("all");
    // Add console log to check which instruments are selected
    console.log(
      "Instruments selected in handleViewAllInstruments:",
      instruments
    );
  };
  
  const handleViewBookedByAllUsers = () => {
    if (!user) {
      console.log("You must be logged in to view instruments booked by all users.");
      setPromptLoginForViewing(true);
      return;
    }
    setBookedByMode(true);
    setViewMode("byAll");
    try {
      const instrumentsBookedBy = instruments.filter(
        (instrument) => instrument.bookedBy
      );
      //setInstrumentsBookedByMe(sortInstruments(instrumentsBookedBy));
      setFilteredInstruments(sortInstruments(instrumentsBookedBy));

      // Add console log to check all instruments booked by any user
      console.log("All instruments booked by any user:", instrumentsBookedBy);

      // Add console log to check which instruments are selected
      console.log(
        "Instruments selected in handleViewBookedByAllUsers:",
        instrumentsBookedBy
      );
    } catch (error) {
      console.error("Error fetching instruments booked by all users:", error);
    }
  };

  console.log("bookedByMode:", bookedByMode);
  console.log("user:", user);
  console.log("filteredInstruments:", filteredInstruments);

  // Define a function to render instrument details
const renderInstrumentDetails = (instrument) => {
  return (
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
      <div style={{ fontWeight: "bold", fontSize: "1.0em", color: "black" }}>
        Equipment:{" "}
        <span style={{ fontWeight: "bold", fontSize: "1.1em", color: "#014C8C" }}>
          {instrument.equipment}
        </span>
      <div style={{ fontWeight: "bold", fontSize: "1.0em", color: "black" }}>
        Model:{" "}
        <span style={{ fontWeight: "bold", fontSize: "1.1em", color: "#014C8C" }}>
          {instrument.model}
        </span>
      </div>
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
            <span style={{ fontWeight: "bold" }}>producer: </span>
            {instrument.producer}
          </div>
          <div>
            <span style={{ fontWeight: "bold" }}>accessories: </span>
            {instrument.accessories}
          </div>
          <div>
            <span style={{ fontWeight: "bold" }}>due_calibration: </span>
            {instrument.due_calibration}
          </div>
          <div>
            <span style={{ fontWeight: "bold" }}>materiale ericsson: </span>
            {instrument.due_calibration}
          </div>
          <div>
            <span style={{ fontWeight: "bold" }}>location: </span>
            {instrument.location}
          </div>
          <div>
            <span style={{ fontWeight: "bold" }}>room_site_number: </span>
            {instrument.room_site_number}
          </div>
          <div>
            <span style={{ fontWeight: "bold" }}>room_site_description: </span>
            {instrument.room_site_description}
          </div>
          <div>
            <span style={{ fontWeight: "bold" }}>location_inside_room: </span>
            {instrument.location_inside_room}
          </div>
          <div>
            <span style={{ fontWeight: "bold" }}>project: </span>
            {instrument.project}
          </div>
          <div>
            <span style={{ fontWeight: "bold" }}>ip_address: </span>
            {instrument.materiale_ericsson}
          </div>
          <div>
            <span style={{ fontWeight: "bold" }}>reference_people: </span>
            {instrument.reference_people}
          </div>
          <div>
            <span style={{ fontWeight: "bold" }}>test_bench_number: </span>
            {instrument.test_bench_number}
          </div>
          <div>
            <span style={{ fontWeight: "bold" }}>notes: </span>
            {instrument.notes}
          </div>
          <div>
            <span style={{ fontWeight: "bold" }}>Booked by: </span>
            {instrument.bookedBy
              ? typeof instrument.bookedBy === "object"
                ? instrument.bookedBy.username
                : instrument.bookedBy
              : "N/A"}
          </div>
          {/* <div>
            <span style={{ fontWeight: "bold" }}>Booked from: </span>
            {instrument.bookedFrom || "N/A"}
          </div> */}
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
        ((instrument.bookedBy && user && instrument.bookedBy._id === user.id) ||
          isSuperUser) && (
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
  );
};

const AllInstrumentsView = ({ searchTerm, equipmentSearchTerm, modelSearchTerm }) => {
  return (
    <div>
      {/* Buttons to filter the view */}
      <button
        onClick={() => {
          console.log("JSX: Booked by Me button clicked");
          handleViewBookedByMe();
        }}
        style={{
          marginTop: "10px",
          backgroundColor: "#28a745",
          color: "white",
          border: "none",
          padding: "5px 10px",
          borderRadius: "4px",
          cursor: "pointer",
          fontSize: "1.0em", 
        }}
      >
        Booked by Me
      </button>
      <button
        onClick={() => {
          console.log("JSX: Booked By All Users button clicked");
          handleViewBookedByAllUsers();
        }}
        style={{
          marginTop: "10px",
          backgroundColor: "#007BFF",
          color: "white",
          border: "none",
          padding: "5px 10px",
          borderRadius: "4px",
          cursor: "pointer",
          fontSize: "1.0em",
        }}
      >
        Booked By All Users
      </button>

      {/* List of all instruments */}
      {filteredInstruments 
        .filter((instrument) => {
          // Apply your search filter based on 'searchTerm'
          const searchTermLC = searchTerm.toLowerCase();
          const matchesDescription = instrument.description.toLowerCase().includes(searchTermLC);

          // Apply equipment and model filters based on 'equipmentSearchTerm' and 'modelSearchTerm'
          const equipmentSearchTermLC = equipmentSearchTerm.toLowerCase();
          const modelSearchTermLC = modelSearchTerm.toLowerCase();
          const matchesEquipment = instrument.equipment.toLowerCase().includes(equipmentSearchTermLC);
          const matchesModel = instrument.model.toLowerCase().includes(modelSearchTermLC);

          // Combine all filter conditions using logical OR (||)
          return (
            matchesDescription ||
            matchesEquipment ||
            matchesModel
          );
        })
        .map((instrument) => {
          // Render each instrument detail
          return renderInstrumentDetails(instrument);
        })}
    </div>
  );
};

const BookedByMeView = ({ searchTerm, equipmentSearchTerm, modelSearchTerm, handleViewAllInstruments }) => {
  return (
    <div>
      <button
        onClick={ handleViewAllInstruments }
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
        View All Instruments
      </button>
      {filteredInstruments
        .filter((instrument) => {
          const searchTermLC = searchTerm.toLowerCase();
          const matchesDescription = instrument.description.toLowerCase().includes(searchTermLC);
          const equipmentSearchTermLC = equipmentSearchTerm.toLowerCase();
          const matchesEquipment = instrument.equipment.toLowerCase().includes(equipmentSearchTermLC);
          const modelSearchTermLC = modelSearchTerm.toLowerCase();
          const matchesModel = instrument.model.toLowerCase().includes(modelSearchTermLC);

          return (
            matchesDescription ||
            matchesEquipment ||
            matchesModel
          );
        })
        .filter((instrument) => instrument.bookedBy && instrument.bookedBy._id === user.id)
        .map((instrument) => renderInstrumentDetails(instrument))}
    </div>
  );
};

const BookedByAllUsersView = ({ searchTerm, equipmentSearchTerm, modelSearchTerm, handleViewAllInstruments, filteredInstruments }) => {
  return (
    <div>
      <button
        onClick={ handleViewAllInstruments }
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
        View All Instruments
      </button>
      {filteredInstruments
        .filter((instrument) => {
          const searchTermLC = searchTerm.toLowerCase();
          const matchesDescription = instrument.description.toLowerCase().includes(searchTermLC);
          const equipmentSearchTermLC = equipmentSearchTerm.toLowerCase();
          const matchesEquipment = instrument.equipment.toLowerCase().includes(equipmentSearchTermLC);
          const modelSearchTermLC = modelSearchTerm.toLowerCase();
          const matchesModel = instrument.model.toLowerCase().includes(modelSearchTermLC);

          return (
            matchesDescription ||
            matchesEquipment ||
            matchesModel
          );
        })
        .filter((instrument) => instrument.bookedBy)
        .map((instrument) => renderInstrumentDetails(instrument))}
    </div>
  );
};


  return (
    <div>
      <h1 style={{ fontWeight: "bold" }}>Instruments List</h1>
      {promptLoginForViewing && (
      <div className="login-prompt">
        You must be logged in to view booked instruments.
      </div>
    )}
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search by instrument name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            fontWeight: "bold",
            border: "2px solid blue",
            fontSize: "1em" // Adjust as needed
        }}
        />
        <input
          type="text"
          placeholder="Search by equipment..."
          value={equipmentSearchTerm}
          onChange={(e) => setEquipmentSearchTerm(e.target.value)}
          style={{
            fontWeight: "bold",
            border: "2px solid blue",
            fontSize: "1em" // Adjust as needed
        }}
        />
        <input
          type="text"
          placeholder="Search by model..."
          value={modelSearchTerm}
          onChange={(e) => setModelSearchTerm(e.target.value)}
          style={{
            fontWeight: "bold",
            border: "2px solid blue",
            fontSize: "1em" // Adjust as needed
        }}
        />
      </div>
      {viewMode === "byMe" && (
      <BookedByMeView 
        searchTerm={searchTerm} 
        equipmentSearchTerm={equipmentSearchTerm} 
        modelSearchTerm={modelSearchTerm} 
        handleViewAllInstruments={handleViewAllInstruments} 
      />
    )}
    {viewMode === "byAll" && (
      <BookedByAllUsersView 
        searchTerm={searchTerm} 
        equipmentSearchTerm={equipmentSearchTerm} 
        modelSearchTerm={modelSearchTerm} 
        handleViewAllInstruments={handleViewAllInstruments} 
        filteredInstruments={filteredInstruments}
      />
    )}
    {viewMode === "all" && (
      <AllInstrumentsView 
        searchTerm={searchTerm} 
        equipmentSearchTerm={equipmentSearchTerm} 
        modelSearchTerm={modelSearchTerm} 
      />
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
