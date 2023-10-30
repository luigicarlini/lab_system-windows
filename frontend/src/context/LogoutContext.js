import React, { createContext, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';  // Ensure axios is imported if it's being used
import UserContext from './UserContext';
import jwtDecode from 'jwt-decode';


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

  const isTokenExpired = (token) => {
    try {
      const decodedToken = jwtDecode(token);
      return decodedToken.exp < Date.now() / 1000; // Convert current time to seconds
    } catch {
      return true; // If there's an error decoding, treat as expired
    }
};
  
  const handleLogout = async() => {
    const token = localStorage.getItem('token');
    if (isTokenExpired(token)) {
      setErrorMessage("Your session has expired. Please log in again.");
      setUser(null);  // Clear the user context
      localStorage.removeItem('token');  // Clear the token from localStorage
      setTimeout(() => {
        setErrorMessage(null); // Clear the error message
        navigate('/');  // Redirecting using navigate
      }, 2000);
      return;  // Return early from the function
  }
    try {
      //const token = localStorage.getItem('token');  // get token from localStorage
      console.log("Token to be sent:", token);
      const response = await axios.post(`${BASE_URL}/api/users/logout`, null, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.status === 200) {
        setSuccessMessage('Logout successful!');
        setUser(null); // <-- 'setUser' function or 'user' state is not defined here
        // localStorage.removeItem('token');  // Now clear the token from localStorage
        setTimeout(() => {
          setSuccessMessage(null); // Clear the success message
          navigate('/');  // Redirecting using navigate
        }, 1000);
      }
    } catch (error) {
      if (error.response && error.response.data.message) {
        setErrorMessage(error.response.data.message);
      } else {
        setErrorMessage('An error occurred during logout. Please try again.');
        setTimeout(() => {
          setErrorMessage(null); // Clear the error message
        }, 1000);
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
