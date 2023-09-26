// wrap your root component with UserProvider in src/index.js:
import React from 'react';
import ReactDOM from 'react-dom';
// import './index.css';
import App from './App';
import { UserProvider } from './context/UserContext';  // Import UserProvider

ReactDOM.render(
  <React.StrictMode>
    <UserProvider>  {/* Wrap the App component with UserProvider */}
      <App />
    </UserProvider>
  </React.StrictMode>,
  document.getElementById('root')
);
