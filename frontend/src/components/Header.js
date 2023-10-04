// This is a hypothetical Header component that contains a navigation bar and displays the logged-in user's name if available.
import React, { useContext, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import UserContext from '../context/UserContext';
import { useLogoutContext } from '../context/LogoutContext'; // Import LogoutContext
import './Header.css';  // Import the newly created CSS



function Header() {
  const { user } = useContext(UserContext);
  const { handleLogout, errorMessage, successMessage, clearMessages} = useLogoutContext(); 

  // Effect to clear success message after a timeout
  useEffect(() => {
    if (successMessage) {
      const timerId = setTimeout(() => {
        clearMessages();  // Clearing messages after 3 seconds
      }, 1000);  // 1 seconds
      // Cleanup function to clear timeout if the component unmounts
      return () => clearTimeout(timerId);
    }}, [successMessage, clearMessages]);

    return (
      <header className="githubHeader">
        <nav className="navbar githubNav">
          <NavLink className="navbar-brand githubBrand" to="/" end>
            Instrument Booking
          </NavLink>
          <div className="collapse navbar-collapse">
            <ul className="navbar-nav mr-auto">
              {!user ? (
                <>
                  <li className="nav-item">
                    <NavLink className="nav-link githubNavLink" to="/login">
                      Login
                    </NavLink>
                  </li>
                  <li className="nav-item">
                    <NavLink className="nav-link githubNavLink" to="/register">
                      Register
                    </NavLink>
                  </li>
                </>
              ) : null}
            </ul>
            <span className="navbar-text githubNavText">
              {user ? `Welcome, ${user.username}` : ' '}
            </span>
            {user && (
              <button
                className="nav-link githubNavLink logoutButton"
                onClick={handleLogout}
                style={{ color: 'red' }}
              >
                Logout
              </button>
            )}
            {/* Displaying messages if available */}
            {errorMessage && (
              <p style={{ color: 'red', fontWeight: 'bold', marginRight: '10px' }}>
                {errorMessage}
              </p>
            )}
            {successMessage && (
              <p style={{ color: 'green', fontWeight: 'bold', marginRight: '10px' }}>
                {successMessage}
              </p>
            )}
          </div>
        </nav>
      </header>
    );
  }
  
  export default Header;