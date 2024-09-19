// SendSmsForm.jsx
import React, { useState } from 'react';
import axios from 'axios';
import axiosClient from '../axiosClient';

const SendSmsForm = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('');

  const sendSms = async (e) => {
    e.preventDefault();
    try {
      const response = await axiosClient.post('/send-sms', {
        phoneNumber,
        message,
      });
      if (response.data.success) {
        setStatus('SMS sent successfully!');
      } else {
        setStatus('Failed to send SMS.');
      }
    } catch (error) {
      setStatus('Error sending SMS.');
    }
  };

  return (
    <form onSubmit={sendSms}>
      <label>Phone Number:</label>
      <input
        type="text"
        value={phoneNumber}
        onChange={(e) => setPhoneNumber(e.target.value)}
        required
      />
      <label>Message:</label>
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        required
      />
      <button type="submit">Send SMS</button>
      <p>{status}</p>
    </form>
  );
};

export default SendSmsForm;
