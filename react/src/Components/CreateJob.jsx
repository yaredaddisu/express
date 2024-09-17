import React, { useState, useEffect } from 'react';
import axiosClient from '../axiosClient';
import { useStateContext } from "../contexts/contextprovider";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import LocationSelectorMap from './LocationSelectorMap';
import Modal from './Modal';
import { toast } from "react-toastify";

const JobForm = ({ jobData, onClose, getJobs}) => {
  const { user, setUser } = useStateContext();
  const [users, setUsers] = useState([]); 
  const [selectedUser, setSelectedUser] = useState(null);
  const [chatID, setChatID] = useState(null);
  const [technicianId, setTechnicianID] = useState(''); 
  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const skillsOptions = [
  
      { id: 1, name: "Others" },
      { id: 2, name: "TV" },
      { id: 3, name: "Washing Machine" },
      { id: 4, name: "Dish Expert" },
      { id: 5, name: "Fridge Expert" },
      { id: 6, name: "Electrician" },
 
  ];

  const [selectedSkill, setSelectedSkill] = useState('');
 
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const generateRef = () => {
    const randomPart = Math.random().toString(36).substring(2, 10).toUpperCase(); // Generates a random string
    const timePart = Date.now().toString(36).toUpperCase(); // Converts current time to a base-36 string
    return `${randomPart}-${timePart}`; // Combine the parts for a unique reference
  };
  const navigate = useNavigate();
   
  // console.log(generateRef())
  const [job, setJob] = useState({     
    
    title: '',
    description: '',
    company: '',
    location: '',
    salary: '',
    status: '1',
    user_id: user?.id || '',
    chat_id: user?.chat_id || '',
    technician_id: technicianId,
    Reference: generateRef(),
    latitude: ' ',
    longitude: ' ',
    selectedSkill:' '
  });

  useEffect(() => {
    if (jobData.id) {
      setJob({
        id: jobData.id || null,
        title: jobData.title || '',
        description: jobData.description || '',
        company: jobData.company || '',
        location: jobData.location || '',
        salary: jobData.salary || '',
        chat_id: jobData.chat_id || '',
        technician_id: jobData.technician_id || '',
        user_id: jobData.user_id || user?.id || '',
        status: jobData.status || '1',
        latitude:jobData.latitude || ' ',
longitude:jobData.longitude || ' ',
selectedSkill:jobData.selectedSkill || ' ',

      });
    }
  }, [setJob, jobData, user?.id]);

  useEffect(() => {
    axiosClient.get('/user')
      .then(({ data }) => {
        setUser(data);
        setJob(prevJob => ({
          ...prevJob,
          user_id: data.id,
          chat_id: data.chat_id,
        }));
      })
      .catch(error => console.error('Error fetching user data:', error));
  }, [setUser]);

  // useEffect(() => {
  //   axiosClient.get('/getUsers')
  //     .then(response => {
  //       const usersData = response.data.data;
  //       if (Array.isArray(usersData)) {
  //         setUsers(usersData);
  //       } else {
  //         console.error('Unexpected data format:', usersData);
  //       }
  //     })
  //     .catch(error => {
  //       console.error('There was an error fetching the users!', error);
  //       setUsers([]);
  //     });
  // }, [setUsers]);

  const handleChange = (e) => {
    setJob({
      ...job,
      [e.target.name]: e.target.value,
    });
    setSelectedSkill(event.target.value); 
  };
  const getUserByLocation = async ( ) => {
     
  
    try {
      // Send job latitude and longitude to the backend
      const response = await axiosClient.post('/getUsers', {
       latitude:job.latitude,
       longitude:job.longitude,
       skill_id:selectedSkill
      });
       setUsers(response.data.data)
      // Handle the response (filtered users based on location)
      // console.log('Users near job location:', response);
    } catch (error) {
      console.error('Error fetching users by location:', error);
    }
  };
  // Function to update latitude and longitude
  const updateCoordinates = (lat, lng) => {
    setJob((prevJob) => ({
      ...prevJob,
      latitude: lat,
      longitude: lng,
    }));
  };

  const handleSelectChange = (event) => {
    const userId = parseInt(event.target.value, 10);
    const userInfo = users.find(u => u.id === userId);
    setSelectedUser(userInfo);
    setChatID(userInfo?.chat_id);
    setTechnicianID(userInfo?.id);
   
    // Update the job with selected user info
    setJob(prevJob => ({
      ...prevJob,
      technician_id: userInfo?.id || '',
      chat_id: userInfo?.chat_id || '',
    }));
  };

  // const availableUsers = users.filter(user => user.availability === '1' && user.status === '1');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
  
    try {
      let response;
    
      if (jobData.id) {
        // Update existing job
        response = await axiosClient.put(`/jobs/${jobData.id}`, job);
        const jobId = response.data.data.id;
    
        if (response.data.data && chatID) {
          // Send job details to Telegram bot
          
          sendJobToTelegram(chatID, response.data.data, jobId);
        }
    
        toast.success('Job updated successfully');
      } else {
        // Create new job
        response = await axiosClient.post('/jobs', job);
        const jobId = response.data.data.id;
        
        // Display success message
        toast.success('Job created successfully');
     
        if (response.data.data && chatID) {
          // Send job details to Telegram bot
          sendJobToTelegram(chatID, response.data.data, jobId);
        }
      }
    
      // Handle success
      setSuccess(response.data.message);
      getJobs(); // Refresh job list
      navigate('/jobs');
      onClose();
    
    } catch (err) {
      const response = err.response;
      if (response && response.status === 422) {
        // Validation errors
        const errors = response.data.errors;
        if (Array.isArray(errors)) {
          errors.forEach(error => toast.error(error)); // Display each error message
        } else {
          toast.error('Validation error');
        }
        setErrors(errors); 
      } else {
        
        // General errors
        toast.error(response.data.message);
        console.error('There was an error submitting the job!', err);
      }
    } finally {
      setIsLoading(false);
    }
    
  };
  
  

  const sendJobToTelegram = async (chatID, jobDetails, jobId) => {
    console.log("jobDetails",jobDetails)
      // Map URL using OpenStreetMap
      const mapUrl = `https://www.openstreetmap.org/?mlat=${jobDetails.latitude}&mlon=${jobDetails.longitude}#map=13/${jobDetails.latitude}/${jobDetails.longitude}`;
 
  
   
 const messageText = `
 <b>Job ID:</b> ${jobDetails.id}\n
 <b>Job Reference:</b> ${jobDetails.Reference}\n
 
 <b>Title:</b> ${jobDetails.title}\n
 <b>Description:</b> ${jobDetails.description}\n
 <b>Company:</b> ${jobDetails.company}\n
 <b>Location:</b> ${jobDetails.location}\n
 <b>Status:</b> ${jobDetails.status === '1' ? 'In Progress 🟢' : 'Completed 🔵'}\n
  
 <b>First Name:</b> ${selectedUser.firstName}\n
 <b>Last Name:</b> ${selectedUser.lastName}\n
 <b>Phone:</b> ${selectedUser.phone}\n
 <b>Email:</b> ${selectedUser.email}\n
 <b>Username:</b> @${selectedUser.username}\n
 
 <b>Created At:</b> ${new Date(jobDetails.created_at).toLocaleString()}
 <b>Updated At:</b> ${new Date(jobDetails.updated_at).toLocaleString()}
     `;

        // Example of sending a message with an inline keyboard
       
    // Attach job ID to the callback data for each button
    const inlineButtons = [
      [
        { text: 'Approve', callback_data: `approveJob_${jobId}_${selectedUser.id}_${user.id}` },
        { text: 'Reject', callback_data: `rejectJob_${jobId}_${selectedUser.id}_${user.id}` }
      ],
      [
        { text: 'View Map', url: mapUrl }
    ]
    ];
     

    const token = '6685274704:AAFR-NXKCnfe7RZy9tGq5Swn2A0tDkTsrBU'; // Your bot token
  
    // Telegram message payload
    const telegramMessage = {
      chat_id: chatID,
      text: messageText,
      parse_mode: 'HTML', // Specify the parse mode to interpret HTML tags
      reply_markup: JSON.stringify({
        inline_keyboard: inlineButtons
      })
    };
  
    const channelMessage = {
      chat_id: '@lomiworks', // Replace with your channel's username
      text: messageText,
      parse_mode: 'HTML', // Specify the parse mode to interpret HTML tags
      reply_markup: JSON.stringify({
        inline_keyboard: inlineButtons
      })
    };
  
    try {
      // Send to user
      await axios.post(`https://api.telegram.org/bot${token}/sendMessage`, telegramMessage);
      console.log('Message sent to Telegram user successfully');
  
      // // Send to channel
      // await axios.post(`https://api.telegram.org/bot${token}/sendMessage`, channelMessage);
      // console.log('Message sent to Telegram channel successfully');
    } catch (error) {
      console.error('Failed to send message to Telegram:', error);
    }
};

  return (
<form onSubmit={handleSubmit} >

  <div className="grid grid-cols-2 gap-4 mb-4">

  <input 
    type="text" 
    name="title" 
    placeholder="Job Title" 
    value={job.title} 
    onChange={handleChange} 
    className="w-full px-3 py-2 border border-gray-300 rounded-md"
  />

  <input 
    type="text" 
    name="company" 
    placeholder="Company" 
    value={job.company} 
    onChange={handleChange} 
    className="w-full px-3 py-2 border border-gray-300 rounded-md"
  />
  <input 
    type="text" 
    name="location" 
    placeholder="Location" 
    value={job.location} 
    onChange={handleChange} 
    className="w-full px-3 py-2 border border-gray-300 rounded-md"
  />
  <input 
    type="number"  
    name="salary" 
    placeholder="Salary" 
    value={job.salary} 
    onChange={handleChange} 
    className="w-full px-3 py-2 border border-gray-300 rounded-md"
  />
  <input 
    type="number"  
    name="latitude" 
    placeholder="Latitude" 
    value={job.latitude} 
    onChange={handleChange} 
    className="w-full px-3 py-2 border border-gray-300 rounded-md"
  />
  <input 
    type="number"  
    name="longitude" 
    placeholder="Longitude" 
    value={job.longitude} 
    onChange={handleChange} 
    className="w-full px-3 py-2 border border-gray-300 rounded-md"
  />
  <div>
  
      <label htmlFor="skills">Select Skill:</label>
      <select id="skills" value={selectedSkill} onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
>
        <option value="">Select a skill</option>
        {skillsOptions.map(skill => (
          <option key={skill.id} value={skill.id}>
            {skill.name}
          </option>
        ))}
      </select>
    </div>
  {jobData.id && (
    
    <select
      name="status" 
      value={job.status} 
      onChange={handleChange}
      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
    >
      <option value="1">Open</option>
      <option value="0">Closed</option>
      <option value="2">Completed</option>
    </select>
  )}
  
  {users && (
    <div className="col-span-2">
      <label htmlFor="userSelect" className="block text-gray-700">User:</label>
      <select
        id="userSelect"
        onChange={handleSelectChange}
        value={selectedUser?.id || ''}
        className="block w-full mt-2 p-2 border border-gray-300 rounded"
      >
        <option value="" disabled>Select a user...</option>
        {users.map(user => (
          <option key={user.id} value={user.id}>
            {user.firstName} {user.lastName} {Boolean(Number(user.availability)) ? "🟢 Available" : ""}
          </option>
        ))}
      </select>
    </div>
  )}
  </div>
  <textarea 
  className='mb-4'
        name="description" 
        placeholder="Job Description" 
        value={job.description} 
        onChange={handleChange}
      />
 
  <div className="col-span-2 flex gap-4">
    <button
      onClick={() => getUserByLocation()}
      className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      type="button"
    >
      Search user
    </button>
    <button
      className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      type="submit"
      disabled={!users}
    >
      {isLoading ? 'Loading...' : jobData.id ? 'Update Job' : 'Create Job'}
    </button>
  </div>
  <div className="col-span-2 flex gap-4">

  <button 
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
              onClick={openModal}
              type="button"
            >
             Open Map
            </button>
            </div>
            {isModalOpen && (
  <div className="fixed w-full inset-0 flex items-center justify-center z-50">
    <div className="fixed inset-0 bg-gray-800 opacity-50" onClick={closeModal}></div>
    <div className="bg-white rounded-md shadow-lg p-4 relative z-10 w-full max-h-[90vh]">
      <button 
        className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
        onClick={closeModal}
      >
        &times;
      </button>
      <LocationSelectorMap 
        latitude={job.latitude} 
        longitude={job.longitude} 
        onLocationSelect={updateCoordinates}  
      />
    </div>
  </div>
)}

</form>

  );
};

export default JobForm;
