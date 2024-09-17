import { Link } from 'react-router-dom';
import { useState } from 'react';

const Navbar = ({ user, onLogout, onOpenModal }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <header className="bg-indigo-600 text-white p-4 flex justify-between items-center">
      <div className="flex items-center space-x-4">
        <Link to="/orders" className="text-white hover:bg-indigo-700 px-3 py-2 rounded-md">
          Total Orders
        </Link>
        <button
          onClick={onOpenModal}
          className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600"
        >
          Add User
        </button>
      </div>
      <div className="relative">
        <button onClick={toggleDropdown} className="flex items-center space-x-2 text-white">
          <span>{user?.name}</span>
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
        {isDropdownOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white text-black rounded-md shadow-lg">
            <a
              href="#"
              onClick={onLogout}
              className="block px-4 py-2 hover:bg-gray-100"
            >
              Logout
            </a>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
