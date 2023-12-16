import React, { useState } from "react";
import Modal from "react-modal";
import "./LocationModal.css"; // Import the CSS file

const LocationModal = ({ isOpen, onRequestClose, onSubmitLocation, currentInstrumentId }) => {
  const [location, setLocation] = useState('');
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
      onSubmitLocation({ location, locationRoom });
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

  return (
    <Modal isOpen={isOpen} onRequestClose={onRequestClose} className="modal-content">
      <h2 className="modal-header" style={{ fontWeight: 'bold' }}>Specify Instrument Location</h2>
      {showErrorMessage && (
        <div className="error-message">You must specify the instrument location</div>
      )}
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
      </div>
      <div className="modal-footer">
        <button onClick={handleLocationSubmit} className="button">Submit</button>
        <button onClick={onRequestClose} className="button button-cancel">Cancel</button>
      </div>
    </Modal>
  );
};

export default LocationModal;