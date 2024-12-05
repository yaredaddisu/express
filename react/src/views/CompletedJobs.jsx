import React, { useEffect, useState } from 'react';
import Modal from '../Components/Modal';
import axiosClient from '../axiosClient';
import { AiOutlineInfoCircle, AiOutlineCheckCircle, AiOutlineClockCircle } from "react-icons/ai";
import { FiActivity, FiBell, FiClipboard } from "react-icons/fi";
import LoadingSpinner from '../Components/LoadingSpiner';

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

const StaticTaskList = () => {
    const [tasks, setTasks] = useState([]);
    const [viewingTaskId, setViewingTaskId] = useState({ });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [userId, setUserId] = useState(null);
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token'); // Assuming you stored your JWT in local storage

        if (token) {
            const decodedToken = parseJwt(token);
            setUserId(decodedToken.userId); // Assuming userId is a field in the token
            setUser(decodedToken.user); // Assuming userId is a field in the token

        }

        
console.log("user", user)
        fetchTasks();
    }, [userId]); // Re-fetch tasks when userId changes
    
    const fetchTasks = async () => {
        setIsLoading(true)

        if (userId) {
            try {
                const response = await axiosClient.get(`/completed/${userId}`, 
                     { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
                setTasks(response.data.data); // Accessing the data field
                setIsLoading(false)

            } catch (error) {
                console.error('Error fetching tasks:', error);
            }finally{
                setIsLoading(false)

            }
        }
    };
    // const handleConfirm = (taskId) => {
    //     const updatedTasks = tasks.map(task => 
    //         task.id === taskId ? { ...task, status: 'Confirmed' } : task
    //     );
    //     setTasks(updatedTasks);
    //     setIsModalOpen(false);
    // };
    const handleConfirm = async (taskId) => {
        // Show a confirmation alert
        const isConfirmed = window.confirm("Are you sure you want to confirm this task?");
        if (isConfirmed) {
            setIsLoading(true)

            try {
                // Make the API request to update the status in the database
                const response = await axiosClient.put(`/confirmed-tasks/${taskId}/status`, { status: "2" , userId:userId});
                if (response.data.data.success) {

                    // Update local state if the API request was successful
                
                        localStorage.setItem('token', response.data.data.token)
                     
                    const updatedTasks = tasks.map(task => 
                        task.id === taskId ? { ...task, status: response.data.data.data.status } : task
                    );
                    fetchTasks();
                    // const updatedTasks =  response.data.data.data;
                    setTasks(updatedTasks);
                }
            } catch (error) {
                console.error('Error updating task status:', error);
                // Optionally, you could show an error message to the user here
            } finally {
                setIsModalOpen(false); // Close the modal regardless of success or error
                setIsLoading(false)
                fetchTasks();
            }
        }
    };
    
    const handleCancel = (taskId) => {
        const updatedTasks = tasks.map(task => 
            task.id === taskId ? { ...task, status: 'Canceled' } : task
        );
        setTasks(updatedTasks);
        setIsModalOpen(false);
    };

    const viewDetails = (task) => {
        setViewingTaskId(task);
        setIsModalOpen(true);
        fetchTasks()
    };

    //const currentTask = tasks.find(task => task.id === viewingTaskId);

    return (
        <div className="p-4 my-10">
             {/* <ul className="space-y-2">
                {tasks.map(task => (
                    <li key={task.id} className="flex justify-between items-center bg-white p-2 rounded shadow">
                        <span>{task.title} - <strong>{task.status  === "2" ? "Confirmed" : "Pending"}</strong></span>
                        <button
                            className="bg-blue-500 text-white px-2 py-1 rounded"
                            onClick={() => viewDetails(task)}
                        >
                            View Details
                        </button>
                    </li>
                ))}
            </ul> */}

            <section>
         
      <h2 className="text-lg font-semibold text-gray-700 mb-3">You Have  <strong className='text-red-500'>{tasks.length} </strong> Completed Job/s</h2>
      {isLoading && <LoadingSpinner />}

{!isLoading && (
      <div className="space-y-4">
          {tasks.map((task) => (
            <div key={task.id} className="bg-sky-500 p-4 rounded-lg shadow-lg flex items-center justify-between">
              <div>
                <h3 className="text-md text-white font-bold">{task.title}</h3>
                <p className="text-sm text-white text-gray-500">{task.location}</p>
                <div className="mt-2 flex items-center space-x-2">
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      task.urgency === "High" ? "bg-red-100 text-red-600" : "bg-red-100 text-yellow-600"
                    }`}
                  >
                    {task.urgency} High
                  </span>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      task.status === "1"  ? "bg-blue-100 text-blue-600" : "bg-gray-200 text-gray-600"
                    }`}
                  >
                {task.status  === "1" ? "In Progress" : "Completed"}
                  </span>
                </div>
              </div>
              <AiOutlineClockCircle className="text-gray-400 w-5 h-5" />
              <button
                            className="bg-blue-500 text-white px-2 py-1 rounded"
                            onClick={() => viewDetails(task)}
                        >
                            View Details
                        </button>
            </div>
          ))}
        </div>
)}
      </section>
            {viewingTaskId.status   && (
                <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
                    <h3 className="text-lg font-bold mb-2">{viewingTaskId.title}</h3>
                    <p className="mb-2"><strong>Description:</strong> {viewingTaskId.description}</p>
                    <p className="mb-2"><strong>Company:</strong> {viewingTaskId.company}</p>
                    <p className="mb-2"><strong>Location:</strong> {viewingTaskId.location}</p>
                    <p className="text-xl font-bold">Salary: {new Intl.NumberFormat('en-ET', { style: 'currency', currency: 'ETB' }).format(viewingTaskId.salary)}</p>
                    <p className="mb-2"><strong>Reference:</strong> {viewingTaskId.Reference}</p>
                    <p className="mb-2"><strong>Phone:</strong> {viewingTaskId.phone}</p>
                   <p className="mb-2"><strong>Status:</strong> {viewingTaskId.status  === "2" ? "Completed" : "Pending"}</p>

  {/* Additional details */}
  <p className="mb-2"><strong>Departure Location:</strong> {viewingTaskId.departureLocation || "Not specified"}</p>
  <p className="mb-2"><strong>Dispatch Time:</strong> {viewingTaskId.dispatchTime ?  viewingTaskId.dispatchTime  : "Pending"}</p>
  <p className="mb-2"><strong>ETA:</strong> {viewingTaskId.eta ?  viewingTaskId.eta : "Pending"}</p>
                <p className="mb-2"><strong>Description:</strong> {viewingTaskId.technicianDescription || "Not assigned"}</p>

                    <div className={`${viewingTaskId.status === '2' ? 'hidden' : ' '}`}>
                        <button
                            className="bg-green-500 text-white px-2 py-1 rounded mr-2"
                            onClick={() => handleConfirm(viewingTaskId.id)}
                            disabled={viewingTaskId.status === '2'}
                        >
                            Complete
                        </button>
                        <button
                            className="bg-red-500 text-white px-2 py-1 rounded"
                            onClick={() => handleCancel(viewingTaskId.id)}
                            disabled={viewingTaskId.status === '2'}
                        >
                            Cancel
                        </button>
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default StaticTaskList;
