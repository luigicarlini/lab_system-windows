import React, { useState, useEffect, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Login from './components/Login';
import Register from './components/Register';
import InstrumentList from './components/InstrumentList';
import InstrumentBooking from './components/InstrumentBooking';
import WelcomePage from './components/WelcomePage';
import axios from 'axios';
import './App.css';
import UserContext from './context/UserContext';

const App = () => {
  const { setUser } = useContext(UserContext); 
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const BASE_URL = process.env.REACT_APP_BACKEND_URL;
        const response = await axios.get(`${BASE_URL}/users/current`);

        if (response.data && response.data.user) {
          setUser(response.data.user);  // Here we update the context
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [setUser]);  // Added setUser as a dependency since we are using it inside the useEffect

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
          <Route path="/" element={<WelcomePage />} />
        </Routes>
      </div>
      <Footer />
    </Router>
  );
}

export default App;
