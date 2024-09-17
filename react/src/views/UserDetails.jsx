import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axiosClient from '../axiosClient';
import LoadingSpinner from "../Components/LoadingSpiner";
import { useNavigate } from 'react-router-dom';
 import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import axios from 'axios';
import MapComponent from '../Components/MapComponent';

const UserDetails = () => {
  const { userId } = useParams(); // Extract the userId from the URL
 
    const [technicians, setTechnicians] = useState([]);
    const [expandedRows, setExpandedRows] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [description, setDescription] = useState('');
    const [chatId, setchatId] = useState(null);
    const [sentData, setSentData] = useState(null);
  // State to track the checkbox value
  const [isChecked, setIsChecked] = useState(false);
  const [skillsOptions, setSkillsOptions] = useState([]);

  // Function to handle checkbox change
  const handleCheckboxChange = (event) => {
    setIsChecked(event.target.checked);
  };
 const handleSendMessage = async (jobDetails) => {
       console.log(jobDetails)
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
  <b>Status:</b> ${jobDetails.status === '1' ? 'In Progress 🟢' :jobDetails.status === '2' ? 'Completed 🔵':jobDetails.status === '3' ? 'Confirmed 🟡' : 'Cancelled 🔴'}\n
   
  <b>First Name:</b> ${sentData.firstName}\n
  <b>Last Name:</b> ${sentData.lastName}\n
  <b>Phone:</b> ${sentData.phone}\n
  <b>Email:</b> ${sentData.email}\n
  <b>Username:</b> @${sentData.username}\n
  
  <b>Created At:</b> ${new Date(jobDetails.created_at).toLocaleString()}
  <b>Updated At:</b> ${new Date(jobDetails.updated_at).toLocaleString()}
      `;
 
         // Example of sending a message with an inline keyboard
        
     // Attach job ID to the callback data for each button
     const inlineButtons = [
       [
         { text: 'Approve', callback_data: `approveJob_${jobDetails.id}_${sentData.id}` },
         { text: 'Reject', callback_data: `rejectJob_${jobDetails.id}_${sentData.id}` }
       ],
       [
         { text: 'View Map', url: mapUrl }
     ]
     ];
      
 
     const token = '6685274704:AAFR-NXKCnfe7RZy9tGq5Swn2A0tDkTsrBU'; // Your bot token
if(isChecked){
  
     // Telegram message payload
     const telegramMessage = {
      chat_id: chatId,
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
  
      
    } catch (error) {
      console.error('Failed to send message to Telegram:', error);
    }
 
}

      await  axios.post(`https://api.telegram.org/bot${token}/sendMessage`, {
            chat_id: chatId,
            text: description
        })
        .then(response => {
            console.log('Message sent:', response.data);
            setDescription(''); // Clear the input field
            setIsModalVisible(false); // Close the modal
        })
        .catch(error => {
            console.error('Error sending message:', error);
        });
    };
  // const navigate = useNavigate();
  
  useEffect(() => {
    axiosClient.get(`/users-registration/${userId}`)
      .then(response => {
        // setTechnicians([response.data]);
        setchatId(response.data.chat_id);
        setSentData(response.data);
        // JSON.parse(skillsJsonString)
       console.log(response.data)
        const item = response.data;
        const parsedSkills = JSON.parse(item.skills || '[]'); // Fallback to empty array if skills is undefined
        const skillNames = parsedSkills.map(skill => skill.name).join(', ');

        const processedData = {
          ...item,
          skillsOptions: skillNames
        };

        setTechnicians([processedData]);
    console.log(processedData)
      })
      .catch(error => {
        console.error('There was an error fetching the user details!', error);
      });
  }, [userId]);
  
  if (!technicians) {
    return <div><LoadingSpinner /></div>;
  }
  
// Status mapping with colors
const statusStyles = {
  1: 'text-yellow-500 bg-yellow-100',   // In Progress
  2: 'text-green-500 bg-green-100',     // Completed
  0: 'text-red-500 bg-red-100',          // Canceled
  3: 'text-blue-500 bg-blue-100'         // Confirmed
};
const avaStyles = {
   1: 'text-green-500 bg-green-100',     // Completed
  0: 'text-red-500 bg-red-100',          // Canceled
 };
 // Status cell renderer with color
 const statusBodyTemplate = (rowData) => {
  const status = rowData.status;
  const statusText = {
      1: 'In Progress',
      2: 'Completed',
      0: 'Cancelled',
      3: 'Confirmed'
  }[status] || 'Unknown';

  const styleClass = statusStyles[status] || 'text-gray-500 bg-gray-100';

  return (
      <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${styleClass}`}>
          {statusText}
      </span>
  );
};

const statusAvailability = (rowData) => {
  const availability = rowData.availability;
  const statusText = {
      1: 'Available',
      0: 'Unavailable',
  
  }[availability] || 'Unknown';

  const styleClass = avaStyles[availability] || 'text-gray-500 bg-gray-100';

  return (
      <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${styleClass}`}>
          {statusText}
      </span>
  );
};
const countJobsByStatus = (jobs, status) => {
  if (!Array.isArray(jobs)) {
      console.error("Invalid jobs data");
      return 0;
  }

  return jobs.filter(job => job.status === status).length;
};

// Define the template for the description column
const descriptionBodyTemplate = (rowData) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleDescription = () => {
    setIsExpanded(!isExpanded);
  };

  const maxLength = 50; // Max length before truncating the description
  const description = rowData.description;

  return (
    <div>
      {isExpanded || description.length <= maxLength
        ? description
        : description.substring(0, maxLength) + '...'}
      {description.length > maxLength && (
        <span
          onClick={toggleDescription}
          style={{ color: 'blue', cursor: 'pointer' }}
        >
          {isExpanded ? ' Show Less' : ' Read More'}
        </span>
      )}
    </div>
  );
};
  const jobTechniciansTemplate = (job) => {
     // Status cell renderer
  


    return (
      job.job_technicians && (
        <div className="bg-gray-100 shadow-md rounded-lg p-6 mb-6">
<div className="flex items-center justify-between mb-4">
            <h5 className="text-xl font-semibold text-gray-800">
                Job Technicians for Job: <span className="text-indigo-600">{job.title}</span>
            </h5>
            <button
                    className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition duration-300"
                    onClick={() => setIsModalVisible(true)}
                >
                    Send Message
                </button>

            {isModalVisible && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm mx-auto">
                        <h3 className="text-lg font-semibold mb-4">Enter Description</h3>
                        <textarea
                            className="w-full p-2 border border-gray-300 rounded mb-4"
                            rows="4"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        ></textarea>
                       <div className="flex items-center mb-4">
                       <label className="text-gray-700 flex items-center">Send Job</label>

  <input
    type="checkbox"
    checked={isChecked}
    onChange={handleCheckboxChange}
    className="mr-2 h-5 w-5 text-indigo-600 mt-3 focus:ring-indigo-500 border-gray-300 rounded"
  />
</div>

                        <div className="flex justify-end space-x-2">
                            <button
                                className="px-4 py-2 bg-gray-500 text-white font-semibold rounded-lg hover:bg-gray-600"
                                onClick={() => setIsModalVisible(false)}
                            >
                                Cancel
                            </button>
                            <button
    className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700"
    onClick={() => handleSendMessage(job)} // Pass an anonymous function here
>
    Submit
</button>

                        </div>
                    </div>
                </div>
            )}
        </div>        <div className="overflow-x-auto">
        {/* <pre>{JSON.stringify(job.job_technicians, null, 2)};
        </pre> */}
        <DataTable value={job.job_technicians} className="p-datatable-striped">
      <Column field="chat_id" header="Chat Id" />
      <Column field="departureLocation" header="Departure Location" />
      <Column field="dispatchTime" header="Dispatch Time" />
      <Column field="eta" header="ETA" />
      <Column field="description" header="Description" body={descriptionBodyTemplate} />
      <Column field="status" header="Status" body={statusBodyTemplate} />
    </DataTable>
        </div>
    </div>
    
      )
    );
};

const rowExpansionTemplate = (data) => {
 // Count jobs with status "2" (Completed)
 const completedJobsCount = countJobsByStatus(data.jobs, "2");
 // Count jobs with status "1" (In Progress)
 const inProgressJobsCount = countJobsByStatus(data.jobs, "1");
 // Count jobs with status "0" (Cancelled)
 const cancelledJobsCount = countJobsByStatus(data.jobs, "0");
 // Count jobs with status "3" (Confirmed)
 const confirmedJobsCount = countJobsByStatus(data.jobs, "3");

 
  return (
    data.jobs && (
        <div className="job-list">
           <div className="p-4">
            <h5 className="text-lg font-semibold">Jobs Count by Status</h5>
            <ul className="list-disc pl-5">
            <li>Total Jobs: {data.jobs.length}</li>

                <li>Completed: {completedJobsCount}</li>
                <li>In Progress: {inProgressJobsCount}</li>
                <li>Cancelled: {cancelledJobsCount}</li>
                <li>Confirmed: {confirmedJobsCount}</li>
            </ul>
        </div>
        

            <DataTable value={data.jobs} className="table w-full" expandedRows={expandedRows} onRowToggle={(e) => setExpandedRows(e.data)}
                rowExpansionTemplate={jobTechniciansTemplate} dataKey="id">
               <Column field="id" header="Job Id"></Column>
               <Column field="Reference" header="Job reference"></Column>
                <Column field="title" header="Job Title"></Column>
                <Column field="company" header="Company"></Column>
                <Column field="location" header="Location"></Column>
                <Column field="salary" header="Salary"></Column>
                <Column field="description" header="Description"></Column>
                <Column field="status" header="Status" body={statusBodyTemplate} />

                <Column expander style={{ width: '3em' }} />
            </DataTable>
        </div>
    )
);

};

// Define row style based on availability
const rowClassName = (data) => {
    return {
        'row-available': data.availability === '1' ? "Available" : "Unavailable",
        'row-unavailable': data.availability === '0',
    };
};
                <Column field="status" header="Status" body={statusBodyTemplate} />

return (
   <>
   
   {/* <pre>{JSON.stringify(sentData, null, 2)};
   </pre> */}
  {sentData && (
    

<MapComponent
  latitude={parseFloat(sentData?.latitude?.toString() || "0")}
  longitude={parseFloat(sentData?.longitude?.toString() || "0")}
  firstName={sentData?.firstName || "Unknown"}
  lastName={sentData?.lastName || "Unknown"}
/>

    )}
  <div className="bg-white shadow-md rounded-lg p-6 mb-6">
      <DataTable
        value={technicians}
        expandedRows={expandedRows}
        onRowToggle={(e) => setExpandedRows(e.data)}
        rowExpansionTemplate={rowExpansionTemplate}
        dataKey="id"
        rowClassName={rowClassName}
        className="p-datatable-striped" // Optional: adds stripe rows effect
      >
        <Column expander style={{ width: '3em' }} />
        <Column field="firstName" header="First Name"></Column>
        <Column field="lastName" header="Last Name"></Column>
        <Column field="phone" header="Phone"></Column>
        <Column field="email" header="Email"></Column>
        <Column field="skillsOptions" header="Skills"></Column>
        <Column field="experience" header="Experience"></Column>
        <Column field="status" header="Status" />
        <Column field="availability" header="Availability" body={statusAvailability} />

      </DataTable>
    </div></>

);
};
 

export default UserDetails;





