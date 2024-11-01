import React, { useState, useEffect, useRef } from 'react';
import { Navigate, Outlet, Link } from 'react-router-dom';
import axiosClient from '../axiosClient';
import { useStateContext } from '../contexts/contextprovider';
import useSessionTimeout from '../context/useSessionTimeout';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { FiBell } from 'react-icons/fi';

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

const DefaultLayout = ({userData}) => {
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
   
    {userData?.role === "1" && (
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
           
            <a href="#" onClick={onLogout} className="text-white hover:text-gray-300">Logout</a>
          </div>
        </div>
           

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
      {userData?.role === "3" && (
      <>
        <div className="hidden md:flex items-center space-x-4">
        <a href="/"  className="text-white hover:text-gray-300">Home</a>

          <div className="relative">
            <button
              onClick={() => handleMenuClick('jobMenu')}
              className="text-white hover:text-gray-300"
            >
              Job Menu
            </button>
            {activeMenu === 'jobMenu' && (
              <DropdownMenu
              items={['Active Jobs', 'Completed Jobs', 'Canceled Jobs', 'Avalable Jobs' 
              ]}
              links={['/confirmed-tasks', '/completed-tasks', '/canceld-tasks', '/tasks' ]}
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
              <div className="relative">
              <a href="#" onClick={onLogout} className="text-white hover:text-gray-300">Logout</a>

          </div>
        </div>
            

<div>

{isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end">
          <div className="bg-white w-3/4 max-w-xs h-full shadow-lg transform transition-transform duration-300 ease-in-out">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold">Menu</h2>
              <button onClick={toggleMobileMenu} className="text-gray-600 focus:outline-none">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            <div className="p-4">
            {userData?.role === "3" && (
              <><Link to="/" className="block py-2 px-4 text-gray-800 hover:bg-gray-200" onClick={toggleMobileMenu}>Home</Link>
                   <div className="relative">
     


          </div>
              <Link to="/profile" className="block py-2 px-4 text-gray-800 hover:bg-gray-200" onClick={toggleMobileMenu}>Profile</Link>
              <><Link to="/confirmed-tasks" className="block py-2 px-4 text-gray-800 hover:bg-gray-200" onClick={toggleMobileMenu}>Confirmed Jobs</Link>
                             <Link to="/completed-tasks" className="block py-2 px-4 text-gray-800 hover:bg-gray-200" onClick={toggleMobileMenu}>Completed Jobs</Link>
                             <Link to="/canceld-tasks" className="block py-2 px-4 text-gray-800 hover:bg-gray-200" onClick={toggleMobileMenu}>Canceled Jobs</Link>
                             <Link to="/tasks" className="block py-2 px-4 text-gray-800 hover:bg-gray-200" onClick={toggleMobileMenu}>Avalable Jobs</Link></>
              <button onClick={onLogout} className="w-full text-left py-2 px-4 text-red-500 hover:bg-red-100">Logout</button></>
            )}


            
{userData?.role === "1" && (
              <><Link to="/" className="block py-2 px-4 text-gray-800 hover:bg-gray-200" onClick={toggleMobileMenu}>Home</Link>
                   <div className="relative">
            <button
              onClick={() => handleMenuClick('home')}
              className="text-white hover:text-gray-300"
            >
             <button  onClick={() => handleMenuClick('home')} className=" w-full py-2 px-4 text-gray-800 hover:bg-gray-200"  >Home</button>
            </button>
            {activeMenu === 'home' && (
              <DropdownMenu
              items={['Active Jobs', 'Completed Jobs', 'Canceled Jobs', 'Avalable Jobs' 
              ]}
              links={['/confirmed-tasks', '/completed-tasks', '/canceld-tasks', '/tasks' ]}
              isOpen={true}
              onClose={() => setActiveMenu(null)}
              />
            )}
Cancelled 

          </div>
              <Link to="/profile" className="block py-2 px-4 text-gray-800 hover:bg-gray-200" onClick={handleProfileClick}>Profile</Link>
              <Link to="/orders" className="block py-2 px-4 text-gray-800 hover:bg-gray-200" onClick={toggleMobileMenu}>Orders</Link>
              <Link to="/jobs" className="block py-2 px-4 text-gray-800 hover:bg-gray-200" onClick={toggleMobileMenu}>Jobs</Link>
              <Link to="/users" className="block py-2 px-4 text-gray-800 hover:bg-gray-200" onClick={toggleMobileMenu}>Users</Link>
              <button onClick={onLogout} className="w-full text-left py-2 px-4 text-red-500 hover:bg-red-100">Logout</button></>
            )}
            </div>
          </div>
        </div>
      )}


      
</div>
        <button
          onClick={toggleMobileMenu}
          className="md:hidden text-white focus:outline-none"
        >
          <svg className="w-full h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
          </svg>
          MENU
         
        </button>
      </>
    )}
        </>
         
            <button onClick={onLogout} className="w-full text-left py-2 px-4 text-red-500 hover:bg-red-100">Logout</button> 

          </div>
  </div>
  
</nav>
<header className="flex justify-between items-center p-4 bg-white rounded-lg shadow">
        <div>
       
          <h1 className="text-xl font-bold">Hello, {userData?.firstName + " " +userData?.lastName}</h1>
          <h3 className="text-sm text-gray-500">Technician Status: <span
          className= { `px-4 py-2  ${ userData?.availability === '1' ? 'text-green-500  ' : 'text-red-500  '
  }`}>{userData?.availability === "1" ? "Available" : "Not Available" }</span></h3>        </div>
        <FiBell className="text-gray-400 w-6 h-6" />
      </header>
    
      <main>
      <ToastContainer />
        <Outlet />
      </main>
    </>
  );
};

export default DefaultLayout;
