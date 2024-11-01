import { useState , useEffect} from 'react';
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
import './App.css';
import useSessionTimeout from './context/useSessionTimeout';
import 'primereact/resources/themes/saga-blue/theme.css'; // Theme
import 'primereact/resources/primereact.min.css'; // Core CSS
import 'primeicons/primeicons.css'; // Icons
import 'primeflex/primeflex.css'; // Optional CSS utility classes

import { Outlet, useNavigate } from 'react-router-dom'; // Import useNavigate
import DefaultLayout from './Components/DefaultLayout';
import axiosClient from './axiosClient';
import { FiBell } from 'react-icons/fi';

const parseJwt = (token) => {
  try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/'); // Fix URL encoding
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));

      return JSON.parse(jsonPayload);
  } catch (error) {
      console.error('Failed to decode JWT:', error);
      return null;
  }
};
function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [userId, setUserId] = useState(null);
 
  useEffect(() => {
    const token = localStorage.getItem('token'); // Assuming you stored your JWT in local storage

    if (token) {
        const decodedToken = parseJwt(token);
        setUserId(decodedToken.userId); // Assuming userId is a field in the token
        setUser(decodedToken.user); // Assuming userId is a field in the token

    }

    

}, [userId]); // Re-fetch tasks when userId changes

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axiosClient.get('/userToken', {
          headers: { Authorization: `Bearer ${token}` },
        });
      
        if (response.data && response.data.token) {
          const newToken = response.data.token;
          console.log("response", newToken)
          // Set the token in local storage and state
          localStorage.setItem('token', newToken);
          setToken(newToken);

          // Set the user data
         
        }
      } catch (error) {
        console.error('Failed to fetch user:', error);
        // Optionally clear token on error
        localStorage.removeItem('token');
        setToken(null);
      }
    };

    // Only fetch user if there’s no token already
    if (!token || token || token === undefined) {
      fetchUser();
    }
  }, [token]);


  return (
    <div className="App">
        <DefaultLayout userData={user}/>
       
    
      
    </div>
  );
}

export default App;
