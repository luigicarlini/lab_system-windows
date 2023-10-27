import React, { createContext, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';  // Ensure axios is imported if it's being used
import UserContext from './UserContext';


const BASE_URL = process.env.REACT_APP_BACKEND_URL;

const LogoutContext = createContext();

export const useLogoutContext = () => {
  return useContext(LogoutContext);
}

export const LogoutProvider = ({ children }) => {
  const navigate = useNavigate();  // Using useNavigate here
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const { setUser } = useContext(UserContext);  // Using setUser from UserContext
  
  const handleLogout = async() => {
    try {
      const token = localStorage.getItem('token');  // get token from localStorage
      console.log("Token to be sent:", token);
      const response = await axios.post(`${BASE_URL}/api/users/logout`, null, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.status === 200) {
        setSuccessMessage('Logout successful!');
        setUser(null); // <-- 'setUser' function or 'user' state is not defined here
        localStorage.removeItem('token');  // <-- Clear the token from localStorage
        setTimeout(() => {
          navigate('/');  // Redirecting using navigate
        }, 1000);
      }
    } catch (error) {
      if (error.response && error.response.data.message) {
        setErrorMessage(error.response.data.message);
      } else {
        setErrorMessage('An error occurred during logout. Please try again.');
      }
    }
  };

  const clearMessages = () => {
    setErrorMessage(null);
    setSuccessMessage(null);
  };
  
  const contextValue = {
    handleLogout,
    errorMessage,
    successMessage,
    clearMessages,
    // ... you might want to include other auth functions and states here.
  };

  return (
    <LogoutContext.Provider value={contextValue}>
      {children}
    </LogoutContext.Provider>
  );
}
