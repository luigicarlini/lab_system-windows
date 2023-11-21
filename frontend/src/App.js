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
      const token = localStorage.getItem('token');
      console.log("App.js: token:", token);
      if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        try {
          const BASE_URL = process.env.REACT_APP_BACKEND_URL;
          console.log("App.js: sending request to:", `${BASE_URL}/api/users/current`);
          const response = await axios.get(`${BASE_URL}/api/users/current`);
          console.log("App.js: response from server:", response);
          
          if (response.data) {
            console.log("App.js: user data:", response.data);

            setUser(response.data); // Set the user in the context
          } else {
            console.log("App.js: no user data in response");
          }
        } catch (error) {
          console.error("App.js: error fetching user:", error);
          if (error.response) {
            console.error("App.js: error response status:", error.response.status);
            console.error("App.js: error response data:", error.response.data);
          }
          // If token is invalid, clear it from local storage
          if (error.response && error.response.status === 401) {
            localStorage.removeItem('token');
          }
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };
  
    fetchUser();
  }, [setUser]); // Make sure to include setUser as a dependency

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