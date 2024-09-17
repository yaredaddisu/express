import React, { useState, useEffect } from 'react';
import axiosClient from '../axiosClient';
import { useNavigate } from 'react-router-dom';
import Modal from './Modal';
import JobForm from '../Components/CreateJob'; // Adjust path as necessary
import LoadingSpinner from './LoadingSpiner';

const JobList = () => {
  const [jobs, setJobs] = useState([]);
  const [jobData, setJob] = useState([]);
  const [loading, setLoading] = useState(false);

 

  useEffect(() => {
   
  
    fetchJobs();
  }, []);
  const fetchJobs = async () => {
    try {
      const response = await axiosClient.get('/jobs');
      const data = response.data.data; // Accessing data directly
      console.log(data)
      // Ensure data is an array
      setJobs(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      setJobs([]); // Handle the error case
    }
  };
  const navigate = useNavigate();

  const handleView = (jobId) => {
    navigate(`/jobs/${jobId}`);
  };
  const [isModalOpen, setIsModalOpen] = useState(false);
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const handleEdit = jobData => {
    setIsModalOpen(true);
    setJob(jobData)
//  console.log(user)
  }
  const handleDelete = async (jobId) => {
    try {
      await axiosClient.delete(`/jobs/${jobId}`);
      setJobs(jobs.filter(job => job.id !== jobId));
    } catch (error) {
      console.error('Error deleting job:', error);
    }
  };

  return (
    
    <div className="w-full mx-auto px-4 py-8">
       {loading && <LoadingSpinner/>}
       
             <Modal isOpen={isModalOpen} onClose={closeModal}    >
        <JobForm jobData={jobData} fetchJobs={fetchJobs}  onClose={closeModal}  />
      </Modal>
      <h1 className="text-3xl font-bold mb-6">Job Listings</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white shadow-lg rounded-lg border border-gray-200">
          <thead>
            <tr>
            <th className="text-left px-6 py-4 text-gray-900 font-semibold">Reference</th>
              <th className="text-left px-6 py-4 text-gray-900 font-semibold">Title</th>
              <th className="text-left px-6 py-4 text-gray-900 font-semibold">Description</th>
              <th className="text-left px-6 py-4 text-gray-900 font-semibold">Company</th>
              <th className="text-left px-6 py-4 text-gray-900 font-semibold">Location</th>
              <th className="text-left px-6 py-4 text-gray-900 font-semibold">Salary</th>
              <th className="text-left px-6 py-4 text-gray-900 font-semibold">Status</th>
              <th className="text-left px-6 py-4 text-gray-900 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((job) => (
              <tr key={job.id} className="border-t border-gray-200">
                 <td className="px-6 py-4 text-gray-900 font-medium">{job.Reference}</td>
                <td className="px-6 py-4 text-gray-900 font-medium">{job.title}</td>
                <td className="px-6 py-4 text-gray-700">{job.description}</td>
                <td className="px-6 py-4 text-gray-600">{job.company}</td>
                <td className="px-6 py-4 text-gray-600">{job.location}</td>
                <td className="px-6 py-4 text-gray-600">${job.salary}</td>
                <td className={`px-6 py-4 font-medium ${
                  job.status === '2' ? 'text-blue-600' :job.status === '1' ? 'text-green-600 ' : 'text-red-600'
                }`}>
                  {job.status === '2' ?  'Completed' : job.status === '1' ? 'Open' : 'Closed'}
                </td>
                <td className="px-6 py-4 flex space-x-2">
                  <button 
                    onClick={() => handleView(job.id)}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                  >
                    View
                  </button>
                  <button 
                    onClick={() => handleEdit(job)}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDelete(job.id)}
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default JobList;
