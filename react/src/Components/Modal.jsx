import React from 'react';
import ReactDOM from 'react-dom';
import { useEffect ,useState } from "react";
import RegistrationForm from './RegistrationForm ';

const Modal = ({ isOpen, onClose , children}) => {
  if (!isOpen) return null;

  

  return ReactDOM.createPortal(
    <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-70 z-50">
    <div className="relative bg-white p-6 rounded-lg shadow-lg w-full max-w-xl max-h-[90vh] overflow-auto">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl"
        aria-label="Close"
      >
        &times;
      </button>
      <div className='mt-10'>
       {children} 

      </div>
    </div>
  </div>,
  document.body
  );
};

export default Modal;
