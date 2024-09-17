import React, { useState, useEffect } from 'react';
import { Navigate, Outlet, Link } from 'react-router-dom';
import axiosClient from '../axiosClient';
import { useStateContext } from '../contexts/contextprovider';
import Modal from './Modal';

const DefaultLayout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };
  const { user, token, setUser, setToken } = useStateContext();
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        if (token) {
            axiosClient.get('/user')
                .then(({ data }) => {
                    setUser(data);
                });
        }
    }, [token]);

    if (!token) {
        return <Navigate to='/login' />;
    }

    const onLogout = (ev) => {
        ev.preventDefault();
        axiosClient.get('/logout')
            .then(() => {
                setUser(null);
                setToken(null);
            });
    };

    const handleOpenModal = () => {
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

  return (
    <nav className="bg-indigo-600 p-4" > 
      <div className="container mx-auto flex items-center justify-between">
        {/* Logo */}
        <a href="#" className="text-white text-2xl font-bold">MyApp</a>

        {/* Desktop Menu */}
        <div className="hidden md:flex space-x-4">
          <a href="#" className="text-white hover:text-gray-300">Home</a>
          <a href="#" className="text-white hover:text-gray-300">About</a>
          <a href="#" className="text-white hover:text-gray-300">Services</a>
          <a href="#" className="text-white hover:text-gray-300">Pricing</a>
          <a href="#" className="text-white hover:text-gray-300">Blog</a>
          <a href="#" className="text-white hover:text-gray-300">Contact</a>
          <div>
                        {user.name}
                        <a href="#" onClick={onLogout} className="ml-4 text-red-500 hover:underline">Logout</a>
                    </div>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={toggleMobileMenu}
          className="md:hidden text-white focus:outline-none"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-gray-800 bg-opacity-75 z-50">
          <div className="flex flex-col items-center justify-center h-full">
            <a href="#" className="text-white text-2xl mb-4" onClick={toggleMobileMenu}>Home</a>
            <a href="#" className="text-white text-2xl mb-4" onClick={toggleMobileMenu}>About</a>
            <a href="#" className="text-white text-2xl mb-4" onClick={toggleMobileMenu}>Services</a>
            <a href="#" className="text-white text-2xl mb-4" onClick={toggleMobileMenu}>Pricing</a>
            <a href="#" className="text-white text-2xl mb-4" onClick={toggleMobileMenu}>Blog</a>
            <a href="#" className="text-white text-2xl mb-4" onClick={toggleMobileMenu}>Contact</a>
          </div>
        </div>
      )}
    </nav>
  );
};

export default DefaultLayout;
