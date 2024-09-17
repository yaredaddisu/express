import { useState } from 'react';
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
import './App.css';
import useSessionTimeout from './context/useSessionTimeout';
import 'primereact/resources/themes/saga-blue/theme.css'; // Theme
import 'primereact/resources/primereact.min.css'; // Core CSS
import 'primeicons/primeicons.css'; // Icons
import 'primeflex/primeflex.css'; // Optional CSS utility classes

import { useNavigate } from 'react-router-dom'; // Import useNavigate

function App() {
  const navigate = useNavigate(); // Initialize useNavigate

  const logout = () => {
    // Remove the user token
    localStorage.removeItem('token'); // or sessionStorage.removeItem('userToken');
    // Redirect to the login page
    navigate('/login'); // use navigate instead of history.push
  };

  // Use the session timeout hook in your main App component
  useSessionTimeout(300000, logout); // Set timeout for 5 minutes

  return (
    <>
      <div className="App">
       
      
       
      
      </div>
    </>
  );
}

export default App;
