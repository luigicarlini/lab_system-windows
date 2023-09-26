import React, { useEffect, useState } from 'react';
import { getAllInstruments, bookInstrument, getInstrumentStatus } from '../api/api';
import { useUserContext } from '../context/UserContext';  // <-- Note the corrected import

const InstrumentList = () => {
    const [instruments, setInstruments] = useState([]);
    const [instrumentStatuses, setInstrumentStatuses] = useState({});
    const { user } = useUserContext();  // <-- Corrected destructuring

    useEffect(() => {
        const fetchData = async () => {
            const allInstruments = await getAllInstruments();
            setInstruments(allInstruments);
        };
        fetchData();
    }, []);

    const handleBookInstrument = async (id) => {
        if (user) {
            const bookedInstrument = await bookInstrument(id, user._id);
            // Assuming the API returns a new status for the instrument after booking
            setInstrumentStatuses(prevStatuses => ({ ...prevStatuses, [id]: bookedInstrument.status }));
        } else {
            console.log("You must be logged in to book an instrument.");
        }
    };

    const handleGetStatus = async (id) => {
        const status = await getInstrumentStatus(id);
        setInstrumentStatuses(prevStatuses => ({ ...prevStatuses, [id]: status }));
    };

    return (
        <div>
            {instruments.map((instrument) => (
                <div key={instrument._id}>
                    <span>{instrument.name}</span>
                    <span> - Status: {instrumentStatuses[instrument._id] || "Unknown"}</span>
                    <button 
                        disabled={instrumentStatuses[instrument._id] === 'Booked'}
                        onClick={() => handleBookInstrument(instrument._id)}
                    >
                        Book
                    </button>
                    <button onClick={() => handleGetStatus(instrument._id)}>Check Status</button>
                </div>
            ))}
        </div>
    );
};

export default InstrumentList;

