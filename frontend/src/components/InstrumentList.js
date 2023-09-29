import React, { useEffect, useState } from 'react';
import { getAllInstruments, bookInstrument, getInstrumentStatus } from '../api/api';
import { useUserContext } from '../context/UserContext';

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
                <div key={instrument._id} style={{ marginBottom: '10px' }}>
                    <span>{instrument.instrumentName}</span>
                    <span> - Status: {instrumentStatuses[instrument._id] || "Unknown"}</span>
                    <button 
                        disabled={instrumentStatuses[instrument._id] === 'Booked'}
                        onClick={() => handleBookInstrument(instrument._id)}
                        style={{ margin: '0 10px 0 5px' }}
                    >
                        Book
                    </button>
                </div>
            ))}
        </div>
    );
};

export default InstrumentList;