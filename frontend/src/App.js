import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Login from './components/Login';
import Register from './components/Register';
import InstrumentList from './components/InstrumentList';
import InstrumentBooking from './components/InstrumentBooking';
import WelcomePage from './components/WelcomePage';
import axios from 'axios';
import './App.css';
import { LogoutProvider } from './context/LogoutContext';
import { UserProvider, useUserContext } from './context/UserContext';

const App = () => {
  const { user, setUser } = useUserContext(); // Use custom hook, now `user` is defined
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
      <UserProvider value={{ user, setUser }}>
        <LogoutProvider>
          <ConditionalHeader />
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
        </LogoutProvider>
      </UserProvider>
    </Router>
  );
}

function ConditionalHeader() {
  // Using useLocation hook to get the current path
  const location = useLocation();

  // Do not render Header on the WelcomePage
  if (location.pathname === '/') {
    return null;
  }

  // Render Header on all other pages
  return <Header />;
}

export default App;