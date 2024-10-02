// LocationComponent.jsx
import React, { useState } from 'react';
import LocationMap from './LocationMap';
import axios from 'axios';

const LocationComponent = () => {
  const [location, setLocation] = useState({ latitude: null, longitude: null });
  const [error, setError] = useState(null);

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ latitude, longitude });
          sendLocationToBackend(latitude, longitude);
        },
        (err) => {
          setError(err.message);
        }
      );
    } else {
      setError('Geolocation is not supported by this browser.');
    }
  };

  const sendLocationToBackend = async (latitude, longitude) => {
    try {
      await axios.post('/api/location', {
        latitude,
        longitude,
      });
      console.log('Location sent to backend');
    } catch (error) {
      console.error('Error sending location to backend:', error);
    }
  };

  return (
    <div>
      <h1>Get User Location</h1>
      <button onClick={getLocation}>Get My Location</button>
      {location.latitude && location.longitude && (
        <LocationMap latitude={location.latitude} longitude={location.longitude} />
      )}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default LocationComponent;
