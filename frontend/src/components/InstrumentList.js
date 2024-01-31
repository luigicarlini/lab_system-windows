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
//import { useLocation } from 'react-router-dom';
import BookingModal from "./BookingModal";
import LocationModal from './LocationModal'; // Adjust the path as necessary
import "./InstrumentList.css";


const InstrumentList = () => {
  const SUPER_USER_USERNAME = "super user"
  const [instruments, setInstruments] = useState([]);
  const [instrumentStatuses, setInstrumentStatuses] = useState({});
  const { user } = useUserContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [instrumentInfo, setInstrumentInfo] = useState(null); // Define instrumentInfo
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
  const [pendingApprovalMode, setPendingApprovalMode] = useState(false);
  const [pendingReleaselMode, setPendingReleaseMode] = useState(false);
  const [instrumentsBookedByMe, setInstrumentsBookedByMe] = useState([]);
  const [filteredInstruments, setFilteredInstruments] = useState([]); // <-- Add state to handle filtered instruments
  const [equipmentSearchTerm, setEquipmentSearchTerm] = useState("");
  const [modelSearchTerm, setModelSearchTerm] = useState("");
  const [locationSearchTerm, setLocationSearchTerm] = useState("");
  const [projectSearchTerm, setProjectSearchTerm] = useState("");
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
  const [selectedCategory, setSelectedCategory] = useState(null); //State for Selected Category: Add a state to track the currently selected category.
  const [cancelBookingLoading, setCancelBookingLoading] = useState(false);
  // const [releaseLoading, setReleaseLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const allInstruments = await getAllInstruments();

        // Combine filtering based on search term, bookedByMode, equipmentSearchTerm, and modelSearchTerm
        let filtered = allInstruments;

        if (searchTerm) {
          const searchTermLC = searchTerm.toLowerCase();
          filtered = filtered.filter((instrument) =>
            //instrument.description.toLowerCase().includes(searchTermLC)
            instrument.type.toLowerCase().includes(searchTermLC)
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

        if (locationSearchTerm) {
          const locationSearchTermLC = locationSearchTerm.toLowerCase();
          filtered = filtered.filter((instrument) =>
          instrument.location && instrument.location.toLowerCase().includes(locationSearchTermLC)
          );
        }

        if (projectSearchTerm) {
          const projectSearchTermLC = projectSearchTerm.toLowerCase();
          filtered = filtered.filter((instrument) =>
          instrument.project && instrument.project.toLowerCase().includes(projectSearchTermLC)
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
        console.log("locationSearchTerm:", locationSearchTerm);
        console.log("projectSearchTerm:", projectSearchTerm);
        console.log("bookedbySearchTerm:", bookedbySearchTerm);
        console.log("bookedByMode:", bookedByMode);
        console.log("user:", user);
        console.log("filteredInstruments:", filteredInstruments);
      } catch (error) {
        console.error("Error fetching instruments:", error);
      }
    };

    fetchData();
  }, [searchTerm, equipmentSearchTerm, modelSearchTerm, locationSearchTerm, projectSearchTerm, bookedbySearchTerm, bookedByMode, user]);

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
        let statusMap = { ...cachedStatuses };

        // Identify instruments with "Unknown" status or not in the cache
        const instrumentsToUpdate = allInstruments.filter(instrument =>
          !statusMap[instrument._id] || statusMap[instrument._id] === "Unknown"
        );

        // Fetch statuses only for instruments needing an update
        if (instrumentsToUpdate.length > 0) {
          const updatedStatuses = await Promise.all(
            instrumentsToUpdate.map(instrument =>
              getInstrumentStatus(instrument._id)
            )
          );

          updatedStatuses.forEach((status, index) => {
            const currentStatus = status.availability ? "Available" : "Booked";
            statusMap[instrumentsToUpdate[index]._id] = currentStatus;
          });
        }

        setInstrumentStatuses(statusMap);

        // Update the cache with the latest statuses
        localStorage.setItem('instrumentStatusesCache', JSON.stringify(statusMap));
      } catch (error) {
        console.error("Error fetching instruments:", error);
      } finally {
        setIsLoadingInstrument(false);
      }
    };

    fetchData();
  }, [bookingMade]);

  // Function to handle category selection
  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
  };

  const handleAllCategories = () => {
    setSelectedCategory(null); // Assuming you have a state variable 'selectedCategory'
  };

  // const renderCategoryButtons = () => {
  //   const categories = [...new Set(instruments.map(instr => instr.type))];
  //   return (
  //     <>
  //       <button
  //         onClick={handleAllCategories}
  //         className="category-button"
  //       >
  //         All Categories
  //       </button>
  //       {categories.map(category => (
  //         <button
  //           key={category}
  //           onClick={() => handleCategorySelect(category)}
  //           className="category-button"
  //         >
  //           {category}
  //         </button>
  //       ))}
  //     </>
  //   );
  // };

  const renderCategoryButtons = () => {
    const categories = [...new Set(instruments.map(instr => instr.type))];
    return (
      <>
        <button
          onClick={handleAllCategories}
          className={`category-button ${selectedCategory === null ? 'selected-category' : ''}`}
        >
          All Categories
        </button>
        {categories.map(category => (
          <button
            key={category}
            onClick={() => handleCategorySelect(category)}
            className={`category-button ${selectedCategory === category ? 'selected-category' : ''}`}
          >
            {category}
          </button>
        ))}
      </>
    );
  };


  // const sortInstruments = (instrumentsToSort) => {
  //   return [...instrumentsToSort].sort((a, b) => {
  //     if (!user) {
  //       return 0;
  //     }

  //     const aIsBookedByUser = a.bookedBy && a.bookedBy._id === user.id;
  //     const bIsBookedByUser = b.bookedBy && b.bookedBy._id === user.id;
  //     const aIsBooked = !!a.bookedBy;
  //     const bIsBooked = !!b.bookedBy;

  //     if (aIsBookedByUser && !bIsBookedByUser) {
  //       return -1;
  //     }

  //     if (!aIsBookedByUser && bIsBookedByUser) {
  //       return 1;
  //     }

  //     if (aIsBooked && !bIsBooked) {
  //       return -1;
  //     }

  //     if (!aIsBooked && bIsBooked) {
  //       return 1;
  //     }

  //     return 0;
  //   });
  // };

  //const sortInstruments = (instrumentsToSort, user, pendingReleaseInstruments) => {
  const sortInstruments = (instrumentsToSort) => {
    return [...instrumentsToSort].sort((a, b) => {
      if (!user) {
        return 0;
      }

      const aIsBookedByUser = a.bookedBy && a.bookedBy._id === user.id;
      const bIsBookedByUser = b.bookedBy && b.bookedBy._id === user.id;
      const aIsBooked = !!a.bookedBy;
      const bIsBooked = !!b.bookedBy;
      const aWaitingAndNotReturning = a.waiting && !a.returning;
      const bWaitingAndNotReturning = b.waiting && !b.returning;
      const aCondition = aWaitingAndNotReturning && (pendingReleaseInstruments.includes(a._id) || a.releasing);
      const bCondition = bWaitingAndNotReturning && (pendingReleaseInstruments.includes(b._id) || b.releasing);

      if (aCondition && !bCondition) {
        return -1;
      }

      if (!aCondition && bCondition) {
        return 1;
      }

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

  const handleBookInstrument = (id, instrumentInfo) => {
    if (!user) {
      console.log("You must be logged in to book an instrument.");
      setPromptLoginForInstrumentId(id);
      return;
    }
    console.log("Attempting to book instrument with ID:", id);
    setSelectedInstrumentId(id);
    setIsModalOpen(true);
    setInstrumentInfo(instrumentInfo); // Set instrumentInfo
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
        await markInstrumentAsReturning(id, true, instrumentToRelease.location, instrumentToRelease.location_inside_room);
        await markInstrumentAsReleased(id, false, instrumentToRelease.location, instrumentToRelease.location_inside_room);
        const updatedInstrument = await getInstrumentStatus(id);
        updateInstrumentStates(updatedInstrument, id);

        // Update the instrument status in the cache
        const cachedStatuses = JSON.parse(localStorage.getItem('instrumentStatusesCache')) || {};
        cachedStatuses[id] = "Available";
        localStorage.setItem('instrumentStatusesCache', JSON.stringify(cachedStatuses));

        setPendingReleaseInstruments(prev => prev.filter(instrId => instrId !== id));
        console.log("Instrument released successfully by super user!");
      } else {
        await markInstrumentAsReleased(id, true, instrumentToRelease.location, instrumentToRelease.location_inside_room);
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
              project: updatedInstrument.project || null,
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
            project: updatedInstrument.project || null,
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
            project: updatedInstrument.project || null,
          }
          : instrument
      )
    );
  };

  const handleCancelBooking = async (id) => {
    try {
      setCancelBookingLoading(true);
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
      setCancelBookingLoading(false);
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

  const handleViewWaitingForApproval = () => {
    if (!user) {
      console.log("You must be logged in to view instruments in pending approval state.");
      setPromptLoginForViewing(true);
      return;
    }
    setPendingApprovalMode(true);
    setViewMode("byPendingApproval");
    try {
      // Filter the instruments that are waiting for admin approval
      const waitingForApprovalInstruments = instruments.filter(
        (instrument) => instrument.waiting && !instrument.returning
      );
      //setInstrumentsBookedByMe(sortInstruments(instrumentsBookedBy));
      setFilteredInstruments(sortInstruments(waitingForApprovalInstruments));

      // Add console log to check all instruments booked by any user
      console.log("Instruments in pending approval state:", waitingForApprovalInstruments);

      // Add console log to check which instruments are selected
      console.log(
        "Instruments selected in waitingForApprovalInstruments:",
        waitingForApprovalInstruments
      );
    } catch (error) {
      console.error("Error fetching instruments booked by all users:", error);
    }
  };

  const handleViewWaitingForRelease = () => {
    if (!user) {
      console.log("You must be logged in to view instruments in pending approval state.");
      setPromptLoginForViewing(true);
      return;
    }
    setPendingReleaseMode(true);
    setViewMode("byReleaseApproval");
    try {
      // Filter the instruments that are waiting for admin approval
      const waitingForReleaseInstruments = instruments.filter(
        (instrument) => pendingReleaseInstruments.includes(instrument._id) || instrument.releasing
      );
      //setInstrumentsBookedByMe(sortInstruments(instrumentsBookedBy));
      setFilteredInstruments(sortInstruments(waitingForReleaseInstruments));

      // Add console log to check all instruments booked by any user
      console.log("Instruments in pending Release state:", waitingForReleaseInstruments);

      // Add console log to check which instruments are selected
      console.log(
        "Instruments selected in waitingForApprovalInstruments:",
        waitingForReleaseInstruments
      );
    } catch (error) {
      console.error("Error fetching instruments in pending release state:", error);
    }
  };


  const handleWaitingClick = async (id, InstrumentInfo) => {
    if (user && user.username === "super user") {
      setCurrentInstrumentId(id);
      setModalContext('waiting');
      setIsLocationModalOpen(true);

      // Set instrumentInfo if available
      setInstrumentInfo(InstrumentInfo); // Replace updatedInstrument with the actual data
    } else {
      console.log("Only the super user can perform this action.");
    }
  };

  const handleReleasingClick = async (id, InstrumentInfo) => {
    if (user && user.username === "super user") {
      setCurrentInstrumentId(id);
      setModalContext('releasing');
      setIsLocationModalOpen(true);
      // Set instrumentInfo if available
      setInstrumentInfo(InstrumentInfo); // Replace updatedInstrument with the actual data
    } else {
      console.log("Only the super user can perform this action.");
    }
  };

  const handleReturningClick = async (id, InstrumentInfo) => {
    if (user && user.username === "super user") {
      setCurrentInstrumentId(id);
      setModalContext('returning');
      setIsLocationModalOpen(true);
      // Set instrumentInfo if available
      setInstrumentInfo(InstrumentInfo); // Replace updatedInstrument with the actual data
    } else {
      console.log("Only the super user can perform this action.");
    }
  };

  //Handle Location Submission:
  //handleLocationSubmit is a function to handle the submission of location details from the LocationModal. 
  //This function should perform the necessary actions (such as updating the instrument's location) after the super user submits the location details.
  const handleLocationSubmit = async ({ location, locationRoom, project }) => {
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

        await markInstrumentAsWaiting(currentInstrumentId, false, location, locationRoom, project);
        const updatedInstrument = await getInstrumentStatus(currentInstrumentId);
        updateInstrumentStates(updatedInstrument, currentInstrumentId);
        // Additional logic for handling 'waiting' context
        // For example, updating the instrument's location with locationDetails
      } else if (modalContext === 'releasing') {
        // Logic from handleReleasingClick
        setIsLoading(true);
        console.log(`(Releasing) : Submitting location for instrument ID: ${currentInstrumentId}`);
        await releaseInstrument(user.id, currentInstrumentId);
        await markInstrumentAsReleased(currentInstrumentId, false, location, locationRoom, project);

        const updatedInstrument = await getInstrumentStatus(currentInstrumentId);

        console.log("Before updateInstrumentStates: Current Instrument ID:", currentInstrumentId);
        console.log("updateInstrumentStates: Updated Instrument:", updatedInstrument);

        updateInstrumentStates(updatedInstrument, currentInstrumentId);

        // Set instrumentInfo if available
        setInstrumentInfo(updatedInstrument); // Replace updatedInstrument with the actual data
        console.log("After setInstrumentInfo: Current Instrument ID:", currentInstrumentId);
        console.log("After setInstrumentInfo: Updated Instrument:", updatedInstrument);


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
        await markInstrumentAsReturning(currentInstrumentId, false, location, locationRoom, project);
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
    // Skip rendering if the instrument's category doesn't match the selected category
    if (selectedCategory && instrument.type !== selectedCategory) {
      return null;
    }
    // Determine the status of the instrument
    let status = instrumentStatuses[instrument._id];
    if (instrument.bookedBy === "N/A" || instrument.bookedBy === null) {
      status = "Available";
    }
    if (instrument.bookedBy) {
      instrumentStatuses[instrument._id] = "Booked";
    }
    return (

      <div
        key={instrument._id}
        style={{
          marginBottom: "10px",
          border:
            status === "Booked" &&
              instrument.bookedBy
              ? "1px solid #014C8C"
              : status === "Available"
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
          {/* {instrument.description} */}
        </div>
        <div style={{ fontWeight: "bold", fontSize: "1.0em", color: "black" }}>
          Category:{" "}
          <span style={{ fontWeight: "bold", fontSize: "1.1em", color: "#014C8C" }}>
            {instrument.type}
          </span>
        </div>
        <div style={{ fontWeight: "bold", fontSize: "1.0em", color: "black" }}>
          Equipment name:{" "}
          <span style={{ fontWeight: "bold", fontSize: "1.1em", color: "#014C8C" }}>
            {instrument.description}
          </span>
        </div>
        <div style={{ fontWeight: "bold", fontSize: "1.0em", color: "black" }}>
          Model:{" "}
          <span style={{ fontWeight: "bold", fontSize: "1.1em", color: "#014C8C" }}>
            {instrument.model}
          </span>
        </div>
        <div style={{ fontWeight: "bold", fontSize: "1.0em", color: "black" }}>
          Equipment Description:{" "}
          <span style={{ fontWeight: "bold", fontSize: "1.1em", color: "#014C8C" }}>
            {instrument.equipment}
          </span>
        </div>
        <div>
          <span style={{ fontWeight: "bold" }}>Status: </span>
          <span
            style={{
              color:
                status === "Booked"
                  ? "red"
                  : status === "Available"
                    ? "green"
                    : "black",
              fontWeight:
                status === "Booked" ||
                  status === "Available"
                  ? "bold"
                  : "normal",
            }}
          >
            {status
              ? `${status}`
              : "Unknown"}
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
              <span style={{ fontWeight: "bold" }}>equipment producer: </span>
              {instrument.producer}
            </div>
            <div>
              <span style={{ fontWeight: "bold" }}>producer_serial_number: </span>
              {instrument.serial_number}
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
              <span style={{ fontWeight: "bold" }}>ownership: </span>
              {instrument.materiale_ericsson}
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
              {instrument.ip_address}
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
              <span style={{ fontWeight: "bold" }}>Booked until: </span>
              {instrument.bookedUntil || "N/A"}
            </div>
          </div>
        )}

        {/* Book Button */}
        {!instrument.returning && !instrument.waiting && !instrument.bookedUntil && (instrumentStatuses[instrument._id] === "Available" || instrument.bookedBy === "N/A" || instrument.bookedBy === null) && (
          <button
            onClick={() => handleBookInstrument(instrument._id, instrument)}
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
        {/* {console.log("Debug - Instrument Status: ", instrumentStatuses[instrument._id])}
            {console.log("Debug - Booked By: ", instrument.bookedBy)}
            {console.log("Debug - User: ", user)}
            {console.log("Debug - Booked Until: ", instrument.bookedUntil)} */}
        {instrumentStatuses[instrument._id] === "Booked" &&
          (instrument.bookedBy && user && (instrument.bookedBy._id === user.id || instrument.bookedBy === user.id || user.username === "super user")) &&
          !instrument.rejecting && !instrument.waiting &&
          (instrument.bookedUntil && instrument.bookedUntil !== "N/A") && (
            <div>
              {/* Spinner for Loading State */}
              {isLoading && (
                <div className="loading-container">
                  <div className="spinner"></div>
                  <span className="loading-text">Releasing...</span>
                </div>
              )}

              {/* Check if the instrument is in the pendingReleaseInstruments array */}
              {(pendingReleaseInstruments.includes(instrument._id) || instrument.releasing) ? (
                <button
                  onClick={() => handleReleasingClick(instrument._id, instrument)}
                  className="pending-release"
                >
                  Release pending admin approval...
                </button>
              ) : (
                <button
                  onClick={() => handleReleaseInstrument(instrument._id)}
                  style={{
                    marginTop: "10px",
                    backgroundColor: "#FF0000",
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
              {cancelBookingLoading && (
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
            onClick={() => handleWaitingClick(instrument._id, instrument)}
            className="waiting-button"
          >
            {/* Waiting to take the instrument */}
            Waiting for the admin approval...
          </button>
        )}

        {/* Instrument is returning back Button */}
        {!instrument.waiting && instrument.returning && (
          <button
            onClick={() => handleReturningClick(instrument._id, instrument)}
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

  const AllInstrumentsView = ({ searchTerm, equipmentSearchTerm, modelSearchTerm, locationSearchTerm, projectSearchTerm, bookedbySearchTerm }) => {
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

        <button
          onClick={() => {
            console.log("JSX: Waiting for Approval button clicked");
            handleViewWaitingForApproval(); // Create this function to handle the filter
          }}
          style={{
            marginTop: "10px",
            backgroundColor: "#ffc107", // Use your preferred color
            color: "green",
            border: "none",
            padding: "5px 10px",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "1.0em",
          }}
        >
          Waiting for Approval
        </button>

        <button
          onClick={() => {
            console.log("JSX: Waiting for Approval button clicked");
            handleViewWaitingForRelease(); // Create this function to handle the filter
          }}
          style={{
            marginTop: "10px",
            backgroundColor: "#ffc107", // Use your preferred color
            color: "red",
            border: "none",
            padding: "5px 10px",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "1.0em",
          }}
        >
          Waiting for Release Approval
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
            //const matchesDescription = instrument.description.toLowerCase().includes(searchTermLC);
            const matchesDescription = instrument.type.toLowerCase().includes(searchTermLC);
            // Apply equipment and model filters based on 'equipmentSearchTerm' and 'modelSearchTerm'
            const equipmentSearchTermLC = equipmentSearchTerm.toLowerCase();
            const modelSearchTermLC = modelSearchTerm.toLowerCase();
            const locationSearchTermLC = locationSearchTerm.toLowerCase();
            const projectSearchTermLC = projectSearchTerm.toLowerCase();
            const bookedbySearchTermLC = bookedbySearchTerm ? bookedbySearchTerm.toLowerCase() : "";
            const matchesEquipment = instrument.equipment.toLowerCase().includes(equipmentSearchTermLC);
            const matchesModel = instrument.model.toLowerCase().includes(modelSearchTermLC);
            //const matchesLocation = instrument.location.toLowerCase().includes(locationSearchTermLC);
            const matchesLocation = instrument.location && instrument.location.toLowerCase().includes(locationSearchTermLC);
            const matchesProject = instrument.project ? instrument.project.toLowerCase().includes(projectSearchTermLC) : false;
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
              matchesLocation ||
              matchesProject ||
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


  const BookedByMeView = ({ searchTerm, equipmentSearchTerm, modelSearchTerm, locationSearchTerm, projectSearchTerm, bookedbySearchTerm, handleViewAllInstruments, filteredInstruments }) => {
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
            //const matchesDescription = instrument.description.toLowerCase().includes(searchTermLC);
            const matchesDescription = instrument.type.toLowerCase().includes(searchTermLC);
            const equipmentSearchTermLC = equipmentSearchTerm.toLowerCase();
            const matchesEquipment = instrument.equipment.toLowerCase().includes(equipmentSearchTermLC);
            const modelSearchTermLC = modelSearchTerm.toLowerCase();
            const locationSearchTermLC = locationSearchTerm.toLowerCase();
            const projectSearchTermLC = projectSearchTerm.toLowerCase();
            const bookedbySearchTermLC = bookedbySearchTerm ? bookedbySearchTerm.toLowerCase() : "";
            const matchesModel = instrument.model.toLowerCase().includes(modelSearchTermLC);
            //const matchesLocation = instrument.location.toLowerCase().includes(locationSearchTermLC);
            const matchesLocation = instrument.location && instrument.location.toLowerCase().includes(locationSearchTermLC);
            const matchesProject = instrument.project ? instrument.project.toLowerCase().includes(projectSearchTermLC) : false;
            const matchesBookedby = instrument.bookedBy ?
              (typeof instrument.bookedBy === "object" ?
                instrument.bookedBy.username.toLowerCase().includes(bookedbySearchTermLC) :
                instrument.bookedBy.toLowerCase().includes(bookedbySearchTermLC)) :
              false;

            return (
              matchesDescription ||
              matchesEquipment ||
              matchesModel ||
              matchesLocation ||
              matchesProject ||
              matchesBookedby
            );
          })
          //.filter((instrument) => instrument.bookedBy && instrument.bookedBy._id === user.id) //<=== id undefined
          .filter((instrument) => instrument.bookedBy)
          .map((instrument) => renderInstrumentDetails(instrument))}
      </div>
    );
  };

  const BookedByAllUsersView = ({ searchTerm, equipmentSearchTerm, modelSearchTerm, locationSearchTerm, projectSearchTerm, bookedbySearchTerm, handleViewAllInstruments, filteredInstruments }) => {
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
            //const matchesDescription = instrument.description.toLowerCase().includes(searchTermLC);
            const matchesDescription = instrument.type.toLowerCase().includes(searchTermLC);
            const equipmentSearchTermLC = equipmentSearchTerm.toLowerCase();
            const matchesEquipment = instrument.equipment.toLowerCase().includes(equipmentSearchTermLC);
            const modelSearchTermLC = modelSearchTerm.toLowerCase();
            const locationSearchTermLC = locationSearchTerm.toLowerCase();
            const projectSearchTermLC = projectSearchTerm.toLowerCase();
            const bookedbySearchTermLC = bookedbySearchTerm ? bookedbySearchTerm.toLowerCase() : "";
            const matchesModel = instrument.model.toLowerCase().includes(modelSearchTermLC);
            //const matchesLocation = instrument.location.toLowerCase().includes(locationSearchTermLC);
            const matchesLocation = instrument.location && instrument.location.toLowerCase().includes(locationSearchTermLC);
            const matchesProject = instrument.project ? instrument.project.toLowerCase().includes(projectSearchTermLC) : false;
            const matchesBookedby = instrument.bookedBy ?
              (typeof instrument.bookedBy === "object" ?
                instrument.bookedBy.username.toLowerCase().includes(bookedbySearchTermLC) :
                instrument.bookedBy.toLowerCase().includes(bookedbySearchTermLC)) :
              false;
            return (
              matchesDescription ||
              matchesEquipment ||
              matchesModel ||
              matchesLocation ||
              matchesProject ||
              matchesBookedby
            );
          })
          .filter((instrument) => instrument.bookedBy)
          .map((instrument) => renderInstrumentDetails(instrument))}
      </div>
    );
  };

  const PendingApprovalView = ({ searchTerm, equipmentSearchTerm, modelSearchTerm, locationSearchTerm, projectSearchTerm, bookedbySearchTerm, handleViewAllInstruments, filteredInstruments }) => {
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
            //const matchesDescription = instrument.description.toLowerCase().includes(searchTermLC);
            const matchesDescription = instrument.type.toLowerCase().includes(searchTermLC);
            const equipmentSearchTermLC = equipmentSearchTerm.toLowerCase();
            const matchesEquipment = instrument.equipment.toLowerCase().includes(equipmentSearchTermLC);
            const modelSearchTermLC = modelSearchTerm.toLowerCase();
            const locationSearchTermLC = locationSearchTerm.toLowerCase();
            const projectSearchTermLC = projectSearchTerm.toLowerCase();
            const bookedbySearchTermLC = bookedbySearchTerm ? bookedbySearchTerm.toLowerCase() : "";
            const matchesModel = instrument.model.toLowerCase().includes(modelSearchTermLC);
            //const matchesLocation = instrument.location.toLowerCase().includes(locationSearchTermLC);
            const matchesLocation = instrument.location && instrument.location.toLowerCase().includes(locationSearchTermLC);
            const matchesProject = instrument.project ? instrument.project.toLowerCase().includes(projectSearchTermLC) : false;
            const matchesBookedby = instrument.bookedBy ?
              (typeof instrument.bookedBy === "object" ?
                instrument.bookedBy.username.toLowerCase().includes(bookedbySearchTermLC) :
                instrument.bookedBy.toLowerCase().includes(bookedbySearchTermLC)) :
              false;
            return (
              matchesDescription ||
              matchesEquipment ||
              matchesModel ||
              matchesLocation ||
              matchesProject ||
              matchesBookedby
            );
          })
          .filter((instrument) => instrument.bookedBy)
          .map((instrument) => renderInstrumentDetails(instrument))}
      </div>
    );
  };

  const ReleaseApprovalView = ({ searchTerm, equipmentSearchTerm, modelSearchTerm, locationSearchTerm, projectSearchTerm, bookedbySearchTerm, handleViewAllInstruments, filteredInstruments }) => {
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
            //const matchesDescription = instrument.description.toLowerCase().includes(searchTermLC);
            const matchesDescription = instrument.type.toLowerCase().includes(searchTermLC);
            const equipmentSearchTermLC = equipmentSearchTerm.toLowerCase();
            const matchesEquipment = instrument.equipment.toLowerCase().includes(equipmentSearchTermLC);
            const modelSearchTermLC = modelSearchTerm.toLowerCase();
            const locationSearchTermLC = locationSearchTerm.toLowerCase();
            const projectSearchTermLC = projectSearchTerm.toLowerCase();
            const bookedbySearchTermLC = bookedbySearchTerm ? bookedbySearchTerm.toLowerCase() : "";
            const matchesModel = instrument.model.toLowerCase().includes(modelSearchTermLC);
            //const matchesLocation = instrument.location.toLowerCase().includes(locationSearchTermLC);
            const matchesLocation = instrument.location && instrument.location.toLowerCase().includes(locationSearchTermLC);
            const matchesProject = instrument.project ? instrument.project.toLowerCase().includes(projectSearchTermLC) : false;
            const matchesBookedby = instrument.bookedBy ?
              (typeof instrument.bookedBy === "object" ?
                instrument.bookedBy.username.toLowerCase().includes(bookedbySearchTermLC) :
                instrument.bookedBy.toLowerCase().includes(bookedbySearchTermLC)) :
              false;
            return (
              matchesDescription ||
              matchesEquipment ||
              matchesModel ||
              matchesLocation ||
              matchesProject ||
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
      {!isModalOpen && !isLocationModalOpen && (
        <>
          <h1 style={{ fontWeight: "bold" }}>Instruments List</h1>
          <div style={{ display: 'flex' }}>
            <div className="category-container" style={{ width: '25%' /* additional styling for category list */ }}>
              {renderCategoryButtons()}
            </div>
            <div style={{ width: '95%' /* additional styling for the rest of the content */ }}>
              <div
                className="search-bar"
                style={{
                  position: 'sticky',
                  top: '90px',
                  zIndex: 999,
                  backgroundColor: '#fff',
                  padding: '10px',
                  borderBottom: '10px solid #ccc',
                  fontWeight: "bold",
                  border: "4px solid blue",
                }}
              >
                <input
                  type="text"
                  placeholder="Search by Category..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    fontSize: "1em",
                    marginRight: "10px",
                    color: "green", // Set the text color to green
                  }}
                />
                <input
                  type="text"
                  placeholder="Search by Equipment Description..."
                  value={equipmentSearchTerm}
                  onChange={(e) => setEquipmentSearchTerm(e.target.value)}
                  style={{
                    fontSize: "1em",
                    marginRight: "10px",
                    color: "green",
                  }}
                />
                <input
                  type="text"
                  placeholder="Search by Model..."
                  value={modelSearchTerm}
                  onChange={(e) => setModelSearchTerm(e.target.value)}
                  style={{
                    fontSize: "1em",
                    marginRight: "10px",
                    color: "green",
                  }}
                />
                <input
                  type="text"
                  placeholder="Search by Location..."
                  value={locationSearchTerm}
                  onChange={(e) => setLocationSearchTerm(e.target.value)}
                  style={{
                    fontSize: "1em",
                    marginRight: "10px",
                    color: "green",
                  }}
                />
                <input
                  type="text"
                  placeholder="Search by Project..."
                  value={projectSearchTerm}
                  onChange={(e) => setProjectSearchTerm(e.target.value)}
                  style={{
                    fontSize: "1em",
                    marginRight: "10px",
                    color: "green",
                  }}
                />
                <input
                  type="text"
                  placeholder="Search by User..."
                  value={bookedbySearchTerm}
                  onChange={(e) => setBookedBySearchTerm(e.target.value)}
                  style={{
                    fontSize: "1em",
                    marginRight: "10px",
                    color: "green",
                  }}
                />
              </div>
              {viewMode === "byMe" && (
                <BookedByMeView
                  searchTerm={searchTerm}
                  equipmentSearchTerm={equipmentSearchTerm}
                  modelSearchTerm={modelSearchTerm}
                  locationSearchTerm={locationSearchTerm}
                  projectSearchTerm={projectSearchTerm}
                  handleViewAllInstruments={handleViewAllInstruments}
                  filteredInstruments={filteredInstruments}
                />
              )}
              {viewMode === "byAll" && (
                <BookedByAllUsersView
                  searchTerm={searchTerm}
                  equipmentSearchTerm={equipmentSearchTerm}
                  modelSearchTerm={modelSearchTerm}
                  locationSearchTerm={locationSearchTerm}
                  projectSearchTerm={projectSearchTerm}
                  handleViewAllInstruments={handleViewAllInstruments}
                  filteredInstruments={filteredInstruments}
                />
              )}
              {viewMode === "byPendingApproval" && (
                <PendingApprovalView
                  searchTerm={searchTerm}
                  equipmentSearchTerm={equipmentSearchTerm}
                  modelSearchTerm={modelSearchTerm}
                  locationSearchTerm={locationSearchTerm}
                  projectSearchTerm={projectSearchTerm}
                  handleViewAllInstruments={handleViewAllInstruments}
                  filteredInstruments={filteredInstruments}
                />
              )}

              {viewMode === "byReleaseApproval" && (
                <ReleaseApprovalView
                  searchTerm={searchTerm}
                  equipmentSearchTerm={equipmentSearchTerm}
                  modelSearchTerm={modelSearchTerm}
                  locationSearchTerm={locationSearchTerm}
                  projectSearchTerm={projectSearchTerm}
                  handleViewAllInstruments={handleViewAllInstruments}
                  filteredInstruments={filteredInstruments}
                />
              )}
              {viewMode === "all" && (
                <AllInstrumentsView
                  searchTerm={searchTerm}
                  equipmentSearchTerm={equipmentSearchTerm}
                  modelSearchTerm={modelSearchTerm}
                  locationSearchTerm={locationSearchTerm}
                  projectSearchTerm={projectSearchTerm}
                />
              )}
            </div>
          </div>
        </>
      )}
      {promptLoginForViewing && (
        <div className="login-prompt">
          You must be logged in to view booked instruments.
        </div>
      )}
      <BookingModal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        onSubmitBooking={handleBookingSubmit}
        setIsModalOpen={setIsModalOpen}
        instrumentInfo={instrumentInfo} // Pass instrumentInfo to BookingModal
      />
      <LocationModal
        isOpen={isLocationModalOpen}
        onRequestClose={handleModalClose}
        onSubmitLocation={handleLocationSubmit}
        currentInstrumentId={currentInstrumentId}
        instrumentInfo={instrumentInfo} // Pass instrumentInfo to LocationModal
      />
    </div>
  );


};

export default InstrumentList;