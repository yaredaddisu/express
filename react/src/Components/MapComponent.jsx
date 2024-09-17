import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Set up a custom icon for the marker (optional)
const icon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  shadowSize: [41, 41]
});

const MapComponent = ({ latitude, longitude, firstName, lastName }) => {
  if (!latitude || !longitude) {
    return <div>Location data is not available</div>; // Fallback if no coordinates are provided
  }

  const position = [latitude, longitude];  // Latitude and Longitude from props

  return (
    <MapContainer center={position} zoom={13} style={{ height: '400px', width: '100%' }} className='m-10'>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; <a href='http://osm.org/copyright'>OpenStreetMap</a> contributors"
      />
      <Marker position={position} icon={icon}>
        <Popup>
          {firstName} {lastName}'s Location
        </Popup>
      </Marker>
    </MapContainer>
  );
};

export default MapComponent;
