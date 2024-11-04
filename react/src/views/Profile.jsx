

import { useNavigate, useParams } from "react-router-dom";
import axiosClient from "../axiosClient";
import SignatureCanvas from 'react-signature-canvas';
import React, { useState, useRef,useEffect } from 'react';
import { Link } from "react-router-dom";
import { jsPDF } from 'jspdf';
import { useLocation } from 'react-router-dom';
import { useStateContext } from "../contexts/contextprovider";
import { v4 as uuidv4 } from 'uuid'; 
 

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

const Profile = () => {
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
  console.log("response", user);
    return (
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="flex flex-col md:flex-row items-center p-6">
            {/* Profile Picture Placeholder */}
            <div className="flex-shrink-0 mb-4 md:mb-0">
              <img
                className="w-32 h-32 rounded-full object-cover"
                src="https://via.placeholder.com/150"
                alt="Profile"
              />
            </div>
            
            <div className="md:ml-6">
              {/* Profile Name */}
              <h1 className="text-2xl  font-semibold text-gray-800">{user?.firstName} {user?.lastName}</h1>
              <p className="text-sm  mt-4 text-gray-600">{user?.role === "1" ? "Admin" : "Technitian"}</p>
    
              {/* Profile Details */}
              <div className="mt-4">
                <div className="text-gray-700">
                  <span className="font-semibold">Email:</span> {user?.email}
                </div>
                <div className="text-gray-700">
                  <span className="font-semibold">Phone:</span> {user?.phone}
                </div>
                <div className="text-gray-700">
                  <span className="font-semibold">Location:</span> {user?.latitude}, {user?.longitude}
                </div>
                <div className="text-gray-700">
                  <span className="font-semibold">Experience:</span> {user?.experience}
                </div>
                <div className="text-gray-700">
  <span className="font-semibold">Skills:</span>
  {user?.skills ? (
    Array.isArray(user.skills) ? (
      user.skills.map((skill) => (
        <span key={skill.id} className="ml-2">
          {skill.name}
        </span>
      ))
    ) : (
      // Attempt to parse if skills is a string
      (() => {
        try {
          const skillsArray = JSON.parse(user.skills);
          return skillsArray.map((skill) => (
            <span key={skill.id} className="ml-2">
              {skill.name},
            </span>
          ));
        } catch (error) {
          console.error("Error parsing skills:", error);
          return <span> No skills listed.</span>;
        }
      })()
    )
  ) : (
    <span> No skills listed.</span>
  )}
</div>

                <div className="text-gray-700">
                <div className="text-gray-700">
  <span className="font-semibold">Status:</span>
  <span
    className={`ml-2 font-semibold ${
      user?.status === "1" ? "text-green-600" : "text-red-600"
    }`}
  >
    {user?.status === "1" ? "Active" : "Inactive"}
  </span>
</div>
                </div>
              </div>
    
              {/* Action Buttons */}
              <div className="mt-6 flex space-x-4">
                <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                  Message
                </button>
                <button className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-2 px-4 rounded">
                  Follow
                </button>
              </div>
            </div>
          </div>
        </div>
      );
  };
  
  export default Profile;
  