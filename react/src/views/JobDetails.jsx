import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axiosClient from '../axiosClient';
import LoadingSpinner from "../Components/LoadingSpiner";

const JobDetails = () => {
  const { jobId } = useParams(); // Extract the jobId from the URL
  const [job, setJob] = useState(null);
  const [skills, setSkills] = useState([]);

  useEffect(() => {
    axiosClient.get(`/jobs/${jobId}`)
      .then(response => {
        setJob(response.data);

        // Parse the skills JSON string into an array
        try {
          const parsedSkills = JSON.parse(response.data.skills);
          if (Array.isArray(parsedSkills)) {
            setSkills(parsedSkills);
          }
        } catch (error) {
          console.error('Error parsing skills JSON:', error);
        }
      })
      .catch(error => {
        console.error('There was an error fetching the job details!', error);
      });
  }, [jobId]);

  if (!job) {
    return <div><LoadingSpinner /></div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white shadow-lg rounded-lg border border-gray-200 p-6">
        <h1 className="text-3xl font-bold text-blue-800 mb-4">{job.title}</h1>
        <p className="text-gray-600">
          <span className="font-bold">Job Reference: {job.Reference}</span>
        </p>
        <p className="text-gray-600">
  <span className="font-bold">
    Created At: {new Date(job.created_at).toLocaleDateString('en-US', {
      weekday: 'short',   // Short weekday (e.g., Mon)
      day: 'numeric',     // Day of the month (e.g., 5)
      month: 'numeric',   // Month as number (e.g., 11)
      year: '2-digit'     // Last two digits of year (e.g., 24)
    })}
  </span>
</p>
<p className="text-gray-600">
  <span className="font-bold">
    Updated At: {new Date(job.updated_at).toLocaleDateString('en-US', {
      weekday: 'short',
      day: 'numeric',
      month: 'numeric',
      year: '2-digit'
    })}
  </span>
</p>

        <p className="text-gray-700 mb-6">Description: {job.description}</p>
        <div className="space-y-4">
          <p className="text-gray-600">
            <span className="font-medium">Company:</span> {job.company}
          </p>
          <p className="text-gray-600">
            <span className="font-medium">Location:</span> {job.location}
          </p>
          <p className="text-gray-600">
            <span className="font-medium">Salary:</span>
            {job.salary ? `ETB ${job.salary}` : 'Not provided'}
          </p>
          <p className={`font-medium ${
            job.jobs_status === '1' ? 'text-green-600' :
            job.jobs_status === '3' ? 'text-yellow-600' :
            job.jobs_status === '2' ? 'text-blue-600' : 'text-red-600'
          }`}>
            Job Status: {job.jobs_status === '3' ? 'Confirmed and In Progress' :
                          job.jobs_status === '2' ? 'Completed' :
                          job.jobs_status === '1' ? 'Open' : 'Closed'}
          </p>
          <p className={`font-medium ${
            job.job_technician_status === '2' ? 'text-green-600' :
            job.job_technician_status === '1' ? 'text-yellow-600' : 'text-red-600'
          }`}>
            Order Status: {job.job_technician_status === '2' ? 'Completed' :
                             job.job_technician_status === '1' ? 'In Progress' : 'Not Confirmed'}
          </p>
          {job.job_order_id && (
            <p className="text-gray-600">
              <span className="font-medium">Job Order ID:</span>
              <Link 
                to={`/order-by-slug/${job.job_order_id}`} 
                className="text-blue-600 hover:underline ml-2"
              >
                View This Job Order
              </Link>
            </p>
          )}
          <p className="text-gray-600">
            <span className="font-medium">Departure Location:</span> {job.departureLocation}
          </p>
          <p className="text-gray-600">
            <span className="font-medium">Dispatch Time:</span> {job.dispatchTime === "0000-00-00 00:00:00" ? "Not provided" : job.dispatchTime}
          </p>
          <p className="text-gray-600">
            <span className="font-medium">ETA:</span> {job.eta === "0000-00-00 00:00:00" ? "Not provided" : job.eta}
          </p>
          <p className="text-gray-600">
            <span className="font-medium">Driver:</span> {job.driver}
          </p>
        </div>
        <div className="bg-gray-100 mt-6 p-4 rounded-lg">
          <h2 className="text-2xl font-bold text-blue-800 mb-4">User Details</h2>
          <p className="text-gray-600">
            <span className="font-medium">Name:</span> {job.firstName} {job.lastName}
          </p>
          <p className="text-gray-600">
            <span className="font-medium">Phone:</span> {job.phone}
          </p>
          <p className="text-gray-600">
            <span className="font-medium">Email:</span> {job.email}
          </p>
          {skills.length > 0 ? (
            <div className="mb-4">
              <p className="text-gray-700 font-medium">Skills:</p>
              <ul className="list-disc pl-5">
                {skills.map((skill) => (
                  <li key={skill.id} className="text-gray-900">{skill.name}</li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-gray-600">No skills provided.</p>
          )}
          <p className="text-gray-600">
            <span className="font-medium">Experience:</span> {job.experience}
          </p>
          <p className="text-gray-600">
            <span className="font-medium">Username:</span> @{job.username}
          </p>
        </div>
      </div>
    </div>
  );
};

export default JobDetails;
