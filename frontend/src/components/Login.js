// To simulate a user login, you might have a login function in a different component 
// that calls setCurrentUser to populate the currentUser:
import React, { useState, useContext } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom'; // Added the Link import
// import { UserContext } from '../context/UserContext';
import UserContext from '../context/UserContext';


const BASE_URL = process.env.REACT_APP_BACKEND_URL;

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState(null);
  const { setUser } = useContext(UserContext);

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      // Real API call to validate user login
      const response = await axios.post(`${BASE_URL}/api/users/login`, {
        username: username,
        password: password,
      });

      if (response.status === 200 && response.data.token) {
        const user = {
          id: response.data.id,
          username: response.data.username,
          token: response.data.token,
        };

        setUser(user);
        // Typically, you would also set the token in a secure way, such as an HttpOnly cookie or secure local storage.
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
      {errorMessage && <p>{errorMessage}</p>}
      <div>
        Don't have an account? <Link to="/register">Register here</Link>
      </div>
    </div>
  );
};

export default Login;