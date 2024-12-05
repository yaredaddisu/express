import React, { useEffect, useState } from 'react';
import { AiOutlineInfoCircle, AiOutlineCheckCircle, AiOutlineClockCircle } from "react-icons/ai";
import { FiActivity, FiArchive, FiBell, FiClipboard, FiDelete, FiDollarSign, FiPenTool, FiPocket, FiSettings, FiUser } from "react-icons/fi";
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
  const [isTotalUsers, setTotalUsersCount] = useState(0);
  const [isTotalJobs, setTotalJobsCount] = useState(0);

  const [jobReportsAssignments, setReportsJobAssignments] = useState(0);
const [jobsReportsCompleted, setReportsJobCompleted] = useState(0);
  const [tasksReportsCanceled, setReportsJobCanceled] = useState(0);
const [isReportsTasks, setReportsJobTasks] = useState(0);
const [isTotalReportsSalary, setReportsTotalSalary] = useState(0);
  const [tasksReportsCompleted, setReportsTasksCompleted] = useState(0);


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
    if (userId && user.role === "3") {
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
          setIsLoading(false);
        } catch (error) {
          console.error("Error fetching data:", error);
          setIsLoading(false);
        } finally {
          setIsLoading(false); // Stop loading
        }
      };

      fetchData();
    }


   
    if (userId && user.role === "1") {
      const fetchReports = async () => {
        setIsLoading(true); // Start loading

        try {
          const responses = await Promise.all([
            axiosClient.get(`/reports/confirmed-tasks`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }),
            axiosClient.get(`/reports/completed`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }),
            axiosClient.get(`/reports/cancel-tasks`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }),
            axiosClient.get(`/reports/tasks`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }),
            axiosClient.get(`/reports/totalSalary`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }),
            axiosClient.get(`/reports/percent`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }),
            axiosClient.get(`/reports/users`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }),
            axiosClient.get(`/reports/totalJobsCount`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }),

          ]);
           
          
          
          
          setReportsJobAssignments(responses[0].data.confirmedTasksCount);
          setReportsJobCompleted(responses[1].data.completedTasksCount);
          setReportsJobCanceled(responses[2].data.canceledTasksCount);
          setReportsJobTasks(responses[3].data.totalTasksCount);
          setReportsTotalSalary(responses[4].data.totalSalary);
          setReportsTasksCompleted(responses[5].data.percentage);
          setTotalUsersCount(responses[6].data.totalUsersCount);
          setTotalJobsCount(responses[7].data.totalJobsCount);
          setIsLoading(false);
        } catch (error) {
          setIsLoading(false);
          console.error("Error fetching data:", error);
        } finally {
          setIsLoading(false); // Stop loading
        }
      };

      fetchReports();
    }
       
      
  }, [userId]);


   if(isLoading){
    <LoadingSpinner />
   }
   
  return ( 
    <div className="bg-gray-100 p-4 min-h-screen space-y-6">

 
      
    {userId && user.role === "1" ? (
      <>
        <ConfirmedTasks />
        {/* Statistics Overview for Role 3 */}
        <section>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-lg shadow-lg text-center">
              <AiOutlineCheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <p className="text-xl font-bold">{tasksReportsCompleted}%</p>
              <p className="text-sm text-gray-600">Tasks Completed</p>
            </div>
            <Link to="/total-confirmed-tasks">
              <div className="bg-white p-4 rounded-lg shadow-lg text-center">
                <FiActivity className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                <p className="text-xl font-bold">{jobReportsAssignments} Active</p>
                <p className="text-sm text-gray-600">Current Jobs</p>
              </div>
            </Link>
          </div>
        </section>
        <section>
          <div className="grid md:grid-cols-2 grid-cols-1 gap-4">
       
              <div className="bg-white p-4 rounded-lg shadow-lg text-center">
                <FiArchive className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <p className="text-xl font-bold">{jobsReportsCompleted} Completed</p>
                <p className="text-sm text-gray-600">Completed Jobs</p>
              </div>
       
              <div className="bg-white p-4 rounded-lg shadow-lg text-center">
                <FiPenTool className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                <p className="text-xl font-bold">{isReportsTasks} Available</p>
                <p className="text-sm text-gray-600">Available Jobs</p>
              </div>
         
              <div className="bg-white p-4 rounded-lg shadow-lg text-center">
                <FiDelete className="w-8 h-8 text-red-500 mx-auto mb-2" />
                <p className="text-xl font-bold">{tasksReportsCanceled} Cancelled</p>
                <p className="text-sm text-gray-600">Cancelled Jobs</p>
              </div>
        
              <div className="bg-white p-4 rounded-lg shadow-lg text-center">
                <FiUser className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <p className="text-xl font-bold">{isTotalUsers} Users</p>
                <p className="text-sm text-gray-600">Total Users</p>
              </div>
            
            <div className="bg-white p-4 rounded-lg shadow-lg text-center">
              <FiDollarSign className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <p className="text-xl font-bold">
                {new Intl.NumberFormat('en-ET', { style: 'currency', currency: 'ETB' }).format(isTotalReportsSalary)}
              </p>
              <p className="text-sm text-gray-600">Total Salary</p>
            </div>
            <Link to="/total-completed-tasks">
            <div className="bg-white p-4 rounded-lg shadow-lg text-center">
              <FiPocket className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <p className="text-xl font-bold">
                {isTotalJobs}
              </p>
              <p className="text-sm text-gray-600">Total Jobs</p>
            </div>     </Link>
          </div>
        </section>
      </>
    ) : (
      <>
        <ConfirmedTasks />
        {/* Statistics Overview for Other Roles */}
        <section>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-lg shadow-lg text-center">
              <AiOutlineCheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <p className="text-xl font-bold">{tasksCompleted}%</p>
              <p className="text-sm text-gray-600">Tasks Completed</p>
            </div>
            <Link to="/confirmed-tasks">
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
            <Link to="/completed-tasks">
              <div className="bg-white p-4 rounded-lg shadow-lg text-center">
                <FiArchive className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <p className="text-xl font-bold">{completedJobs.length} Completed</p>
                <p className="text-sm text-gray-600">Completed Jobs</p>
              </div>
            </Link>
            <Link to="/tasks">
              <div className="bg-white p-4 rounded-lg shadow-lg text-center">
                <FiPenTool className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                <p className="text-xl font-bold">{isTasks.length} Available</p>
                <p className="text-sm text-gray-600">Available Jobs</p>
              </div>
            </Link>
            <Link to="/cancel-tasks">
              <div className="bg-white p-4 rounded-lg shadow-lg text-center">
                <FiDelete className="w-8 h-8 text-red-500 mx-auto mb-2" />
                <p className="text-xl font-bold">{canceledJobs.length} Cancelled</p>
                <p className="text-sm text-gray-600">Cancelled Jobs</p>
              </div>
            </Link>

            <div className="bg-white p-4 rounded-lg shadow-lg text-center">
              <FiDollarSign className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <p className="text-xl font-bold">
                {new Intl.NumberFormat('en-ET', { style: 'currency', currency: 'ETB' }).format(isTotalSalary)}
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
