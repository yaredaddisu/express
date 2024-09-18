import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../axiosClient';
import { toast } from "react-toastify";
const RegistrationForm = ({ userData, onClose, getUsers }) => {
  const roles = [
    { id: 1, role: 'Admin' },
    { id: 2, role: 'Finance' },
    { id: 3, role: 'Technician' },
  ];

  const skillsOptions = [
    { id: 1, name: "Others" },
    { id: 2, name: "TV" },
    { id: 3, name: "Washing Machine" },
    { id: 4, name: "Dish Expert" },
    { id: 5, name: "Fridge Expert" },
    { id: 6, name: "Electrician" },
  ];

  // State to track selected skills
  const [selectedOptions, setSelectedOptions] = useState([]);

  // State for form data
  const [formData, setFormData] = useState({
    id: null,
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    chat_id: '',
    username: '',
    role: '3',
    status: '1',
    availability: '1',
    skills: [], // Initialize skills as an empty array
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();

  // Pre-fill form data and skills when editing
  useEffect(() => {
    if (userData) {
      setIsEditing(true);
      setFormData({
        id: userData.id || null,
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        email: userData.email || '',
        phone: userData.phone || '',
        password: '',
        chat_id: userData.chat_id || '',
        username: userData.username || '',
        role: userData.role || '1',
        status: userData.status || '1',
        availability: userData.availability || '1',
        skills: userData.skills || [],
      });

      // Pre-fill selected skills
      setSelectedOptions(userData.skills || []);
    }
  }, [userData]);

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  // Handle skill checkbox toggle
  const handleCheckboxChange = (option) => {
    const skillIndex = selectedOptions.findIndex((item) => item.id === option.id);
    if (skillIndex > -1) {
      // Remove if already selected
      setSelectedOptions(selectedOptions.filter((item) => item.id !== option.id));
    } else {
      // Add the selected skill
      setSelectedOptions([...selectedOptions, option]);
    }
  };

  // Synchronize selectedOptions with formData.skills
  useEffect(() => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      skills: selectedOptions, // Update skills in formData
    }));
  }, [selectedOptions]);

  const handleToggleStatus = () => {
    setFormData((prevData) => ({
      ...prevData,
      status: prevData.status === '1' ? '0' : '1',
    }));
  };

  const handleToggleAvailability = () => {
    setFormData((prevData) => ({
      ...prevData,
      availability: prevData.availability === '1' ? '0' : '1',
    }));
  };
  const notifySuccess = () => toast.success("Success notification!");

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    const userPayload = { ...formData };

    if (formData.id) {
      axiosClient.put(`/users-registration/${formData.id}`, userPayload)
      .then((res) => {
        setLoading(false);

       
          if (res.data.data.data.errors) {
            // Extract errors and display them

            const errors = res.data.data.data.errors;
            errors.forEach((error) => {
              toast.error(error); // Display each validation error message
            });
          } else {
            

            // If everything is successful, proceed with success message
            toast.success(res.data.data.data.message); 
            getUsers(); // Fetch the updated list of users
            navigate('/users'); // Navigate to the users page
              onClose(); // Close the form/modal
          }
      
           
      })
      .catch((err) => {
        setLoading(false);
        const response = err.response;
    
        // Check if it's a validation error (422 status)
        if (response && response.status === 422) {
          const errorMessages = response.data.errors;
    
          // Display each error using toast
          Object.keys(errorMessages).forEach((field) => {
            errorMessages[field].forEach((message) => {
              toast.error(`${field}: ${message}`); // Display the field-specific error message
            });
          });
        } else {
          // Handle other types of errors (e.g., network errors)
          toast.error("An error occurred. Please try again.");
        }
      });
    
    } else {
      axiosClient.post('/users-registration', userPayload)
      .then((res) => {
        setLoading(false); // Stop loading indicator
        if (res.data.success) {
          toast.success(res.data.message); // Display success message
          getUsers(); // Fetch the updated list of users
          navigate('/users'); // Navigate to the users page
          onClose();
        } else {
          toast.error(res.data.message); // Display error message if response success is false
          //onClose(); // Close the form/modal
        }
      })
      .catch((err) => {
        setLoading(false); // Stop loading indicator
     
        const response = err.response;
        console.log(response)
        if (response) {
          if(response.status === 500){
            toast.error(response.data.message  ); 
          }
          if (response.status) {
            const errors = response.data.errors;
       
            // Iterate over each field in the errors object
            Object.keys(errors).forEach((field) => {
            
              toast.error(errors[field]);
               
            });
          toast.error("Validation failed. Please check the form.");
          }
   
          else {
            // Display the actual error message from the server
            toast.error(response.data.message || "An error occurred. Please try again."); 
          }
        } 
        
        else {
          // Handle the case where the error response does not exist (network issues, etc.)
          toast.error("Network error. Please try again.");
        }
    
        console.error("Error response:", err); // Log the full error for debugging
      });
    
    }
  };

  setTimeout(() => {
    setErrors(null);
    setSuccess(null);
  }, 10000);


  const handleToggleavailability = () => {
    setFormData((prevData) => ({
      ...prevData,
      availability: prevData.availability === '1' ? '0' : '1',
    }));
  };

  return (
    <> 
    <form onSubmit={handleSubmit} className="space-y-4">
    
      {success && (
        <div>
          <span className="inline-flex w-full items-center justify-center px-3 py-1 text-sm font-medium text-white bg-green-500 rounded-full">
            {typeof success === "string" ? <p>{success}</p> : Object.keys(success).map(key => (<p key={key}>{success[key][0]}</p>))}

          </span>
        </div>
      )}      <input
        type="text"
        name="firstName"
        value={formData.firstName}
        onChange={handleChange}
        placeholder="First Name"
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        required />
      <input
        type="text"
        name="lastName"
        value={formData.lastName}
        onChange={handleChange}
        placeholder="Last Name"
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" />
      <input
        type="email"
        name="email"
        value={formData.email}
        onChange={handleChange}
        placeholder="Email"
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        required />
      <input
        type="tel"
        name="phone"
        value={formData.phone}
        onChange={handleChange}
        placeholder="Phone"
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" />
      <input
        type="password"
        name="password"
        value={formData.password}
        onChange={handleChange}
        placeholder="Password"
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" />
      <input
        type="number"
        name="chat_id"
        value={formData.chat_id}
        onChange={handleChange}
        placeholder="Chat ID"
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" />
      <input
        type="text"
        name="username"
        value={formData.username}
        onChange={handleChange}
        placeholder="Username"
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        required />
      <h2>Select Your Expertise</h2>
      <div className="checkbox-group">
      {skillsOptions.map((option) => (
        <div key={option.id} className="checkbox-item">
          <input
            type="checkbox"
            id={`skill_${option.id}`}
            value={option.name}
            checked={selectedOptions.some((item) => item.id === option.id)}
            onChange={() => handleCheckboxChange(option)}
          />
          <label htmlFor={`skill_${option.id}`}>{option.name}</label>
        </div>
      ))}
    </div>
      <select
        name="role"
        value={formData.role}
        onChange={handleChange}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        {roles.map((role) => (
          <option key={role.id} value={role.id}>
            {role.role}
          </option>
        ))}
      </select>
      {userData && (

        <><div className="flex items-center mb-4">
          <button
            type="button"
            onClick={handleToggleStatus}
            className={`px-4 py-2 rounded-md text-white ${formData.status === '1' ? 'bg-green-500' : 'bg-red-500'}`}
          >
            {formData.status === '1' ? 'Active' : 'Inactive'}
          </button>
        </div><div className="flex items-center">
            <button
              type="button"
              onClick={handleToggleavailability}
              className={`px-4 py-2 rounded-md text-white ${formData.availability === '1' ? 'bg-green-500' : 'bg-red-500'}`}
            >
              {formData.availability === '1' ? 'Available' : 'Unavailable'}
            </button>
          </div></>
      )}
      <button
        className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        type="submit"
        disabled={isLoading}
      >
        {formData.id ? 'Update' : 'Register'}
      </button>
    </form></>
  );
};

export default RegistrationForm;
