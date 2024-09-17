import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axiosClient from "../axiosClient";
import Modal from '../Components/Modal';
import RegistrationForm from "../Components/RegistrationForm ";
import LoadingSpinner from "../Components/LoadingSpiner";
import { useNavigate } from 'react-router-dom';
import { toast } from "react-toastify";


export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userData, setUser] = useState([]);
  const [search, setSearch] = useState('');
  const [pageSize, setPageSize] = useState(10); // Default page size
  const [currentPage, setCurrentPage] = useState(1); // Track current page

  
     const navigate = useNavigate();
  useEffect(() => {
    getUsers();
  }, []);

  const onDeleteClick = (user) => {
    if (!window.confirm("Are you sure you want to delete this user?")) {
      return;
    }
    axiosClient.delete(`/users/${user.id}`).
    then((res) =>{
      getUsers()
      console.log(res.data.message)
      toast.success(res.data.message)
  } );
  };

  const getUsers = () => {
    setLoading(true);
    axiosClient
      .get("/users-registration")
      .then(({ data }) => {
        setLoading(false);
        setUsers(data.data);
        // console.log(data)
      })
      .catch(() => {
        setLoading(false);
      });
  };

  const getUser = (user) => {
    setLoading(true);
    axiosClient
      .get(`/users-registration/${user.id}`)
      .then(({ data }) => {
        setLoading(false);
        setUser(data);
      })
      .catch(() => {
        setLoading(false);
      });
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const handleCloseModal = () => {
    getUsers();
    setIsModalOpen(false);
  };
  const editUser = (userData) => {
    setIsModalOpen(true);
    setUser(userData);
  };
  const viewHandle = (userId) => {
    navigate(`/users-registration/${userId}`);

  };
  
  const openMo = (userData) =>{
    setIsModalOpen(true);
    setUser([ ]);
  }
  const closeModal = () => setIsModalOpen(false);

  // Pagination

    // Pagination and search logic
    const totalUsers = users.filter((user) =>
      user.id.toString().includes(search) || // Convert job.id to string for search
    user.firstName.toLowerCase().includes(search.toLowerCase()) || 
    user.lastName.toLowerCase().includes(search.toLowerCase()) ||
    user.email.toLowerCase().includes(search.toLowerCase())
  );
  
  const totalPages = Math.ceil(totalUsers / pageSize);

  const paginatedUsers = users
    .filter((user) =>
      user.firstName.toLowerCase().includes(search.toLowerCase()) || 
      user.lastName.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase())
    )
    .slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  return (
    <div className="container mx-auto p-4">
  
    <div>
     
      <div>
       
        <Modal isOpen={isModalOpen} onClose={closeModal}>
          <RegistrationForm userData={userData} onClose={closeModal} getUsers={getUsers} />
        </Modal>
      </div>
      <div className="bg-white shadow-md rounded-lg p-4">
  <div className="flex justify-between items-center mb-4">
    <h1 className="text-xl font-bold">User Table</h1>
  </div>
  <div className="flex justify-between items-center mb-4">
    {/* Page Size Dropdown on the Left */}
    <div className="flex items-center">
      <select
        value={pageSize}
        onChange={(e) => {
          setPageSize(parseInt(e.target.value));
          setCurrentPage(1); // Reset to first page
        }}
        className="border px-4 py-2 rounded-md"
      >
        <option value={10}>10</option>
        <option value={25}>25</option>
        <option value={50}>50</option>
        <option value={100}>100</option>
      </select>
    </div>
    <button
          onClick={() => openMo()}
          className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600"
        >
          Add User
        </button>
    {/* Search Input on the Right */}
    <div className="flex items-center">
      <input
        type="text"
        placeholder="Search users..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="border px-4 py-2 rounded-md"
      />
    </div>
  </div>
</div>
</div>
      <div className="container mx-auto p-4">
        
  

        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-2 border">ID</th>
                <th className="px-4 py-2 border">Email</th>
                <th className="px-4 py-2 border">Chat ID</th>
                <th className="px-4 py-2 border">First Name</th>
                <th className="px-4 py-2 border">Last Name</th>
                <th className="px-4 py-2 border">Phone</th>
                <th className="px-4 py-2 border">Username</th>
                <th className="px-4 py-2 border">Role</th>
                <th className="px-4 py-2 border">Status</th>
                <th className="px-4 py-2 border">Availability</th>
                <th className="px-4 py-2 border">Actions</th>
              </tr>
            </thead>
            {!loading && (
              <tbody>
                {paginatedUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-100">
                    <td className="px-4 py-2 border">{user.id}</td>
                    <td className="px-4 py-2 border">{user.email}</td>
                    <td className="px-4 py-2 border">{user.chat_id}</td>
                    <td className="px-4 py-2 border">{user.firstName}</td>
                    <td className="px-4 py-2 border">{user.lastName}</td>
                    <td className="px-4 py-2 border">{user.phone}</td>
                    <td className="px-4 py-2 border">
                      <a
                        href={`https://t.me/${user.username}`} // Telegram profile link
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline"
                      >
                        @{user.username}
                      </a>
                    </td>
                    <td className="px-4 py-2 border">
                      {user.role === '1' ? 'Admin' : user.role === '2' ? 'Finance' : 'Technician'}
                    </td>
                    <td
                      className={`px-4 py-2 border ${
                        user.status === '1' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                      }`}
                    >
                      {user.status === '1' ? 'Active' : 'Inactive'}
                    </td>
                    <td
                      className={`px-4 py-2 border ${
                        user.availability === '1' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                      }`}
                    >
                      {user.availability === '1' ? 'Available' : 'Not Available'}
                    </td>
                    <td>
                    <button className="btn-edit" onClick={() => viewHandle(user.id)}>View</button>

                      <button className="btn-edit" onClick={() => editUser(user)}>Edit</button>
                      &nbsp;
                      <button className="btn-delete" onClick={() => onDeleteClick(user)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            )}
          </table>
        </div>

        {loading && <LoadingSpinner />}

        {/* Pagination Controls */}
        <div className="flex justify-between items-center mt-4">
          <button
            disabled={currentPage === 1}
            onClick={() => handlePageChange(currentPage - 1)}
            className="px-4 py-2 bg-gray-300 rounded-md"
          >
            Previous
          </button>
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <button
            disabled={currentPage === totalPages}
            onClick={() => handlePageChange(currentPage + 1)}
            className="px-4 py-2 bg-gray-300 rounded-md"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
