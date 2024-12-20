import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axiosClient from "../axiosClient";
import Modal from '../Components/Modal';
import LoadingSpinner from "../Components/LoadingSpiner";
import JobForm from '../Components/CreateJob'; // Adjust path as necessary
import Button from "../Components/Button";
import Buttons from "../Components/Buttons";
import { toast } from "react-toastify";

export default function Users() {
    const [loading, setLoading] = useState(false);
    const [jobs, setJobs] = useState([]); // Initialize jobs as an empty array
    const [jobData, setJobData] = useState({});
    const [currentPage, setCurrentPage] = useState(0);
    const [search, setSearch] = useState('');
    const [pageSize, setPageSize] = useState(10); // Default page size
    const [totalPages, setTotalPages] = useState(0); // Total pages from the server
    const [isModalOpen, setIsModalOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        getJobs();
    }, [currentPage, pageSize, search]);

    const getJobs = () => {
        setLoading(true);
        axiosClient
            .get('/jobs', {
                params: {
                    page: currentPage + 1,
                    pageSize,
                    search,
                },
            })
            .then(({ data }) => {
                setLoading(false);
                setJobs(data.data.jobs || []); // Fallback to empty array if undefined
                setTotalPages(data.data.totalPages);
                console.log(data.data.jobs)
            })
            .catch(() => {
                setLoading(false);
            });
    };

    const onDeleteClick = (job) => {
        if (!window.confirm("Are you sure you want to delete this job?")) return;
        axiosClient.delete(`/jobs/${job.id}`)
            .then((res) => {
                getJobs();
                toast.success(res.data.message);
            });
    };

    const handleEdit = (job) => {
        setIsModalOpen(true);
        setJobData(job);
    };

    const handleView = (jobId) => {
        navigate(`/jobs/${jobId}`);
    };

    const handleCloseModal = () => {
        getJobs();
        setIsModalOpen(false);
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handlePageSizeChange = (e) => {
        setPageSize(parseInt(e.target.value));
        setCurrentPage(0);
    };

    return (
        <div className="w-full mx-auto px-4 py-8">
            <button
                onClick={handleEdit}
                className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600"
            >
                Add Job
            </button>

            {loading && <LoadingSpinner />}

            <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
                <JobForm jobData={jobData} onClose={handleCloseModal} getJobs={getJobs} />
            </Modal>

            <h1 className="text-3xl font-bold mb-6">Job Listings</h1>

            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center">
                    <select
                        value={pageSize}
                        onChange={handlePageSizeChange}
                        className="border px-4 py-2 rounded-md"
                    >
                        <option value={10}>10</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                    </select>
                </div>

                <div className="flex items-center">
                    <input
                        type="text"
                        placeholder="Search jobs..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="border px-4 py-2 rounded-md"
                    />
                </div>
            </div>

            <div className="overflow-x-auto">
                <table>
                    <thead>
                        <tr>
                            <th>Job Id</th>
                            <th>Reference</th>
                            <th>Title</th>
                            <th>Description</th>
                            <th>Company</th>
                            <th>Phone</th>
                            <th>Location</th>
                            <th>Salary</th>
                            <th>Status</th>
                            <th>Created At</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Array.isArray(jobs) && jobs.length > 0 ? (
                            jobs.map((job) => (
                                <tr key={job.id} className="border-t border-gray-200">
                                    <td>{job.id}</td>
                                    <td>{job.Reference}</td>
                                    <td>{job.title}</td>
                                    <td>{job.description}</td>
                                    <td>{job.company}</td>
                                    <td>{job.phone}</td>
                                    <td>{job.location}</td>
                                    <td>ETB {job.salary}</td>
                                    <td>
                                        <button className={`font-medium ${job.status === '2' ? 'bg-blue-500 text-white' : job.status === '1' ? 'bg-green-500 text-white' : job.status === '3' ? 'bg-yellow-500 text-white' : 'bg-red-500 text-white'} px-2 py-1 rounded`}>
                                            {job.status === '2' ? 'Completed' : job.status === '1' ? 'Open' : job.status === '3' ? 'In Progress' : 'Closed'}
                                        </button>
                                    </td>
                                    <td>{job.created_at}</td>
                                    <td className="flex space-x-2">
                                        <button
                                            onClick={() => handleView(job.id)}
                                            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
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
                                            onClick={() => onDeleteClick(job)}
                                            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="11" className="text-center p-4">
                                    No jobs found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="p-3 lg:px-6 border-t border-gray-100 dark:border-slate-800">
                <div className="flex flex-col md:flex-row items-center justify-between py-3 md:py-0">
                    <Buttons>
                        {Array.from({ length: totalPages }).map((_, page) => (
                            <Button
                                key={page}
                                active={page === currentPage}
                                label={page + 1}
                                color={page === currentPage ? 'lightDark' : 'whiteDark'}
                                small
                                onClick={() => handlePageChange(page)}
                            />
                        ))}
                    </Buttons>
                    <small className="mt-6 md:mt-0">
                        Page {currentPage + 1} of {totalPages}
                    </small>
                </div>
            </div>
        </div>
    );
}
