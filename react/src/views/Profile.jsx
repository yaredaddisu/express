

import { useNavigate, useParams } from "react-router-dom";
import axiosClient from "../axiosClient";
import SignatureCanvas from 'react-signature-canvas';
import React, { useState, useRef,useEffect } from 'react';
import { Link } from "react-router-dom";
import { jsPDF } from 'jspdf';
import { useLocation } from 'react-router-dom';
import { useStateContext } from "../contexts/contextprovider";
import { v4 as uuidv4 } from 'uuid'; 
 



const Profile = () => {
    const { user } = useStateContext();
    console.log(user)

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
              <h1 className="text-2xl  font-semibold text-gray-800">{user.firstName} {user.lastName}</h1>
              <p className="text-sm  mt-4 text-gray-600">{user.role === "1" ? "Admin" : "Technitian"}</p>
    
              {/* Profile Details */}
              <div className="mt-4">
                <div className="text-gray-700">
                  <span className="font-semibold">Email:</span> {user.email}
                </div>
                <div className="text-gray-700">
                  <span className="font-semibold">Phone:</span> {user.phone}
                </div>
                <div className="text-gray-700">
                  <span className="font-semibold">Location:</span> {user.latitude}, {user.longitude}
                </div>
                <div className="text-gray-700">
                  <span className="font-semibold">Experience:</span> {user.experience}
                </div>
                <div className="text-gray-700">
                  <span className="font-semibold">Skills:</span> {user.skills}
                </div>
                <div className="text-gray-700">
                  <span className="font-semibold">Status:</span> {user.status === "1" ? "Active" : "Inactive"}
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
  