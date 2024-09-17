import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for missing leaflet icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

const LocationSelectorMap = ({ onLocationSelect }) => {
  const defaultPosition = { lat: 9.011021403797717, lng: 38.75950813293457 }; // Default position for Addis Ababa
  const [position, setPosition] = useState(defaultPosition);

  // Component to handle map click events
  const LocationMarker = () => {
    useMapEvents({
      click(e) {
        const { lat, lng } = e.latlng;
        setPosition({ lat, lng });
        if (onLocationSelect) {
          onLocationSelect(lat, lng); // Call the passed function to update the form state
        }
      },
    });

    return position ? <Marker position={position} /> : null; // Render marker at the selected position
  };

  return (
    <div>
      <MapContainer
        center={[defaultPosition.lat, defaultPosition.lng]} // Center map on default position
        zoom={13}
        style={{ height: '400px', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <LocationMarker />
      </MapContainer>
    </div>
  );
};

export default LocationSelectorMap;
