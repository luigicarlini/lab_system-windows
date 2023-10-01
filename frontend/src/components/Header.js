// This is a hypothetical Header component that contains a navigation bar and displays the logged-in user's name if available.
import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import UserContext from '../context/UserContext';
import './Header.css';  // Import the newly created CSS

function Header() {
  const { user } = useContext(UserContext);

  return (
    <header className="githubHeader">
      <nav className="navbar githubNav">
        <NavLink className="navbar-brand githubBrand" to="/" end>
          Instrument Booking
        </NavLink>
        <div className="collapse navbar-collapse">
          <ul className="navbar-nav mr-auto">
            { !user && (
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
            )}
          </ul>
          <span className="navbar-text githubNavText">
            {user ? `Welcome, ${user.username}` : ' '} 
          </span>
        </div>
      </nav>
    </header>
  );
}

export default Header;
