// WelcomePage.js
import './WelcomePage.css';
import React from 'react';
import { Link } from 'react-router-dom';  // if you're using react-router

const WelcomePage = () => {
    return (
        <div className="welcome-container">
            <h1>Welcome to Instrument Booking System</h1>
            <div className="auth-buttons">
                <Link to="/login" className="login-button">Login</Link>
                <p>Don't have an account?</p>
                <Link to="/register" className="register-button">Register</Link>
            </div>
        </div>
    );
};

export default WelcomePage;
