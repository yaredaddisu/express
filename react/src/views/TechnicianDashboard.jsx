import React, { useEffect, useState } from 'react';
import { AiOutlineInfoCircle, AiOutlineCheckCircle, AiOutlineClockCircle } from "react-icons/ai";
import { FiActivity, FiArchive, FiBell, FiClipboard, FiDelete, FiDollarSign, FiPenTool, FiSettings } from "react-icons/fi";
import axios from 'axios';
import axiosClient from '../axiosClient';
import LoadingSpinner from '../Components/LoadingSpiner';
import ConfirmedTasks from './ConfirmedTasks';
import { Link } from 'react-router-dom';
 
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

const TechnicianDashboard = () => {
  const [user, setUser] = useState(null);
  const [userId, setUserId] = useState(null);
  const [jobAssignments, setJobAssignments] = useState([]);
  const [tasksCompleted, setTasksCompleted] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
 const [completedJobs, setJobCompleted] = useState([]);
 const [canceledJobs, setJobCanceled] = useState([]);
 const [isTasks, setJobTasks] = useState([]);
  const [isTotalSalary, setTotalSalary] = useState([]);

    const [isOpen, setIsOpen] = useState(false); // State to control dropdown visibility
 
   const toggleDropdown = () => {
     setIsOpen(!isOpen);
   };
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const decodedToken = parseJwt(token);
      setUserId(decodedToken.userId);
      setUser(decodedToken.user);
    }
  }, []);

  useEffect(() => {
    // Fetch active jobs
    const fetchActiveJobs = async () => {
      setIsLoading(true)
      try {
        const response = await axiosClient.get(`/confirmed-tasks/${userId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        const response1 = await axiosClient.get(`/completed/${userId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        const response2 = await axiosClient.get(`/cancel-tasks/${userId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        const response3 = await axiosClient.get(`/tasks/${userId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        const response4 = await axiosClient.get(`/totalSalary/${userId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setJobAssignments(response.data.data);
        setJobCompleted(response1.data.data);
setJobCanceled(response2.data.data);
setJobTasks(response3.data.data);
setTotalSalary(response4.data.totalSalary)

      } catch (error) {
        setIsLoading(false)
        console.error("Error fetching active jobs:", error);
      }finally{
        setIsLoading(false)

    }
    };

    // Fetch tasks completed percentage
    const fetchTasksCompleted = async () => {
      try {
        setIsLoading(true)

        const response = await axiosClient.get(`/tasks/completed/${userId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        console.log(response)
        setTasksCompleted(response.data.percentage);
      } catch (error) {
        setIsLoading(false)
        console.error("Error fetching tasks completed:", error);
      }finally{
        setIsLoading(false)

    }
    };

    if (userId) {
      fetchActiveJobs();
      fetchTasksCompleted();
    }
  }, [userId]);
//   const [notifications, setNotifications] = useState([]);

// useEffect(() => {
//   const eventSource = new EventSource(`http://localhost:30000/api/events/${userId}`);

//   // Create an audio object for the notification sound
//   const notificationSound = new Audio('/notification.mp3'); // Adjust the path based on your setup

//   eventSource.onmessage = (event) => {
//     const data = JSON.parse(event.data); // Parse the JSON data

//     // Assuming data is an array, update state
//     setNotifications((prevNotifications) => {
//       const newNotifications = [...prevNotifications, ...data];
//       // Play sound for each new notification
//       notificationSound.play();
//       return newNotifications;
//     });
//   };

//   eventSource.onerror = (error) => {
//     console.error("SSE connection error:", error);
//     eventSource.close();
//   };

//   return () => {
//     eventSource.close();
//   };
// }, [userId]);
  return (
    <div className="bg-gray-100 p-4 min-h-screen space-y-6">
      {/* <header className="flex justify-between items-center p-4 bg-white rounded-lg shadow">
        <div>
          <h1 className="text-xl font-bold">Hello, {user?.firstName + " " + user?.lastName}</h1>
          <p className="text-sm text-gray-500">Technician Status: <span className="text-green-600">{user?.availability === "1" ? "Available" : "Not Available"}</span></p>
        </div>
        <FiBell className="text-gray-400 w-6 h-6" />
      </header> */}
      {isLoading && <LoadingSpinner />}

 
      {/* Job Assignments */}
      {/* <section>
        <h2 className="text-lg font-semibold text-gray-700 mb-3">Your Tasks</h2>
        <div className="space-y-4">
          {jobAssignments.map((job) => (
            <div key={job.id} className="bg-white p-4 rounded-lg shadow-lg flex items-center justify-between">
              <div>
                <h3 className="text-md font-bold">{job.title}</h3>
                <p className="text-sm text-gray-500">{job.location}</p>
                <div className="mt-2 flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${job.urgency === "High" ? "bg-red-100 text-red-600" : "bg-yellow-100 text-yellow-600"}`}>{job.urgency} Priority</span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${job.status === "1" ? "bg-blue-100 text-blue-600" : "bg-gray-200 text-gray-600"}`}>{job.status === "1" ? "In Progress" : " "}</span>
                </div>
              </div>
              <AiOutlineClockCircle className="text-gray-400 w-5 h-5" />
            </div>
          ))}
        </div>
      </section> */}
   <ConfirmedTasks />
      {/* Statistics Overview */}
  
      {/* <div className="relative bg-gray-100   p-6">
      <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">Reminder Notifications</h1>
      
     
      <div className="absolute top-4 right-4 mr-4">
        <button onClick={toggleDropdown} className="flex items-center">
          <FiBell className="text-2xl w-20 text-blue-600" />
          {notifications.length > 0 && (
            <span className="bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs absolute -top-1 -right-1">
              {notifications.length}
            </span>
          )}
        </button>
      </div>

   
      {isOpen && (
        <div className="absolute right-4 mt-2 w-72 bg-white shadow-md rounded-lg z-10 ovreflow-scroll">
          <div className="p-4">
            {notifications.length === 0 ? (
              <p className="text-gray-700">No notifications</p>
            ) : (
              notifications.map((notification, idx) => (
                <div key={`${notification.jobId}-${idx}`} className="border-b border-gray-200 last:border-b-0 py-2">
                  <h2 className="text-lg font-semibold text-blue-600">{notification.title}</h2>
                  <p className="text-gray-700 mt-1">{notification.description}</p>
                  <div className="text-sm space-y-1">
                    <p><span className="font-semibold">Location:</span> {notification.location}</p>
                    <p><span className="font-semibold">Company:</span> {notification.company}</p>
                    <p><span className="font-semibold">Reference:</span> {notification.Reference}</p>
                    <p><span className="font-semibold">Salary:</span> ${notification.salary}</p>
                    <p><span className="font-semibold">Driver:</span> {notification.driver}</p>
                    <p><span className="font-semibold">Dispatch Time:</span> {new Date(notification.dispatchTime).toLocaleString()}</p>
                    <p><span className="font-semibold">ETA:</span> {new Date(notification.eta).toLocaleString()}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div> */}




      <section>
         <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-lg text-center">
            <AiOutlineCheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <p className="text-xl font-bold">{tasksCompleted}%</p>
            <p className="text-sm text-gray-600">Tasks Completed</p>
          </div>
          <Link to={"/confirmed-tasks"}>
          <div className="bg-white p-4 rounded-lg shadow-lg text-center">
            <FiActivity className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <p className="text-xl font-bold">{jobAssignments.length} Active</p>
            <p className="text-sm text-gray-600">Current Jobs</p>
          </div></Link>
        </div>
      </section>
      <section>
 
        <div className="grid md:grid-cols-2  grid-cols-1 gap-4">
        <Link to={"/completed-tasks"}>
        <div className="bg-white p-4 rounded-lg shadow-lg text-center">
            <FiArchive className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <p className="text-xl font-bold">{completedJobs.length} Completed</p>
            <p className="text-sm text-gray-600">Completed Jobs</p>
          </div>
          </Link>
          <Link to={"/tasks"}>
          <div className="bg-white p-4 rounded-lg shadow-lg text-center">
            <FiPenTool className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <p className="text-xl font-bold">{isTasks.length} available </p>
            <p className="text-sm text-gray-600">available  Jobs</p>
          </div>
          </Link>
          <Link to={"/canceld-tasks"}>
          <div className="bg-white p-4 rounded-lg shadow-lg text-center">
            <FiDelete className="w-8 h-8 text-red-500 mx-auto mb-2" />
            <p className="text-xl font-bold">{canceledJobs.length} Cancelled</p>
            <p className="text-sm text-gray-600">Cancelled Jobs</p>
          </div>
          </Link>
          <div className="bg-white p-4 rounded-lg shadow-lg text-center">
            <FiDollarSign className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <p className="text-xl font-bold">{isTotalSalary} ETB</p>
            <p className="text-sm text-gray-600">Total Salary</p>
          </div>
        </div>
      </section>
    
    </div>
        
  );
};

export default TechnicianDashboard;
