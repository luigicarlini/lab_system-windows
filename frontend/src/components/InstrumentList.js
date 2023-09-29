import React, { useEffect, useState } from 'react';
import { getAllInstruments, bookInstrument, getInstrumentStatus } from '../api/api';
import { useUserContext } from '../context/UserContext';
import './InstrumentList.css'; // Import the styles

const InstrumentList = () => {
    const [instruments, setInstruments] = useState([]);
    const [instrumentStatuses, setInstrumentStatuses] = useState({});
    const { user } = useUserContext();  // <-- Corrected destructuring

    useEffect(() => {
        const fetchData = async () => {
            const allInstruments = await getAllInstruments();
            setInstruments(allInstruments);
             // Fetch statuses for each instrument
             const statuses = await Promise.all(
                allInstruments.map(instrument => getInstrumentStatus(instrument._id))
            );

            // Map the statuses to their corresponding instrument ID
            const statusMap = {};
            allInstruments.forEach((instrument, index) => {
                statusMap[instrument._id] = statuses[index].availability ? "Available" : "Booked";
            });

            // Set the instrumentStatuses state with the fetched statuses
            setInstrumentStatuses(statusMap);
        };
        fetchData();
    }, []);

    const handleBookInstrument = async (id) => {
        if (user) {
            const bookedInstrument = await bookInstrument(id, user._id);
            // Assuming the API returns a new status for the instrument after booking
            setInstrumentStatuses(prevStatuses => ({ ...prevStatuses, [id]: bookedInstrument.availability ? "Available" : "Booked" }));
        } else {
            console.log("You must be logged in to book an instrument.");
        }
    };

    // Future Use if we want to add a button to check the Status
    // const handleGetStatus = async (id) => {
    //     const status = await getInstrumentStatus(id);
    //     setInstrumentStatuses(prevStatuses => ({ ...prevStatuses, [id]: status.availability ? "Available" : "Booked" }));
    //     // setInstrumentStatuses(prevStatuses => ({ ...prevStatuses, [id]: status }));
    // };

    return (
        <div>
            {instruments.map((instrument) => (
                <div key={instrument._id} style={{ marginBottom: '10px', border: '1px solid #014C8C', padding: '15px', borderRadius: '5px' }}>
                    <div style={{ fontWeight: 'bold', fontSize: '1.1em', color: '#014C8C' }}>{instrument.instrumentName}</div>
                    <div><span style={{ fontWeight: 'bold' }}>Status:</span> {instrumentStatuses[instrument._id] || "Unknown"}</div>
                    <div><span style={{ fontWeight: 'bold' }}>Manufacturer:</span> {instrument.manufacturer}</div>
                    <div><span style={{ fontWeight: 'bold' }}>Model:</span> {instrument.model}</div>
                    <div><span style={{ fontWeight: 'bold' }}>Frequency Range:</span> {instrument.frequencyRange}</div>
                    <div><span style={{ fontWeight: 'bold' }}>Description:</span> {instrument.description}</div>
                    <div><span style={{ fontWeight: 'bold' }}>Booked by:</span> {instrument.bookedBy || "N/A"}</div>
                    <div><span style={{ fontWeight: 'bold' }}>Booked from:</span> {instrument.bookedFrom || "N/A"}</div>
                    <div><span style={{ fontWeight: 'bold' }}>Booked until:</span> {instrument.bookedUntil || "N/A"}</div>
                    <button 
                        disabled={instrumentStatuses[instrument._id] === 'Booked'}
                        onClick={() => handleBookInstrument(instrument._id)}
                        style={{ marginTop: '10px', backgroundColor: '#28a745', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}
                    >
                        Book
                    </button>
                </div>
            ))}
        </div>
    );
};

export default InstrumentList;



