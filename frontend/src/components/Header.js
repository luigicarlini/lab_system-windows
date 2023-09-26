// This is a hypothetical Header component that contains a navigation bar and displays the logged-in user's name if available.
import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
// import { Link } from 'react-router-dom';
import UserContext from '../context/UserContext';

function Header() {
  const { user } = useContext(UserContext);

  return (
    <header>
      <nav className="navbar navbar-expand-lg navbar-light bg-light">
        <NavLink className="navbar-brand" to="/" end>
          Instrument Booking
        </NavLink>
        <div className="collapse navbar-collapse">
          <ul className="navbar-nav mr-auto">
            <li className="nav-item">
              <NavLink className="nav-link" to="/" end>
                Home
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/instruments">
                Instruments
              </NavLink>
            </li>
            { !user && (
              <>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/login">
                    Login
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/register">
                    Register
                  </NavLink>
                </li>
              </>
            )}
          </ul>
          <span className="navbar-text">
            {user ? `Welcome, ${user.name}` : <NavLink to="/login">Login</NavLink>}
          </span>
        </div>
      </nav>
    </header>
  );
}

export default Header;
