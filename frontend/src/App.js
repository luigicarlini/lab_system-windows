import React, { useState, useEffect } from 'react';
// import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// import UserContext from './context/UserContext';
import Header from './components/Header'; // hypothetical Header component
import Footer from './components/Footer'; // hypothetical Footer component
import Login from './components/Login';
import Register from './components/Register';
import InstrumentList from './components/InstrumentList';
import InstrumentBooking from './components/InstrumentBooking';
import axios from 'axios';
import './App.css';

const App = () => {
// const [user, setUser] = useState(null);
// eslint-disable-next-line no-unused-vars
  const [_, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const BASE_URL = process.env.REACT_APP_BACKEND_URL;
        const response = await axios.get(`${BASE_URL}/users/current`);

        if (response.data && response.data.user) {
          setUser(response.data.user);
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <Header />
      <div className="container">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/instruments/:instrumentId" element={<InstrumentBooking />} />
          <Route path="/instruments" element={<InstrumentList />} />
          <Route path="/" element={<InstrumentList />} />
        </Routes>
      </div>
      <Footer />
    </Router>
  );
}

export default App;
