import React, { useEffect, useState } from 'react';
import Modal from '../Components/Modal';
import axiosClient from '../axiosClient';
import { AiOutlineInfoCircle, AiOutlineCheckCircle, AiOutlineClockCircle } from "react-icons/ai";
import { FiActivity, FiBell, FiClipboard } from "react-icons/fi";
import LoadingSpinner from '../Components/LoadingSpiner';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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
const notify = () => {
    toast.success('Success! This is a success notification!', {
      position: "top-right",
      autoClose: 3000,
    });
  };
  
  
const StaticTaskList = () => {
    const [tasks, setTasks] = useState([]);
    const [viewingTaskId, setViewingTaskId] = useState({ });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [isLoading, setILoading] = useState(false);
    const [user, setUser] = useState(null);
    const [userId, setUserId] = useState(null);    
     const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
 
     const [newTask, setNewTask] = useState({ });
    const [confirmData, setConfirmData] = useState({
        departureLocation: '',
        dispatchTime: '',
        eta: '',
        driver: '',
    });
    useEffect(() => {
        const token = localStorage.getItem('token'); // Assuming you stored your JWT in local storage
  
        if (token) {
            const decodedToken = parseJwt(token);
            setUserId(decodedToken.userId); // Assuming userId is a field in the token
            setUser(decodedToken.user); // Assuming userId is a field in the token
  
        }
  
        fetchTasks()
 
        
    }, [userId]); // Re-fetch tasks when userId changes
    
    const fetchTasks = async () => {
        if (userId) {
            try {
                setILoading(true)
                const response = await axiosClient.get(`/tasks/${userId}`);
                setILoading(false)

                setTasks(response.data.data); // Accessing the data field
            } catch (error) {
                console.error('Error fetching tasks:', error);
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
        setViewingTaskId(taskId);  // Set the task ID for the confirmation modal
        setIsConfirmModalOpen(true);  // Open the confirmation modal
    };
    // const handleConfirm = async (taskId) => {
    //     // Show a confirmation alert
    //     const isConfirmed = window.confirm("Are you sure you want to confirm this task?");
    //     if (isConfirmed) {
    //         try {
    //             // Make the API request to update the status in the database
    //             const response = await axiosClient.put(`/tasks/${taskId}/status`, { status: "1" , userId:userId, ...confirmData});
    //             if (response.data.success) {
    //                 // Update local state if the API request was successful
    //                 console.log(response.data.data.token)
    //                 localStorage.setItem('token', response.data.data.token)
    //                 const updatedTasks = tasks.map(task => 
    //                     task.id === taskId ? { ...task, status: response.data.data.data.status } : task
    //                 );
                    
    //                 // const updatedTasks =  response.data.data.data;
    //                 setTasks(updatedTasks);
    //             }
    //         } catch (error) {
    //             console.error('Error updating task status:', error);
    //             // Optionally, you could show an error message to the user here
    //         } finally {
    //             setIsModalOpen(false); // Close the modal regardless of success or error
    //         }
    //     }
    // };
    const handleConfirmSubmit = async () => {
        setILoading(true)

        try {
            const response = await axiosClient.put(`/tasks/${viewingTaskId}/status`, {
                status: "3",
                userId,
                chat_id:user.chat_id,
                ...confirmData, // Include the additional data from the form
            });
            
            if (response.data.data.success) {

             
                localStorage.setItem('token', response.data.data.token);
                setILoading(false)
                setIsModalOpen(false)
                fetchTasks()
                const updatedTasks = tasks.map(task => 
                    task.id === viewingTaskId ? { ...task, status: response.data.data.data.status } : task
                );
                setTasks(updatedTasks);
                setConfirmData({})
            } 
            console.log(response.data.data.success)
            if(!response.data.data.status){

                toast.error(response.data.data.message, {
                    position: "top-right",
                    autoClose: 3000,
                  });
               // toast.success(res.data.data.message);
               setConfirmData({})

            }else{
                toast.success(response.data.data.message, {
                    position: "top-right",
                    autoClose: 3000,
                  });
                 
                 setConfirmData({})
            }
        } catch (error) {
            console.error('Error updating task status:', error);
        } finally {
            setIsConfirmModalOpen(false);
            setIsModalOpen(false)
            setILoading(false)     
           setConfirmData({})

        }
    };
    const handleCancel = async (taskId) => {
     
        setViewingTaskId(taskId);  // Set the task ID for the confirmation modal
        setIsCancelModalOpen(true);  // Open the confirmation modal
    };
    const handleCancelDataChange = (e) => {
        setConfirmData({
            ...confirmData,
            [e.target.name]: e.target.value,
        });
    };
    const handleCancelSubmit = async (taskId) => {
        // Show a confirmation alert
        const isConfirmed = window.confirm("Are you sure you want to confirm this task?");
        if (isConfirmed) {
            try {
                setILoading(true)
                // Make the API request to update the status in the database
                const response = await axiosClient.put(`/reject-tasks/${viewingTaskId}/status`, { status: "0" , userId:userId,...confirmData,data:newTask});
              
           
                if (response.data.data.success) {
                    // Update local state if the API request was successful
                  
                    localStorage.setItem('token', response.data.data.token)
                  
                    const updatedTasks = tasks.map(task => 
                        task.id === taskId ? { ...task, status: response.data.data.data.status } : task
                    );
                    setILoading(false)
                    setIsCancelModalOpen(false)
                    setIsModalOpen(false)
                    fetchTasks()
                    // const updatedTasks =  response.data.data.data;
                    setTasks(updatedTasks);
                }

                if(!response.data.data.status){

                    toast.error(response.data.data.message, {
                        position: "top-right",
                        autoClose: 3000,
                      });
                   // toast.success(res.data.data.message);
                   setConfirmData({})
    
                }else{
                    toast.success(response.data.data.message, {
                        position: "top-right",
                        autoClose: 3000,
                      });
                     
                     setConfirmData({})
                }
            } catch (error) {
                console.error('Error updating task status:', error);
                 setILoading(false)
                // Optionally, you could show an error message to the user here
            } finally {
                setILoading(false)

                setIsModalOpen(false); // Close the modal regardless of success or error
            }
        }
    };

    const viewDetails = (task) => {
        setNewTask(task)
        setViewingTaskId(task);
        setIsModalOpen(true);
        fetchTasks()
    };
    const handleConfirmDataChange = (e) => {
        setConfirmData({
            ...confirmData,
            [e.target.name]: e.target.value,
        });
    };
    //const currentTask = tasks.find(task => task.id === viewingTaskId);

    return (
        <div className="p-4">
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
 

      {isLoading && <LoadingSpinner />}
            <section>
            <h2 className="text-lg font-semibold text-gray-700 mb-3">You Have  <strong className='text-red-500'>{tasks.length} </strong> Available Job/s</h2>
            {!isLoading && (
            <div className="space-y-4">
          {tasks.map((task) => (
            <div key={task.id} className="bg-white p-4 rounded-lg shadow-lg flex items-center justify-between">
              <div>
                <h3 className="text-md font-bold">{task.title}</h3>
                <p className="text-sm text-gray-500">{task.location}</p>
                <div className="mt-2 flex items-center space-x-2">
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      task.urgency === "High" ? "bg-red-100 text-red-600" : "bg-yellow-100 text-yellow-600"
                    }`}
                  >
                    {task.urgency} Priority
                  </span>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      task.status === "1"  ? "bg-blue-100 text-blue-600" : "bg-gray-200 text-gray-600"
                    }`}
                  >
                {task.status  === "1" ? "Pending" : " "}
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
            {viewingTaskId   && (
                <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
                    <h3 className="text-lg font-bold mb-2">{viewingTaskId.title}</h3>
                    <p className="mb-2"><strong>Description:</strong> {viewingTaskId.description}</p>
                    <p className="mb-2"><strong>Company:</strong> {viewingTaskId.company}</p>
                    <p className="mb-2"><strong>Location:</strong> {viewingTaskId.location}</p>
                    {/* <p className="mb-2"><strong>Salary:</strong> ${viewingTaskId.salary}</p> */}
                    <p className="mb-2"><strong>Reference:</strong> {viewingTaskId.Reference}</p>
                    <p className="mb-2"><strong>Phone:</strong> {viewingTaskId.phone}</p>
                   <p className="mb-2"><strong>Status:</strong> {viewingTaskId.status  === "3" ? "Confirmed" : "Pending"}</p>

                    <div>
                        <button
                            className="bg-green-500 text-white px-2 py-1 rounded mr-2"
                            onClick={() => handleConfirm(viewingTaskId.id)}
                            disabled={viewingTaskId.status === '2' }
                        >
                            Confirm
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
 
      
      <ToastContainer /> 
  
{isConfirmModalOpen && (
                <Modal isOpen={isConfirmModalOpen} onClose={() => setIsConfirmModalOpen(false)}>
                    <h3 className="text-lg font-bold mb-2">Confirm Task</h3>
                    <div>
                        <label className="block mb-1">Departure Location</label>
                        <input type="text" name="departureLocation" value={confirmData.departureLocation} onChange={handleConfirmDataChange} className="border p-2 w-full" />
                    </div>
                    <div>
                        <label className="block mb-1">Dispatch Time</label>
                        <input type="time" name="dispatchTime" value={confirmData.dispatchTime} onChange={handleConfirmDataChange} className="border p-2 w-full" />
                    </div>
                    <div>
                        <label className="block mb-1">ETA</label>
                        <input type="time" name="eta" value={confirmData.eta} onChange={handleConfirmDataChange} className="border p-2 w-full" />
                    </div>
                    <div>
                        <label className="block mb-1">Driver</label>
                        <input type="text" name="driver" value={confirmData.driver} onChange={handleConfirmDataChange} className="border p-2 w-full" />
                    </div>
                    <button disabled={isLoading} className="bg-green-500 text-white px-4 py-2 mt-3 rounded" onClick={handleConfirmSubmit}>
                        Submit Confirmation
                    </button>
                </Modal>
            )}


{isCancelModalOpen && (
                <Modal isOpen={isCancelModalOpen} onClose={() => setIsCancelModalOpen(false)}>
                    <h3 className="text-lg font-bold mb-2">Cancel Task</h3>
                    <div>
                        <label className="block mb-1">Description</label>
                        <textarea type="text" name="description" value={confirmData.description} onChange={handleCancelDataChange} className="border p-2 w-full" />
                    </div>
             
                    <button className="bg-green-500 text-white px-4 py-2 mt-3 rounded" onClick={handleCancelSubmit}>
                        Submit Confirmation
                    </button>
                </Modal>
            )}
        </div>
    );
};

export default StaticTaskList;
