import React, { useState, useEffect } from "react";
import Modal from "react-modal";
import "./LocationModal.css"; // Import the CSS file

const LocationModal = ({ isOpen, onRequestClose, onSubmitLocation, currentInstrumentId, instrumentInfo }) => {
  const [location, setLocation] = useState('');
  const [project, setProject] = useState('');
  const [locationRoom, setLocationRoom] = useState('MAG.BETE'); // Default to the first option
  const [showErrorMessage, setShowErrorMessage] = useState(false);

  const roomOptions = [
    "MAG.BETE", "LAB Ex Volpati", "LOCALE BOCCIONI", "LAB ALASKA",
    "LAB RADIO -1", "LAB CLT", "LAB PVV", "LAB SW", "LAB XHAUL"
  ];

  const handleLocationSubmit = () => {
    if (location.trim() === '') {
      setShowErrorMessage(true);
    } else {
      console.log(`LocationModal: Submitting location for instrument ID: ${currentInstrumentId}`);
      onSubmitLocation({ location, locationRoom, project });
      onRequestClose();
      setShowErrorMessage(false);
    }
  };

  const handleInputChange = (e) => {
    setLocation(e.target.value);
    if (showErrorMessage) {
      setShowErrorMessage(false);
    }
  };

  const handleInputProject = (e) => {
    setProject(e.target.value);
    if (showErrorMessage) {
      setShowErrorMessage(false);
    }
  };

  useEffect(() => {
    if (instrumentInfo) {
      setLocationRoom(instrumentInfo.room); // Set location room from instrumentInfo
    }
  }, [instrumentInfo]);

  return (
    <Modal isOpen={isOpen} onRequestClose={onRequestClose} className="modal-content">
      <div style={{ border: "2px solid #014C8C", padding: "10px", borderRadius: "20px", display: "flex", flexDirection: "column", marginTop: "1px" }}>
        <div className="instrument-frame">
          {instrumentInfo ? (
            <>
              <h2 className="modal-header" style={{ fontWeight: 'bold', color: 'green', marginBottom: "10px", paddingTop: "10px", marginTop: "45px"}}>
              You are performing an action on the Instrument:
              </h2>
              {showErrorMessage && (
                <div className="error-message">You must specify the instrument location</div>
              )}
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
      </div>
      <br />
      <div className="modal-body">
        <label className="modal-label" style={{ fontWeight: 'bold' }}>
          Room:
          <select
            value={locationRoom}
            onChange={(e) => setLocationRoom(e.target.value)}
            className="dropdown"
          >
            {roomOptions.map((room, index) => (
              <option key={index} value={room}>{room}</option>
            ))}
          </select>
        </label>
        <br />
        <label className="modal-label" style={{ fontWeight: 'bold' }}>
          Location Details:
          <input
            type="text"
            placeholder="Insert the location inside the room here..."
            value={location}
            onChange={handleInputChange}
            className="location-input"
          />
        </label>
        <br />
        <label className="modal-label" style={{ fontWeight: 'bold' }}>
          Project:
          <input
            type="text"
            name="Insert the project here..."
            value={project}
            onChange={handleInputProject}
            className="location-input"
          />
        </label>
      </div>
      <div className="modal-footer">
        <button onClick={handleLocationSubmit} className="button">Submit</button>
        <button onClick={onRequestClose} className="button button-cancel">Cancel</button>
      </div>
    </Modal>
  );
  
};

export default LocationModal;
