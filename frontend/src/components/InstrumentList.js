// outline the key states and transitions to  visualize the state machine:
// Initial State (Available/Not Booked)
// Instruments start in this state.

// --------------  Booking Requested -------------------//
// Trigger: User requests to book an instrument.
// Transition: From "Available" to "Booking Requested".
//--------------------------------------------------------

//--------------Waiting for Admin Approval--------------//
// Trigger: Booking request is pending admin approval.
// Transition: From "Booking Requested" to "Waiting for Admin Approval".
//--------------------------------------------------------

//--------------Booked----------------------------------//
// Trigger: Admin approves the booking request.
// Transition: From "Waiting for Admin Approval" to "Booked".
//--------------------------------------------------------

//--------------Release Requested-----------------------//
// Trigger: User requests to release the instrument.
// Transition: From "Booked" to "Release Requested".
//--------------------------------------------------------

//--------------Waiting for Admin to Confirm Release----//
// Trigger: Release request is pending admin approval.
// Transition: From "Release Requested" to "Waiting for Admin to Confirm Release".
//--------------------------------------------------------

//--------------Available/Not Booked (Again)------------//
// Trigger: Admin approves the release request.
// Transition: From "Waiting for Admin to Confirm Release" back to "Available/Not Booked".
//--------------------------------------------------------

//--------------Booking Rejected-----------------------//
// Trigger: Admin rejects the booking request.
// Transition: From "Waiting for Admin Approval" to "Available/Not Booked".
//--------------------------------------------------------

import React, { useEffect, useState } from "react";
import {
  getAllInstruments,
  bookInstrument,
  releaseInstrument,
  getInstrumentStatus,
  markInstrumentAsReturning,
  markInstrumentAsWaiting,
  markInstrumentAsCancelBooking,
  markInstrumentAsRejected,
  markInstrumentAsReleased,
  markInstrumentRejectApproval,
  markInstrumentAsWaitingBook
} from "../api/api";

import { useUserContext } from "../context/UserContext";
import BookingModal from "./BookingModal";
import LocationModal from './LocationModal'; // Adjust the path as necessary
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
  const [isLoadingInstrument, setIsLoadingInstrument] = useState(false);
  const [isLoadingReject, setIsLoadingReject] = useState(false);
  const [promptLoginForInstrumentId, setPromptLoginForInstrumentId] = useState(null);
  const [promptLoginForViewing, setPromptLoginForViewing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [bookedByMode, setBookedByMode] = useState(false);
  const [instrumentsBookedByMe, setInstrumentsBookedByMe] = useState([]);
  const [filteredInstruments, setFilteredInstruments] = useState([]); // <-- Add state to handle filtered instruments
  const [equipmentSearchTerm, setEquipmentSearchTerm] = useState("");
  const [modelSearchTerm, setModelSearchTerm] = useState("");
  const [bookedbySearchTerm, setBookedBySearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("all"); // possible values: "all", "byMe", "byAll"
  const isSuperUser = user && user.username === SUPER_USER_USERNAME;
  const [waitingToTake, setWaitingToTake] = useState([]);
  const [returningInstruments, setReturningInstruments] = useState([]);
  const [pendingReleaseInstruments, setPendingReleaseInstruments] = useState([]);
  //control the visibility of the LocationModal and to store the location details entered by the super user.
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [currentInstrumentId, setCurrentInstrumentId] = useState(null);
  const [modalContext, setModalContext] = useState(null); // 'waiting' , 'releasing' or 'returning'
  //const [location, setLocationDetails] = useState(null);

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

        if (bookedbySearchTerm) {
          const bookedbySearchTermLC = bookedbySearchTerm.toLowerCase();
          filtered = filtered.filter((instrument) =>
            instrument.bookedBy ?
              (typeof instrument.bookedBy === "object" ?
                instrument.bookedBy.username.toLowerCase().includes(bookedbySearchTermLC) :
                instrument.bookedBy.toLowerCase().includes(bookedbySearchTermLC)) :
              false
          );
        }

        // Update the filtered instruments
        setFilteredInstruments(sortInstruments(filtered));

        // Log relevant values for debugging
        console.log("searchTerm:", searchTerm);
        console.log("equipmentSearchTerm:", equipmentSearchTerm);
        console.log("modelSearchTerm:", modelSearchTerm);
        console.log("bookedbySearchTerm:", bookedbySearchTerm);
        console.log("bookedByMode:", bookedByMode);
        console.log("user:", user);
        console.log("filteredInstruments:", filteredInstruments);
      } catch (error) {
        console.error("Error fetching instruments:", error);
      }
    };

    fetchData();
  }, [searchTerm, equipmentSearchTerm, modelSearchTerm, bookedbySearchTerm, bookedByMode, user]);

  // Caching Mechanism:
  // implement a caching mechanism that respects the existing state machine, we need to focus on caching the status of instruments without altering 
  // the flow of state transitions. The cache should be used primarily to speed up the initial loading of instrument statuses, while ensuring that any state changes 
  // due to user actions are reflected in real-time. To implement this: Use Cache for Initial Load: When the component mounts, use cached data to display instrument 
  // statuses immediately, and then update the cache as new data is fetched from the server.
  // Update Cache on State Changes: Whenever an instrument's status changes due to user actions (booking, canceling, releasing, rejecting, etc.), 
  // update both the state and the cache to reflect these changes. Maintain Existing State Transitions: Ensure that all existing state transitions remain intact 
  // and function as expected.

  useEffect(() => {
    const fetchData = async () => {
      setIsLoadingInstrument(true);

      try {
        const allInstruments = await getAllInstruments();
        setInstruments(allInstruments);

        // Retrieve cached statuses or initialize an empty object
        const cachedStatuses = JSON.parse(localStorage.getItem('instrumentStatusesCache')) || {};
        const statusMap = { ...cachedStatuses };

        // Fetch statuses for all instruments
        const statuses = await Promise.all(
          allInstruments.map((instrument) =>
            getInstrumentStatus(instrument._id)
          )
        );

        allInstruments.forEach((instrument, index) => {
          const currentStatus = statuses[index].availability ? "Available" : "Booked";
          statusMap[instrument._id] = currentStatus;
        });

        setInstrumentStatuses(statusMap);

        // Update the cache with the latest statuses
        localStorage.setItem('instrumentStatusesCache', JSON.stringify(statusMap));
        setIsLoadingInstrument(false);
      } catch (error) {
        console.error("Error fetching instruments:", error);
        setIsLoadingInstrument(false);
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
      const aIsBooked = !!a.bookedBy;
      const bIsBooked = !!b.bookedBy;

      if (aIsBookedByUser && !bIsBookedByUser) {
        return -1;
      }

      if (!aIsBookedByUser && bIsBookedByUser) {
        return 1;
      }

      if (aIsBooked && !bIsBooked) {
        return -1;
      }

      if (!aIsBooked && bIsBooked) {
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
        await markInstrumentAsWaitingBook(selectedInstrumentId);
        const updatedInstrument = await getInstrumentStatus(selectedInstrumentId);
        updateInstrumentStates(updatedInstrument, selectedInstrumentId);

        // Update the instrument status in the cache
        const cachedStatuses = JSON.parse(localStorage.getItem('instrumentStatusesCache')) || {};
        cachedStatuses[selectedInstrumentId] = "Booked";
        localStorage.setItem('instrumentStatusesCache', JSON.stringify(cachedStatuses));
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
      const isSuperUser = user && user.username === "super user";
      const instrumentToRelease = instruments.find(instr => instr._id === id);

      if (!instrumentToRelease) {
        console.error("Instrument not found:", id);
        return;
      }

      const canRelease = (user && instrumentToRelease.bookedBy && (instrumentToRelease.bookedBy._id === user.id || instrumentToRelease.bookedBy === user.id)) || isSuperUser;

      if (!canRelease) {
        console.log("You do not have permission to release this instrument.");
        return;
      }

      if (isSuperUser) {
        await releaseInstrument(user.id, id);
        await markInstrumentAsReturning(id, true);
        await markInstrumentAsReleased(id, false);
        const updatedInstrument = await getInstrumentStatus(id);
        updateInstrumentStates(updatedInstrument, id);

        // Update the instrument status in the cache
        const cachedStatuses = JSON.parse(localStorage.getItem('instrumentStatusesCache')) || {};
        cachedStatuses[id] = "Available";
        localStorage.setItem('instrumentStatusesCache', JSON.stringify(cachedStatuses));

        setPendingReleaseInstruments(prev => prev.filter(instrId => instrId !== id));
        console.log("Instrument released successfully by super user!");
      } else {
        await markInstrumentAsReleased(id, true);
        setPendingReleaseInstruments(prev => [...prev, id]);
        console.log("Release pending admin approval. Instrument ID:", id);
      }
    } catch (error) {
      console.error("Failed to release instrument:", error);
    } finally {
      setIsLoading(false);
    }
  };


  const updateInstrumentStates = (updatedInstrument, id) => {
    // Update instrumentStatuses
    setInstrumentStatuses((prevStatuses) => ({
      ...prevStatuses,
      [id]: updatedInstrument.availability ? "Available" : "Booked",
    }));
    // Update instruments and filteredInstruments
    updateInstrumentsState(updatedInstrument, id);
    // Update the filtered view (instrumentsBookedByMe) if applicable
    if (bookedByMode) {
      setInstrumentsBookedByMe((prevInstruments) =>
        prevInstruments.map((instrument) =>
          instrument._id === id
            ? {
              ...instrument,
              availability: updatedInstrument.availability || null,
              bookedBy: updatedInstrument.bookedBy || null,
              bookedFrom: updatedInstrument.bookedFrom || null,
              bookedUntil: updatedInstrument.bookedUntil || null,
              location: updatedInstrument.location || null,
              location_inside_room: updatedInstrument.location_inside_room || null,
              returning: updatedInstrument.returning || null,
              waiting: updatedInstrument.waiting || null,
              rejecting: updatedInstrument.rejecting || null,
              releasing: updatedInstrument.releasing || null,
              rejectingapproval: updatedInstrument.rejectingapproval || null,
            }
            : instrument
        )
      );
    }
  };

  const updateInstrumentsState = (updatedInstrument, id) => {
    setInstruments((prevInstruments) =>
      prevInstruments.map((instrument) =>
        instrument._id === id
          ? {
            ...instrument,
            availability: updatedInstrument.availability || null,
            bookedBy: updatedInstrument.bookedBy || null,
            bookedFrom: updatedInstrument.bookedFrom || null,
            bookedUntil: updatedInstrument.bookedUntil || null,
            location: updatedInstrument.location || null,
            location_inside_room: updatedInstrument.location_inside_room || null,
            returning: updatedInstrument.returning || null,
            waiting: updatedInstrument.waiting || null,
            rejecting: updatedInstrument.rejecting || null,
            releasing: updatedInstrument.releasing || null,
            rejectingapproval: updatedInstrument.rejectingapproval || null,
          }
          : instrument
      )
    );
    setFilteredInstruments((prevFilteredInstruments) =>
      prevFilteredInstruments.map((instrument) =>
        instrument._id === id
          ? {
            ...instrument,
            availability: updatedInstrument.availability || null,
            bookedBy: updatedInstrument.bookedBy || null,
            bookedFrom: updatedInstrument.bookedFrom || null,
            bookedUntil: updatedInstrument.bookedUntil || null,
            location: updatedInstrument.location || null,
            location_inside_room: updatedInstrument.location_inside_room || null,
            returning: updatedInstrument.returning || null,
            waiting: updatedInstrument.waiting || null,
            rejecting: updatedInstrument.rejecting || null,
            releasing: updatedInstrument.releasing || null,
            rejectingapproval: updatedInstrument.rejectingapproval || null,
          }
          : instrument
      )
    );
  };

  const handleCancelBooking = async (id) => {
    try {
      setIsLoading(true);
      await releaseInstrument(user.id, id);
      await markInstrumentAsCancelBooking(id, false, false);
      const updatedInstrument = await getInstrumentStatus(id);
      updateInstrumentStates(updatedInstrument, id);

      // Update the instrument status in the cache
      const cachedStatuses = JSON.parse(localStorage.getItem('instrumentStatusesCache')) || {};
      cachedStatuses[id] = "Available";
      localStorage.setItem('instrumentStatusesCache', JSON.stringify(cachedStatuses));
    } catch (error) {
      console.error("Failed to cancel instrument:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRejectInstrument = async (id) => {
    try {
      setIsLoadingReject(true);
      await releaseInstrument(user.id, id);
      await markInstrumentAsRejected(id, true);
      await markInstrumentRejectApproval(id, true);
      const updatedInstrument = await getInstrumentStatus(id);
      updateInstrumentStates(updatedInstrument, id);

      // Update the instrument status in the cache
      const cachedStatuses = JSON.parse(localStorage.getItem('instrumentStatusesCache')) || {};
      cachedStatuses[id] = updatedInstrument.availability ? "Available" : "Booked";
      localStorage.setItem('instrumentStatusesCache', JSON.stringify(cachedStatuses));
    } catch (error) {
      console.error("Failed to reject instrument:", error);
    } finally {
      setIsLoadingReject(false);
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
    // Sort all instruments such that instruments booked by the current user are at the top
    setFilteredInstruments(sortInstruments(instruments));
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

  const handleWaitingClick = async (id) => {
    if (user && user.username === "super user") {
      setCurrentInstrumentId(id);
      setModalContext('waiting');
      setIsLocationModalOpen(true);
    } else {
      console.log("Only the super user can perform this action.");
    }
  };

  const handleReleasingClick = async (id) => {
    if (user && user.username === "super user") {
      setCurrentInstrumentId(id);
      setModalContext('releasing');
      setIsLocationModalOpen(true);
    } else {
      console.log("Only the super user can perform this action.");
    }
  };

  const handleReturningClick = async (id) => {
    if (user && user.username === "super user") {
      setCurrentInstrumentId(id);
      setModalContext('returning');
      setIsLocationModalOpen(true);
    } else {
      console.log("Only the super user can perform this action.");
    }
  };

  //Handle Location Submission:
  //handleLocationSubmit is a function to handle the submission of location details from the LocationModal. 
  //This function should perform the necessary actions (such as updating the instrument's location) after the super user submits the location details.
  const handleLocationSubmit = async ({ location, locationRoom }) => {
    try {
      if (modalContext === 'waiting') {
        // Logic from handleWaitingClick
        setFilteredInstruments((prevInstruments) =>
          prevInstruments.map((instrument) =>
            instrument._id === currentInstrumentId ? { ...instrument, waiting: false } : instrument
          )
        );
        console.log(`(Waiting) : Submitting location for instrument ID: ${currentInstrumentId}`);
        console.log("markInstrumentAsWaiting with location:", location.location);

        await markInstrumentAsWaiting(currentInstrumentId, false, location, locationRoom);
        const updatedInstrument = await getInstrumentStatus(currentInstrumentId);
        updateInstrumentStates(updatedInstrument, currentInstrumentId);
        // Additional logic for handling 'waiting' context
        // For example, updating the instrument's location with locationDetails
      } else if (modalContext === 'releasing') {
        // Logic from handleReleasingClick
        setIsLoading(true);
        console.log(`(Releasing) : Submitting location for instrument ID: ${currentInstrumentId}`);
        await releaseInstrument(user.id, currentInstrumentId);
        await markInstrumentAsReleased(currentInstrumentId, false, location, locationRoom);
        const updatedInstrument = await getInstrumentStatus(currentInstrumentId);
        updateInstrumentStates(updatedInstrument, currentInstrumentId);
        setPendingReleaseInstruments((prevReleasing) => prevReleasing.filter((instrId) => instrId !== currentInstrumentId));
        setIsLoading(false);
        // Additional logic for handling 'releasing' context
        // For example, updating the instrument's location with locationDetails
        console.log("handleLocationSubmit ('releasing'): Calling setLocation...");
      } else if (modalContext === 'returning') {
        // Optimistically update the UI to reflect that the instrument is no longer returning
        setFilteredInstruments((prevInstruments) =>
          prevInstruments.map((instrument) =>
            instrument._id === currentInstrumentId ? { ...instrument, returning: false } : instrument
          )
        );
        console.log(`(Returning) : Submitting location for instrument ID: ${currentInstrumentId}`);
        //await markInstrumentAsReturning(currentInstrumentId, false, location.location, location.locationRoom);
        await markInstrumentAsReturning(currentInstrumentId, false, location, locationRoom);
        const updatedInstrument = await getInstrumentStatus(currentInstrumentId);
        updateInstrumentStates(updatedInstrument, currentInstrumentId);
        console.log("Instrument released successfully!");
      }
      // Common logic after handling specific context
      // For example, updating the instrument's location, closing the modal, etc.
    } catch (error) {
      console.error("Error in handleLocationSubmit:", error);
      // Revert the optimistic update if the API call fails
      if (modalContext === 'waiting') {
        setFilteredInstruments((prevInstruments) =>
          prevInstruments.map((instrument) =>
            instrument._id === currentInstrumentId ? { ...instrument, waiting: true } : instrument
          )
        );
      } else if (modalContext === 'releasing') {
        setFilteredInstruments((prevInstruments) =>
          prevInstruments.map((instrument) =>
            instrument._id === currentInstrumentId ? { ...instrument, releasing: true } : instrument
          )
        );
      } else if (modalContext === 'returning') {
        setFilteredInstruments((prevInstruments) =>
          prevInstruments.map((instrument) =>
            instrument._id === currentInstrumentId ? { ...instrument, returning: true } : instrument
          )
        );
      }
    } finally {
      // Reset the context and close the modal
      setModalContext(null);
      setIsLocationModalOpen(false);
    }
  };

  // Define this function in InstrumentList.js
  const handleModalClose = () => {
    setIsLocationModalOpen(false);
    // Reset any other state or context as needed
    // For example: setModalContext(null);
    setModalContext(null);
  };

  // When clicking the "Rejecting the instrument" button
  const handleRejectingUserClick = async (id) => {
    // Find the instrument being rejected
    const instrumentToReject = instruments.find(instr => instr._id === id);
    // If the instrument is not found, return early
    if (!instrumentToReject) {
      console.error("Instrument not found:", id);
      return;
    }

    // Optimistically update the UI to reflect that the instrument is no longer rejecting
    setFilteredInstruments((prevInstruments) =>
      prevInstruments.map((instrument) =>
        instrument._id === id ? { ...instrument, rejecting: false } : instrument
      )
    );

    try {
      setIsLoading(true);
      setTimeout(async () => {
        // Release the instrument
        //await releaseInstrument(user.id, id);
        await markInstrumentAsRejected(id, false); // This will set waiting and returning to false
        await markInstrumentRejectApproval(id, false);
        // Fetch the updated instrument data
        const updatedInstrument = await getInstrumentStatus(id);

        // Update instrumentStatuses
        setInstrumentStatuses((prevStatuses) => ({
          ...prevStatuses,
          [id]: updatedInstrument.availability ? "Available" : "Booked",
        }));

        // Update instrument details, including bookedBy, bookedFrom, and bookedUntil
        updateInstrumentStates(updatedInstrument, id);

        console.log("Instrument booking rejected successfully!");
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error("Failed to reject instrument:", error);
    }
  };

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
          Type:{" "}
          <span style={{ fontWeight: "bold", fontSize: "1.1em", color: "#014C8C" }}>
            {instrument.type}
          </span>
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
        <div>
          <span style={{ fontWeight: "bold" }}>Booked by: </span>
          {instrument.bookedBy
            ? typeof instrument.bookedBy === "object"
              ? instrument.bookedBy.username
              : instrument.bookedBy
            : "N/A"}
        </div>
        {/* Add a visual cue for waiting status */}
        {/* {waitingToTake.includes(instrument._id) && (
          <div style={{ color: 'orange', fontWeight: 'bold' }}>Waiting to be taken</div>
        )} */}

        {/* Add a visual cue for returning status */}
        {/* {returningInstruments.includes(instrument._id) && (
          <div style={{ color: 'orange', fontWeight: 'bold' }}>Returning</div>
        )} */}

        {/* Updated: Expand/Collapse Button */}
        <button onClick={() => toggleInstrumentDetails(instrument._id)}>
          {expandedInstrumentId === instrument._id ? "Collapse" : "Expand"}
        </button>
        {/* All the additional details to be shown when expanded */}
        {expandedInstrumentId === instrument._id && (
          <div>
            {/* All the additional details to be shown when expanded */}
            {/* <div>
              <span style={{ fontWeight: "bold" }}>Waiting: </span>
              {instrument.waiting ? "Yes" : "No"}
            </div>
            <div>
              <span style={{ fontWeight: "bold" }}>Returning: </span>
              {instrument.returning ? "Yes" : "No"}
            </div>
            <div>
              <span style={{ fontWeight: "bold" }}>Releasing: </span>
              {instrument.releasing ? "Yes" : "No"}
            </div>
            <div>
              <span style={{ fontWeight: "bold" }}>Rejecting: </span>
              {instrument.rejecting ? "Yes" : "No"}
            </div>
            <div>
              <span style={{ fontWeight: "bold" }}>RejectingApproval: </span>
              {instrument.rejectingapproval ? "Yes" : "No"}
            </div>             */}
            <div>
              <span style={{ fontWeight: "bold" }}>producer: </span>
              {instrument.producer}
            </div>
            <div>
              <span style={{ fontWeight: "bold" }}>producer_serial_number: </span>
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
            {/* <div>
              <span style={{ fontWeight: "bold" }}>Booked by: </span>
              {instrument.bookedBy
                ? typeof instrument.bookedBy === "object"
                  ? instrument.bookedBy.username
                  : instrument.bookedBy
                : "N/A"}
            </div> */}
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

        {/* Book Button */}
        {/* {instrumentStatuses[instrument._id] === "Available" && !waitingToTake.includes(instrument._id) && !returningInstruments.includes(instrument._id) &&  */}
        {!instrument.returning && !instrument.waiting && instrumentStatuses[instrument._id] === "Available" && (
          // !instrument.returning &&(
          <button
            onClick={() => handleBookInstrument(instrument._id)}
            className="book-button"
          >
            Request for Booking
          </button>
        )}

        {instrument._id === promptLoginForInstrumentId && (
          <div className="login-prompt">
            You must be logged in to book this instrument.
          </div>
        )}

        {/* Release Button */}
        {instrumentStatuses[instrument._id] === "Booked" &&
          (instrument.bookedBy && user && (instrument.bookedBy._id === user.id || instrument.bookedBy === user.id || user.username === "super user")) &&
          !instrument.rejecting && !instrument.waiting && (
            <div>
              {/* Spinner for Loading State */}
              {isLoading && (
                <div className="loading-container">
                  <div className="spinner"></div>
                  <span className="loading-text">Releasing...</span>
                </div>
              )}

              {/* Modification: Check if the instrument is in the pendingReleaseInstruments array */}
              {(pendingReleaseInstruments.includes(instrument._id) || instrument.releasing) ? (
                <button
                  onClick={() => handleReleasingClick(instrument._id)}
                  className="pending-release"
                >
                  {/* user is releasing instrument */}
                  Release pending admin approval...
                </button>
              ) : (
                <button
                  onClick={() => handleReleaseInstrument(instrument._id)}
                  style={{
                    marginTop: "10px",
                    backgroundColor: "#FF0000", // Red for release action
                    color: "white",
                    border: "none",
                    padding: "5px 10px",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  Release
                </button>
              )}
            </div>
          )}

        {instrumentStatuses[instrument._id] === "Booked" && instrument.bookedBy && user && !instrument.returning && instrument.waiting &&
          (instrument.bookedBy._id === user.id ||
            instrument.bookedBy === user.id) && (
            <div>
              {isLoading && (
                <div className="loading-container">
                  <div className="spinner"></div>
                  <span className="loading-text">Cancel Booking...</span>
                </div>
              )}
              <button
                onClick={() => handleCancelBooking(instrument._id)}
                style={{
                  marginTop: "10px",
                  backgroundColor: "#808080", // Choose a color that denotes a release action
                  color: "white",
                  border: "none",
                  padding: "5px 10px",
                  borderRadius: "4px",
                  cursor: "pointer",
                  //width: "100%", // Set the width to 100% to span the entire container
                }}
              >
                Cancel Booking Request
              </button>
            </div>
          )}

        {/* Waiting to take the instrument Button */}
        {instrument.waiting && !instrument.returning && (
          <button
            onClick={() => handleWaitingClick(instrument._id)}
            className="waiting-button"
          >
            {/* Waiting to take the instrument */}
            Waiting for the admin approval...
          </button>
        )}

        {/* Instrument is returning back Button */}
        {!instrument.waiting && instrument.returning && (
          <button
            onClick={() => handleReturningClick(instrument._id)}
            className="returning-button"
          >
            {/* Instrument is returning back */}
            Not yet bookable: Waiting for the admin retrieval...
          </button>
        )}

        {/* Rejecting the instrument Button users side*/}
        {
          // (user && user.username !== "super user") && !instrument.rejecting && instrument.rejectingapproval && (
          (user && user.username !== "super user") && instrument.rejecting && instrument.rejectingapproval && (

            //instrument.rejectingapproval && (
            <button
              onClick={() => handleRejectingUserClick(instrument._id)}
              className="rejecting-button"
            >
              !! The Instrument booking has been rejected by admin !! ...please click to cancel
            </button>
          )
        }


        {/* Reject Button*/}
        {
          (user && user.username === "super user") && instrument.waiting && !instrument.returning &&
          (
            <div>
              {isLoadingReject ? (
                <div className="loading-container">
                  <div className="spinner"></div>
                  <span className="loading-text">Rejecting...</span>
                </div>
              ) : (
                // Here we check if the current user is the super user before rendering the Rejecting button
                user && user.username === "super user" && (
                  <button
                    onClick={() => handleRejectInstrument(instrument._id)}
                    className="rejecting-button"
                  >
                    Reject
                  </button>
                )
              )}
            </div>
          )
        }
      </div>
    );
  };

  const AllInstrumentsView = ({ searchTerm, equipmentSearchTerm, modelSearchTerm, bookedbySearchTerm }) => {
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

        {/* Spinner shown when data is loading */}
        {isLoadingInstrument && (
          <div className="spinner-center">
            <div className="spinner"></div>
            Loading instruments...
          </div>
        )}

        {/* Render instrument details only when not loading */}
        {/* List of all instruments */}
        {!isLoadingInstrument && filteredInstruments
          .filter((instrument) => {
            // Apply your search filter based on 'searchTerm'
            const searchTermLC = searchTerm.toLowerCase();
            const matchesDescription = instrument.description.toLowerCase().includes(searchTermLC);
            // Apply equipment and model filters based on 'equipmentSearchTerm' and 'modelSearchTerm'
            const equipmentSearchTermLC = equipmentSearchTerm.toLowerCase();
            const modelSearchTermLC = modelSearchTerm.toLowerCase();
            const bookedbySearchTermLC = bookedbySearchTerm ? bookedbySearchTerm.toLowerCase() : "";
            const matchesEquipment = instrument.equipment.toLowerCase().includes(equipmentSearchTermLC);
            const matchesModel = instrument.model.toLowerCase().includes(modelSearchTermLC);
            const matchesBookedby = instrument.bookedBy ?
              (typeof instrument.bookedBy === "object" ?
                instrument.bookedBy.username.toLowerCase().includes(bookedbySearchTermLC) :
                instrument.bookedBy.toLowerCase().includes(bookedbySearchTermLC)) :
              false;
            // Combine all filter conditions using logical OR (||)
            return (
              matchesDescription ||
              matchesEquipment ||
              matchesModel ||
              matchesBookedby
            );
          })
          .map((instrument) => {
            // Render each instrument detail
            return renderInstrumentDetails(instrument);
          })}
      </div>
    );
  };


  const BookedByMeView = ({ searchTerm, equipmentSearchTerm, modelSearchTerm, bookedbySearchTerm, handleViewAllInstruments, filteredInstruments }) => {
    return (
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
            const bookedbySearchTermLC = bookedbySearchTerm ? bookedbySearchTerm.toLowerCase() : "";
            const matchesModel = instrument.model.toLowerCase().includes(modelSearchTermLC);
            const matchesBookedby = instrument.bookedBy ?
              (typeof instrument.bookedBy === "object" ?
                instrument.bookedBy.username.toLowerCase().includes(bookedbySearchTermLC) :
                instrument.bookedBy.toLowerCase().includes(bookedbySearchTermLC)) :
              false;

            return (
              matchesDescription ||
              matchesEquipment ||
              matchesModel ||
              matchesBookedby
            );
          })
          //.filter((instrument) => instrument.bookedBy && instrument.bookedBy._id === user.id) //<=== id undefined
          .filter((instrument) => instrument.bookedBy)
          .map((instrument) => renderInstrumentDetails(instrument))}
      </div>
    );
  };

  const BookedByAllUsersView = ({ searchTerm, equipmentSearchTerm, modelSearchTerm, bookedbySearchTerm, handleViewAllInstruments, filteredInstruments }) => {
    return (
      <div>
        <button
          onClick={handleViewAllInstruments}
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
            const bookedbySearchTermLC = bookedbySearchTerm ? bookedbySearchTerm.toLowerCase() : "";
            const matchesModel = instrument.model.toLowerCase().includes(modelSearchTermLC);
            const matchesBookedby = instrument.bookedBy ?
              (typeof instrument.bookedBy === "object" ?
                instrument.bookedBy.username.toLowerCase().includes(bookedbySearchTermLC) :
                instrument.bookedBy.toLowerCase().includes(bookedbySearchTermLC)) :
              false;
            return (
              matchesDescription ||
              matchesEquipment ||
              matchesModel ||
              matchesBookedby
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
        <input
          type="text"
          placeholder="Search by user..."
          value={bookedbySearchTerm}
          onChange={(e) => setBookedBySearchTerm(e.target.value)}
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
          filteredInstruments={filteredInstruments}
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
      <LocationModal
        isOpen={isLocationModalOpen}
        onRequestClose={handleModalClose}
        onSubmitLocation={handleLocationSubmit}
        currentInstrumentId={currentInstrumentId}
      />
    </div>
  );

};

export default InstrumentList;