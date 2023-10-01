// To simulate a user login, you might have a login function in a different component 
// that calls setCurrentUser to populate the currentUser:
import React, { useState, useContext } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';  // Added useNavigate import here
import UserContext from '../context/UserContext';


const BASE_URL = process.env.REACT_APP_BACKEND_URL;

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const { setUser } = useContext(UserContext);
  const navigate = useNavigate();  // Initialize navigate

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      // Real API call to validate user login
      //C:\lab-booking-system-master\lab-booking-system-master\backend\routes
      const response = await axios.post(`${BASE_URL}/api/users/login`, {  
        username: username,
        password: password,
      });

      console.log('Attempting to login with:', { username, password });
      console.log(response.data.payload);
      console.log(response.data.payload.username);
      console.log(response.data.payload.id);
      console.log(response.data.token);

      if (response.status === 200 && response.data.token) {  
        setSuccessMessage('Log in successful!');
        const user = {   
          id: response.data.payload.id,
          username: response.data.payload.username,
          token: response.data.token,
        };
        setUser(user);             // Typically, you would also set the token in a secure way, such as an HttpOnly cookie or secure local storage.
        navigate('/instruments');  // Redirect user to instruments after successful login
      }
    } catch (error) {
      if (error.response && error.response.data.message) {
        setErrorMessage(error.response.data.message);
      } else {
        setErrorMessage('An error occurred. Please try again.');
      }
    }
  };

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <div>
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button type="submit">Login</button>
      </form>
      {errorMessage && <p style={{ color: 'red', fontWeight: 'bold' }}>{errorMessage}</p>}
      {successMessage && <p style={{ color: 'green', fontWeight: 'bold' }}>{successMessage}</p>}
      <div>
        Don't have an account? <Link to="/register">Register here</Link>
      </div>
    </div>
  );
};

export default Login;