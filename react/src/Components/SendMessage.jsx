import React, { useState } from 'react';
import axios from 'axios';

import { toast } from "react-toastify";

const SendMessage = ({ chatId, onClose }) => {
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  // Function to send message via Telegram
  const sendMessageToTelegram = async () => {
    const token = '6685274704:AAFR-NXKCnfe7RZy9tGq5Swn2A0tDkTsrBU'; // Your bot token
    const telegramApiUrl = `https://api.telegram.org/bot${token}/sendMessage`;

    const data = {
      chat_id: chatId,  // Use the chat ID from props
      text: message,   // Message text
      parse_mode: 'HTML', // Optional to parse HTML in the message
    };

    try {
      const response = await axios.post(telegramApiUrl, data);
      console.log('Message sent to Telegram successfully:', response.data);
    //   setSuccess(true); // Set success state to true
      setError(null); // Clear any previous errors
      setMessage(''); // Clear the message input
      onClose(); // Close the modal after successful send
      toast.success(" Message sent successfully!")

    } catch (error) {
      console.error('Error sending message to Telegram:', error);
      toast.error(" Failed to send message. Please try again.")
      setError('Failed to send message. Please try again.'); // Set error state
    }
  };

  // Handle the form submission
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (chatId) {
      sendMessageToTelegram();
    } else {
      alert('Chat ID is missing.');
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-lg font-bold mb-4">Send Message via Telegram</h1>

      {/* Form to send message */}
      <form onSubmit={handleSendMessage} className="space-y-4">
        {/* Message input */}
        <div>
          <label htmlFor="message" className="block text-gray-700">Message:</label>
          <textarea
            type="text"
            id="message"
            placeholder="Enter message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="border p-2 w-full"
            required
          />
        </div>

        {/* Submit button */}
        <div>
          <button type="submit" className="bg-blue-500 text-white p-2 rounded">
            Send Message
          </button>
        </div>

        {/* Success message */}
        {success && (
          <div className="text-green-500 mt-4">
            Message sent successfully!
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="text-red-500 mt-4">
            {error}
          </div>
        )}
      </form>
    </div>
  );
};

export default SendMessage;
