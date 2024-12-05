import { useState, useEffect } from 'react';
import './App.css';
import 'primereact/resources/themes/saga-blue/theme.css'; // Theme
import 'primereact/resources/primereact.min.css'; // Core CSS
import 'primeicons/primeicons.css'; // Icons
import 'primeflex/primeflex.css'; // Optional CSS utility classes
import DefaultLayout from './Components/DefaultLayout';
import axiosClient from './axiosClient';
import { useNavigate } from 'react-router-dom';

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
    const token = localStorage.getItem('token'); // Get the token from local storage

    if (token) {
      const decodedToken = parseJwt(token);
      setUserId(decodedToken.userId); // Assuming userId is a field in the token
      setUser(decodedToken.user); // Assuming user is a field in the token
    }
  }, []); // Run once on mount

  useEffect(() => {
    // Auto-fetch user data when token changes
    if (token) {
      fetchUser();
    }
  }, [token]); // Trigger when token changes

  const fetchUser = async () => {
    try {
      const response = await axiosClient.get('/userToken', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data && response.data.token) {
        const newToken = response.data.token;
        console.log("response", newToken);
        // Set the token in local storage and state
        localStorage.setItem('token', newToken);
        setToken(newToken);

        // Optionally, set user data here
        if (response.data.user) {
          setUser(response.data.user); // Assuming user data is also returned
        }
      }
    } catch (error) {
      console.error('Failed to fetch user:', error);
      // Optionally clear token on error
      localStorage.removeItem('token');
      setToken(null);
      setUser(null); // Clear user data on error
    }
  };
// Add a response interceptor
axiosClient.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      // Token expired or unauthorized access
      handleLogout();
    }
    return Promise.reject(error);
  }
);

const handleLogout = () => {
  // Clear any stored tokens and other user data
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  // Redirect to login page
  window.location.href = '/login';
};
  return (
    <div className="App">
      <DefaultLayout userData={user} />
      {/* Other UI components */}
    </div>
  );
}

export default App;
