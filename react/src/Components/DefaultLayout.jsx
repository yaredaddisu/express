import React, { useState, useEffect, useRef } from 'react';
import { Navigate, Outlet, Link } from 'react-router-dom';
import axiosClient from '../axiosClient';
import { useStateContext } from '../contexts/contextprovider';
import useSessionTimeout from '../context/useSessionTimeout';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

const DropdownMenu = ({ items, links, isOpen, onClose }) => {
  useSessionTimeout(4000); // Set the session timeout for your app
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  return isOpen ? (
    <div ref={menuRef} className="absolute top-full left-0 mt-2 bg-white text-gray-800 rounded-lg shadow-lg w-64 h-auto max-h-80 overflow-y-auto">
      <div className="flex flex-wrap">
        {items.map((item, index) => (
          <Link
            key={index}
            to={links[index]}
            className="w-1/2 px-4 py-2 hover:bg-gray-100"
            onClick={onClose} // Close the menu when a link is clicked
          >
            {item}
          </Link>
        ))}
      </div>
    </div>
  ) : null;
};

const DefaultLayout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState(null);
  const { user, token, setUser, setToken } = useStateContext();
  const navigate = useNavigate();

  // useEffect(() => {
  //   // Retrieve user data from localStorage when the component mounts
  //   const savedUser = localStorage.getItem('user');
  //   if (savedUser) {
  //     setUser(JSON.parse(savedUser));
  //   }
  // }, [setUser]);
 
  
  useEffect(() => {
     const fetchUser = async () => {
      try {
        if (token) {
          const { data } = await axiosClient.get('/user');
          setUser(data); // Successfully set user data
       
        }
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Error fetching user data:', error); // Handle error
        }
      }
    };
  
    fetchUser();
  
  }, [token, axiosClient]); 
  
  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  if (!token) {
    return <Navigate to='/login' />;
  }

  const onLogout = (ev) => {
    ev.preventDefault();
    axiosClient.get('/logout').then(() => {
      setUser(null);
      setToken(null);
      localStorage.removeItem('user'); // Remove user data from localStorage
    });
  };

  const handleMenuClick = (menu) => {
    setActiveMenu(activeMenu === menu ? null : menu);
  };

  const handleProfileClick = () => {
    navigate('/profile'); // Navigate to profile page
  };

  return (
    <>
<nav className="bg-sky-800 pt-0 h-[70px] md:h-auto items-center">
  <div className="container mx-auto flex items-center justify-between">
    {/* Logo */}
    <Link to="/" className="text-white text-2xl font-bold">Technician Managmeent</Link>

    {user.role === "1" && (
      <>
        <div className="hidden md:flex items-center space-x-4">
          <div className="relative">
            <button
              onClick={() => handleMenuClick('home')}
              className="text-white hover:text-gray-300"
            >
              Home
            </button>
            {activeMenu === 'home' && (
              <DropdownMenu
                items={['Orders', 'Users', 'Jobs', 'Submenu 4', 'Submenu 5', 'Submenu 6'
                  ,'Orders', 'Users', 'Jobs', 'Submenu 4', 'Submenu 5', 'Submenu 6',
                  'Orders', 'Users', 'Jobs', 'Submenu 4', 'Submenu 5', 'Submenu 6'
                  ,'Orders', 'Users', 'Jobs', 'Submenu 4', 'Submenu 5', 'Submenu 6'
                ]}
                links={['/orders', '/users', '/jobs', '/submenu4', '/submenu5', '/submenu6']}
                isOpen={true}
                onClose={() => setActiveMenu(null)}
              />
            )}
          </div>
          <div className="relative">
            <button
              onClick={() => handleMenuClick('about')}
              className="text-white hover:text-gray-300"
            >
              About
            </button>
            {activeMenu === 'about' && (
              <DropdownMenu
                items={['Submenu 1', 'Submenu 2']}
                links={['/about1', '/about2']}
                isOpen={true}
                onClose={() => setActiveMenu(null)}
              />
            )}


          </div>
          <div className="relative">
          <button
              onClick={() => handleProfileClick('profile')}
              className="text-white hover:text-gray-300"
            >
              Profile
            </button>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-white hover:text-gray-300">{user.name}</span>
            <a href="#" onClick={onLogout} className="text-white hover:text-gray-300">Logout</a>
          </div>
        </div>
              <h1 className="text-md text-white">{user.firstName}  </h1>
              <h1 className="text-md  text-white">{user.email}  </h1>

        <button
          onClick={toggleMobileMenu}
          className="md:hidden text-white focus:outline-none"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
          </svg>
        </button>
      </>
    )}
    <div className="flex items-center space-x-4">
      <>
      {user.role === "0" && (
    <div className="relative">
          <a href="#" className="text-white text-2xl mb-4" onClick={() => handleMenuClick('about')}>Menu</a>
          {activeMenu === 'about' && (
            <DropdownMenu
              items={['Orders', 'Submenu 2']}
              links={['/orders', '/about2']}
              isOpen={true}
              onClose={() => setActiveMenu(null)}
            />
          )}
        </div>
      )}
        </>
            <span className="text-white hover:text-gray-300">{user.name}</span>
            <a href="#" onClick={onLogout} className="text-white hover:text-gray-300">Logout</a>
          </div>
  </div>
 
  {/* Mobile Menu */}
  {isMobileMenuOpen && (
    <div className="md:hidden fixed inset-0 bg-gray-800 bg-opacity-75 z-50">
      <div className="flex flex-col items-center justify-center h-full">
        <div className="relative">
          <a    className="text-white text-2xl mb-4" onClick={() => handleMenuClick('home')}>Home</a>
          {activeMenu === 'home' && (
           <DropdownMenu
           items={['Orders', 'Users', 'Jobs', 'Submenu 4', 'Submenu 5', 'Submenu 6']}
           links={['/orders', '/users', '/jobs', '/submenu4', '/submenu5', '/submenu6']}
           isOpen={true}
           onClose={() => setActiveMenu(null)}
         />
          )}
        </div>
        <div className="relative">
          <a href="#" className="text-white text-2xl mb-4" onClick={() => handleMenuClick('about')}>About</a>
          {activeMenu === 'about' && (
            <DropdownMenu
              items={['Submenu 1', 'Submenu 2']}
              links={['/about1', '/about2']}
              isOpen={true}
              onClose={() => setActiveMenu(null)}
            />
          )}
        </div>
        {/* Repeat for other mobile menu items */}
      </div>
    </div>
  )}
</nav>

    
      <main>
      <ToastContainer />
        <Outlet />
      </main>
    </>
  );
};

export default DefaultLayout;
