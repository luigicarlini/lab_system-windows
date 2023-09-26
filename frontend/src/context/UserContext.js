// src/context/UserContext.js:
// You can use React's Context API to share user information across different components in your app. In this example, 
// we  created a UserContext to hold the logged-in user's data. This context will be provided at a higher-level component, 
// so any child component can consume it.
import React, { createContext, useState, useContext } from 'react';

const UserContext = createContext();

const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

// Custom hook to use the UserContext, this is a shortcut so you don't have to import useContext and UserContext separately in every file
const useUserContext = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUserContext must be used within a UserProvider');
  }
  return context;
};

export default UserContext;
export { UserProvider, useUserContext };
