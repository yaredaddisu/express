import React, { useEffect, useState } from 'react';
import { AiOutlineInfoCircle, AiOutlineCheckCircle, AiOutlineClockCircle } from "react-icons/ai";
import { FiActivity, FiArchive, FiBell, FiClipboard, FiDelete, FiDollarSign, FiPenTool, FiSettings } from "react-icons/fi";
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
  const [isLoading, setIsLoading] = useState(true); // Default to true to show loading initially
  const [completedJobs, setJobCompleted] = useState([]);
  const [canceledJobs, setJobCanceled] = useState([]);
  const [isTasks, setJobTasks] = useState([]);
  const [isTotalSalary, setTotalSalary] = useState(0);

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
    if (userId) {
      const fetchData = async () => {
        setIsLoading(true); // Start loading

        try {
          const responses = await Promise.all([
            axiosClient.get(`/confirmed-tasks/${userId}`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }),
            axiosClient.get(`/completed/${userId}`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }),
            axiosClient.get(`/cancel-tasks/${userId}`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }),
            axiosClient.get(`/tasks/${userId}`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }),
            axiosClient.get(`/totalSalary/${userId}`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }),
            axiosClient.get(`/tasks/completed/${userId}`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }),
          ]);

          setJobAssignments(responses[0].data.data);
          setJobCompleted(responses[1].data.data);
          setJobCanceled(responses[2].data.data);
          setJobTasks(responses[3].data.data);
          setTotalSalary(responses[4].data.totalSalary);
          setTasksCompleted(responses[5].data.percentage);
        } catch (error) {
          console.error("Error fetching data:", error);
        } finally {
          setIsLoading(false); // Stop loading
        }
      };

      fetchData();
    }
  }, [userId]);

  return (
    <div className="bg-gray-100 p-4 min-h-screen space-y-6">
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <>
          <ConfirmedTasks />
          
          {/* Statistics Overview */}
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
                </div>
              </Link>
            </div>
          </section>
          <section>
            <div className="grid md:grid-cols-2 grid-cols-1 gap-4">
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
                  <p className="text-xl font-bold">{isTasks.length} Available</p>
                  <p className="text-sm text-gray-600">Available Jobs</p>
                </div>
              </Link>
              <Link to={"/cancel-tasks"}>
                <div className="bg-white p-4 rounded-lg shadow-lg text-center">
                  <FiDelete className="w-8 h-8 text-red-500 mx-auto mb-2" />
                  <p className="text-xl font-bold">{canceledJobs.length} Cancelled</p>
                  <p className="text-sm text-gray-600">Cancelled Jobs</p>
                </div>
              </Link>
              <div className="bg-white p-4 rounded-lg shadow-lg text-center">
                <FiDollarSign className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <p className="text-xl font-bold">
  {new Intl.NumberFormat('en-ET', {
    style: 'currency',
    currency: 'ETB'
  }).format(isTotalSalary)}
</p>
                <p className="text-sm text-gray-600">Total Salary</p>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
};

export default TechnicianDashboard;
