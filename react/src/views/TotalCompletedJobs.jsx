import React, { useEffect, useState } from 'react';
import axiosClient from '../axiosClient';
import LoadingSpinner from '../Components/LoadingSpiner';
import { DateRangePicker } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import * as XLSX from "xlsx";
const TotalCompletedJobs = () => {
    const [tasks, setTasks] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [isLoading, setIsLoading] = useState(false);
    const [filterByStatus, setFilterByStatus] = useState("");
    const [dateRange, setDateRange] = useState(null);
    const [showDateRangePicker, setShowDateRangePicker] = useState(false);
    const [selectedTasks, setSelectedTasks] = useState([]); // State for selected tasks

    const handleSelect = (ranges) => {
        setDateRange([ranges.selection]);
        console.log('Selected date range:', ranges.selection);
    };

    useEffect(() => {
        fetchTasks();
    }, [searchQuery, currentPage, pageSize, filterByStatus, dateRange]);

    const fetchTasks = async () => {
        setIsLoading(true);
        try {
            const response = await axiosClient.get(`/total-completed`, {
                params: {
                    page: currentPage,
                    pageSize,
                    search: searchQuery,
                    filterByStatus,
                    startDate: dateRange ? dateRange[0].startDate.toISOString() : "",
                    endDate: dateRange ? dateRange[0].endDate.toISOString() : ""
                },
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            setTasks(response.data.data);
        } catch (error) {
            console.error('Error fetching tasks:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearch = (e) => {
        setSearchQuery(e.target.value);
        setCurrentPage(1);
    };

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
    };

    const handlePageSizeChange = (e) => {
        setPageSize(Number(e.target.value));
        setCurrentPage(1);
    };

    // const handleFilterChange = (e) => {
    //     setFilterByStatus(e.target.value);
    //     setCurrentPage(1);
    // };
    const handleSelectTask = (taskId) => {
        setSelectedTasks((prev) =>
            prev.includes(taskId)
                ? prev.filter((id) => id !== taskId)
                : [...prev, taskId]
        );
    };
    const handleSelectAll = () => {
        setSelectedTasks(selectedTasks.length === tasks.length ? [] : tasks.map(task => task.id));
    };
 

    const handleExportSelectedExcel = () => {
        const selectedData = tasks.filter(task => selectedTasks.includes(task.id));
    
        // Function to format dates to d/m/y
        const formatDate = (dateString) => {
            const date = new Date(dateString);
            const day = String(date.getDate()).padStart(2, '0'); // Add leading zero if needed
            const month = String(date.getMonth() + 1).padStart(2, '0'); // Add leading zero if needed
            const year = date.getFullYear();
            return `${year}/${month}/${day}`;
        };
    
        // Prepare data for tasks
        const taskData = [
            [
             "Id",  "Reference", "Title", "Company Phone", "Company", "Description", "Location", 
                "Salary", "Status", "Created At", "Updated At" , "User Id", "Technical Id", "Chat Id","Latitude", "Latitude"
            ], // Task headers
            ...selectedData.map(task => [
                task.id, 
                task.Reference, 
                task.title, 
                task.phone, 
                task.company, 
                task.description, 
                task.location, 
                task.salary, 
                // Map task status to its readable label
                task.status === "1" ? "In Progress" :
                task.status === "2" ? "Completed" :
                task.status === "3" ? "Confirmed" :
                task.status === "0" ? "Cancelled" : "Unknown",
                task.created_at,  
                task.updated_at,
                task.user_id, 
                task.technician_id, 
                task.chat_id, 
                task.latitude, 
                task.latitude, 

            ])
        ];
    
        // Prepare data for technician information
        const technicianData = [
            [
                "Technician Email", "Technician Name", "Technician Phone", "Technician Username"
            ], // Technician headers
            ...selectedData.map(task => [
                task.technician_email, 
                task.technician_name, 
                task.technician_phone, 
                task.technician_username
            ])
        ];
    
        // Create a workbook
        const wb = XLSX.utils.book_new();
    
        // Create task sheet and append to the workbook
        const taskSheet = XLSX.utils.aoa_to_sheet(taskData);
        XLSX.utils.book_append_sheet(wb, taskSheet, "Tasks");
    
        // Create technician sheet and append to the workbook
        const technicianSheet = XLSX.utils.aoa_to_sheet(technicianData);
        XLSX.utils.book_append_sheet(wb, technicianSheet, "Technicians");
    
        // Styling task headers (green and bold)
        const taskHeaderRange = XLSX.utils.decode_range(taskSheet["!ref"]);
        for (let C = taskHeaderRange.s.c; C <= taskHeaderRange.e.c; ++C) {
            const cellAddress = XLSX.utils.encode_cell({ r: 0, c: C });
            if (!taskSheet[cellAddress]) continue;
    
            taskSheet[cellAddress].s = { 
                font: { bold: true, color: { rgb: "008000" } } // Green color in HEX and bold font
            };
        }
    
        // Styling technician headers (green and bold)
        const technicianHeaderRange = XLSX.utils.decode_range(technicianSheet["!ref"]);
        for (let C = technicianHeaderRange.s.c; C <= technicianHeaderRange.e.c; ++C) {
            const cellAddress = XLSX.utils.encode_cell({ r: 0, c: C });
            if (!technicianSheet[cellAddress]) continue;
    
            technicianSheet[cellAddress].s = { 
                font: { bold: true, color: { rgb: "008000" } } // Green color in HEX and bold font
            };
        }
    
        // Export workbook to an Excel file
        XLSX.writeFile(wb, "selected_tasks.xlsx");
    };
    
    
     const [totalSalary, setTotalSalary] = useState(0);         // State for total salary

    // Function to handle the change in filter selection
    const handleFilterChange = (event) => {
        const status = event.target.value;
        setFilterByStatus(status);
        
        // Calculate total salary if "Completed" (status === "2") is selected
        if (status === "2") {
            const completedTasks = tasks.filter(task => task.status === "2");  // Filter tasks with "Completed" status
            const total = completedTasks.reduce((acc, task) => acc + task.salary, 0);  // Sum up the salary of completed tasks
            setTotalSalary(total);
        } else {
            setTotalSalary(0);  // Reset total salary if another status is selected
        }
        setCurrentPage(1);
    };

    
    const handleExportSelected = () => {
        const selectedData = tasks.filter(task => selectedTasks.includes(task.id));
        const headers = "Reference,Title,Chat ID,Company,Description,Location,Salary,Status";
        
        const csvContent = "data:text/csv;charset=utf-8," +
            headers + "\n" + // Add headers as the first row
            selectedData.map(task => 
                `${task.Reference},${task.title},${task.chat_id},${task.company},${task.description},${task.location},${task.salary},${task.status}`
            ).join("\n");
    
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "selected_tasks.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    

 
        const [file, setFile] = useState(null);
      
        const handleFileChange = (e) => {
          setFile(e.target.files[0]);
        };
      
        const handleFileUpload = async () => {
            if (!file) return;
        
            const reader = new FileReader();
            reader.onload = async (e) => {
              const data = new Uint8Array(e.target.result);
              const workbook = XLSX.read(data, { type: 'array' });
              const sheetName = workbook.SheetNames[0];
              const sheet = workbook.Sheets[sheetName];
              const jsonData = XLSX.utils.sheet_to_json(sheet);
        
              // Map the headers to new keys
              const transformedData = jsonData.map((row) => ({
                id: row["Id"],
                Reference: row["Reference"],
                title: row["Title"],
                phone: row["Company Phone"],
                company: row["Company"],
                description: row["Description"],
                location: row["Location"],
                salary: row["Salary"],
                status: row["Status"],
                created_at: row["Created At"],
                updated_at: row["Updated At"],
                user_id: row["User Id"],
                technician_id: row["Technical Id"],
                chat_id: row["Chat Id"],
                latitude: row["Latitude"],
                longitude: row["Longitude"],
              }));
        
              try {
                await axiosClient.post('/upload-excel', transformedData);
                fetchTasks()
                alert("File uploaded and processed successfully.");
              } catch (error) {
                console.error("Error uploading file:", error);
              }
            };
            reader.readAsArrayBuffer(file);
          };
        
     
    return (
        <div className="container mx-auto p-4">
            {/* Search & Filters */}
            <div className="mb-4 flex flex-col md:flex-row md:flex-wrap gap-2">
    <div className="flex w-full md:w-auto">
        <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={handleSearch}
            className="px-3 py-1 border border-gray-300 rounded-lg shadow-sm w-full md:w-48 lg:w-64 focus:outline-none focus:ring focus:ring-blue-200 text-sm"
        />
    </div>
    <div className="flex w-full md:w-auto">
        <select
            onChange={handlePageSizeChange}
            value={pageSize}
            className="px-2 py-1 border border-gray-300 rounded-lg shadow-sm w-full md:w-24 lg:w-28 focus:outline-none focus:ring focus:ring-blue-200 text-sm"
        >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
        </select>
    </div>
    <div className="flex w-full md:w-auto">
        <select
            onChange={handleFilterChange}
            value={filterByStatus}
            className="px-2 py-1 border border-gray-300 rounded-lg shadow-sm w-full md:w-32 lg:w-36 focus:outline-none focus:ring focus:ring-blue-200 text-sm"
        >
            <option value="">All</option>
            <option value="1">In Progress</option>
            <option value="2">Completed</option>
            <option value="3">Active</option>
            <option value="0">Cancelled</option>
        </select>
    </div>
    <div className="flex w-full md:w-auto">
        <button
            onClick={() => setShowDateRangePicker(!showDateRangePicker)}
            className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 shadow w-full md:w-auto text-sm"
        >
            {showDateRangePicker ? "Hide Date Range" : "Select Date Range"}
        </button>
    </div>
    <div className="flex w-full md:w-auto gap-2 items-center">
        <button
            onClick={handleExportSelectedExcel}
            className="px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 shadow text-sm"
        >
            Export to Excel
        </button>
        <input
            type="file"
            onChange={handleFileChange}
            accept=".xlsx, .xls"
            className="file:mr-3 file:py-1 file:px-2 file:rounded-lg file:border-0 file:text-sm file:bg-gray-200 file:text-gray-700 hover:file:bg-gray-300"
        />
        <button
            onClick={handleFileUpload}
            className="px-3 py-1 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 shadow text-sm"
        >
            Upload & Process Excel
        </button>
    </div>
</div>



            {/* Date Range Picker */}
            {showDateRangePicker && (
                <div className="mb-4">
                    <DateRangePicker
                        ranges={dateRange || [{ startDate: new Date(), endDate: new Date(), key: 'selection' }]}
                        onChange={handleSelect}
                        showMonthAndYearPickers
                        rangeColors={['#4caf50']}
                        moveRangeOnFirstSelection={false}
                    />
                </div>
            )}

            {/* Table */}
            {isLoading ? (
                <LoadingSpinner />
            ) : (
                <div className="overflow-auto">
                    <table className="min-w-full table-auto border-collapse shadow-md bg-white">
                        <thead>
                            <tr className="bg-gray-100 text-left">
                            <th className="px-4 py-2 border-b">
                                <input type="checkbox" checked={selectedTasks.length === tasks.length} onChange={handleSelectAll} />
                            </th>
                                <th className="px-4 py-2 border-b">Reference</th>
                                <th className="px-4 py-2 border-b">Title</th>
                                <th className="px-4 py-2 border-b">Company Phone</th>
                                <th className="px-4 py-2 border-b">Company</th>
                                <th className="px-4 py-2 border-b">Description</th>
                                <th className="px-4 py-2 border-b">Location</th>
                                <th className="px-4 py-2 border-b">Salary</th>
                                <th className="px-4 py-2 border-b">Status</th>
                                <th className="px-4 py-2 border-b">Technician Name</th>
                                <th className="px-4 py-2 border-b">Technician Email</th>
                                <th className="px-4 py-2 border-b">Technician Phone</th>
                                <th className="px-4 py-2 border-b">Technician Username</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tasks.map((task) => (
                                <tr key={task.id} className="border-b hover:bg-gray-50">
                                    <td className="px-4 py-2">
                                    <input
                                        type="checkbox"
                                        checked={selectedTasks.includes(task.id)}
                                        onChange={() => handleSelectTask(task.id)}
                                    />
                                </td>
                                    <td className="px-4 py-2">{task.Reference}</td>
                                    <td className="px-4 py-2">{task.title}</td>
                                    <td className="px-4 py-2">{task.phone}</td>
                                    <td className="px-4 py-2">{task.company}</td>
                                    <td className="px-4 py-2">{task.description}</td>
                                    <td className="px-4 py-2">{task.location}</td>
                                    <td className="px-4 py-2">{task.salary}</td>
                                    <td className="px-4 py-2">
    {task.status === "2" && (
        <span className="px-2 py-1 rounded-full bg-green-100 text-green-800">Completed</span>
    )}
    {task.status === "3" && (
        <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-800">Active</span>
    )}
    {task.status === "1" && (
        <span className="px-2 py-1 rounded-full bg-yellow-100 text-yellow-800">In Progress</span>
    )}
    {task.status === "0" && (
        <span className="px-2 py-1 rounded-full bg-red-100 text-red-800">Cancelled</span>
    )}
</td>
                                    <td className="px-4 py-2">{task.technician_name}</td>
                                    <td className="px-4 py-2">{task.technician_email}</td>
                                    <td className="px-4 py-2">{task.technician_phone}</td>
                                    <td className="px-4 py-2">{task.technician_username}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                     {/* Display total salary when "Completed" is selected */}
            {filterByStatus === "2" && (
                <div className="mt-4">
                    <p className="font-semibold">Total Salary for Completed Tasks:  {new Intl.NumberFormat('en-ET', { style: 'currency', currency: 'ETB' }).format(totalSalary)}
                   </p>
                </div>
            )}
                </div>
            )}

            {/* Pagination */}
            <div className="mt-4 flex justify-between items-center">
                <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300"
                >
                    Previous
                </button>
                <span className="text-lg">
                    Page {currentPage}
                </span>
                <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={tasks.length < pageSize}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300"
                >
                    Next
                </button>
            </div>
        </div>
    );
};

export default TotalCompletedJobs;
