// Register.js file with our actual registration API endpoint.
import React, { useState, useContext } from 'react';
// import { useHistory } from 'react-router-dom';
import { useNavigate, Link } from 'react-router-dom';  // Added the Link import
import UserContext from '../context/UserContext';
import axios from 'axios';

const BASE_URL = process.env.REACT_APP_BACKEND_URL;

const Register = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const { setUser } = useContext(UserContext);
  // const history = useHistory();
  const navigate  = useNavigate();   // <- Importing useNavigate instead of useHistory

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      // Make an API call to register
      const response = await axios.post(`${BASE_URL}/api/users/register`, {  // /api/users/register
        username,
        password,
        email,
      });

    if (response.status === 201) {
        setSuccessMessage('Registration successful! You can now log in.');
        setUsername('');
        setPassword('');
    }

    // Update the context with the user data
    setUser(response.data.username);
    
    // Redirect to instruments page after successful registration
    navigate('/instruments'); // Modified this line
    } catch (error) {
      if (error.response && error.response.data.message) {
        setErrorMessage(error.response.data.message);
      } else {
        setErrorMessage('An unexpected error occurred during registration. Please try again later.');
      }    
    }
  };

  return (
    <div>
      <h2>Register</h2>
      <form onSubmit={handleRegister}>
        <div>
          <label htmlFor="username">Username</label>
          <input type="text" id="username" value={username} onChange={(e) => setUsername(e.target.value)} />
        </div>
        <div>
          <label htmlFor="email">Email</label>
          <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div>
          <label htmlFor="password">Password</label>
          <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <button type="submit">Register</button>
      </form>
      {errorMessage && <p style={{ color: 'red', fontWeight: 'bold' }}>{errorMessage}</p>}
      {successMessage && <p style={{ color: 'green', fontWeight: 'bold' }}>{successMessage}</p>}
      <div>
        Already have an account? <Link to="/login">Login here</Link>  {/* Added this link section */}
      </div>
    </div>
  );
};

export default Register;





