import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useLocation } from 'react-router-dom';
import { useStateContext } from "../contexts/contextprovider";
import axiosClient from '../axiosClient';

const LocationAuthComponent = () => {
    const [location, setLocation] = React.useState({ latitude: null, longitude: null });
    const [error, setError] = React.useState('');
    const [success, setSuccess] = React.useState('');
    const [loading, setLoading] = React.useState(false);

    const search = useLocation().search;
    const params = new URLSearchParams(search);
    const chatId = params.get('locationchatId');
    const locationAuth = params.get('locationAuth') === 'true';
    const { user } = useStateContext();

    
    const sendLocationToServer = async (latitude, longitude, chatId) => {
        setLoading(true); // Set loading to true when starting the request
        try {
            let response;

            // Check if user is authenticated
            if (user.id) {
                // Authenticated user
                response = await axiosClient.put('/locationAuth', {
                    latitude,
                    longitude,
                    chatId
                });
            } else {
                // Non-authenticated user
                response = await axiosClient.put('/location', {
                    latitude,
                    longitude,
                    chatId
                });
            }
        
            // Handle successful response
            setSuccess(response.data.message);
            console.log('Location sent successfully:', response.data);
        } catch (error) {
         
            // Handle any errors
            console.error('Error sending location:', error);
            setError('Failed to send location. Please try again.');
        } finally {
            setLoading(false); // Set loading to false after request completes
        }
    };

    const getLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setLocation({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude
                    });
                    setError('');
                },
                (error) => {
                    switch (error.code) {
                        case error.PERMISSION_DENIED:
                            setError('Please enable location permissions to share your location.');
                            break;
                        case error.POSITION_UNAVAILABLE:
                            setError('Location information is unavailable. Please ensure GPS is turned on.');
                            break;
                        case error.TIMEOUT:
                            setError('The request to get your location timed out. Try again.');
                            break;
                        case error.UNKNOWN_ERROR:
                            setError('An unknown error occurred. Please try again.');
                            break;
                        default:
                            setError('An error occurred while retrieving location.');
                    }
                }
            );
        } else {
            setError('Geolocation is not supported by this browser.');
        }
    };

    React.useEffect(() => {
        getLocation();
    }, []);

    const handleSubmit = () => {
        if (location.latitude && location.longitude) {
            sendLocationToServer(location.latitude, location.longitude, chatId);
        } else {
            setError('Location is not available. Please try again.');
        }
    };

    return (
        <div className="p-6 max-w-md mx-auto bg-white rounded-lg shadow-md">
            <h1 className="text-2xl font-semibold mb-4">Share Your Location</h1>
            {/* Show location or error */}
            {location.latitude && location.longitude ? (
                <>
                   
                    {/* Display the map */}
                    <div className="mb-4 h-64">
                        <MapContainer center={[location.latitude, location.longitude]} zoom={13} className="h-full">
                            <TileLayer
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            />
                            <Marker position={[location.latitude, location.longitude]}>
                                <Popup>
                                    Latitude: {location.latitude}<br />
                                    Longitude: {location.longitude}
                                </Popup>
                            </Marker>
                        </MapContainer>
                    </div>
                </>
            ) : (
                <p className="text-red-500 mb-4">{error}</p>
            )}
            {/* "Share" button is disabled and shows loading spinner when loading */}
            <button
                onClick={handleSubmit}
                disabled={loading || !location.latitude || !location.longitude}
                className={`px-4 py-2 font-semibold text-white rounded-lg transition-colors flex items-center ${
                    loading || !location.latitude || !location.longitude
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-blue-500 hover:bg-blue-600'
                }`}
            >
                {loading ? (
                    <svg
                        className="animate-spin h-5 w-5 mr-3"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                    >
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 01.154-1.647L1.78 8.758a12.001 12.001 0 010 6.484l2.374-1.595A8.038 8.038 0 014 12z"></path>
                    </svg>
                ) : (
                    'Share'
                )}
            </button>
            {/* Display success message */}
            {success && <p className="text-green-500 mt-4">{success}</p>}
        </div>
    );
};

export default LocationAuthComponent;
