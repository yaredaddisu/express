// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import axiosClient from '../axiosClient';

// const UserProfile = () => {
//   const [user, setUser] = useState(null);
//   const [error, setError] = useState(null);
//   const [message, setMessage] = useState('');
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchUserData = async () => {
//       try {
//         const accessToken = 'EAAF1pWMJ19YBO8axx4evFZA3XywqF26xiYrsEYZCqWr4450qeZBNo6rw9xPXPWjuQMkcVwJCOADyOsHuv4SR9n4iLZCQ1MC8AjDAS30hudcmE6j5ZCELngvqo81de7nWFAjYCIldL10Cptg2uZC1sFOlaSjaFN3rZAuKeFB2hLyTyZCNGKz9QWZAakz0gWAZBN6MW0Hk1MXEnPmbF3GEvck2c6HE0ZD'; // Replace with your actual access token
//         const response = await axios.get(`https://graph.facebook.com/me?access_token=${accessToken}`);
//         setUser(response.data);
//         setLoading(false);
//       } catch (error) {
//         console.error('Error fetching user data:', error);
//         setError('Failed to fetch user data.');
//         setLoading(false);
//       }
//     };

//     fetchUserData();
//   }, []);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!message.trim()) {
//       alert('Message cannot be empty');
//       return;
//     }
//     try {
//       await axiosClient.post('/postToFacebook', { message });
//       alert('Message posted successfully!');
//       setMessage(''); // Clear the message after posting
//     } catch (error) {
//       console.error('Error posting message:', error);
//       alert('Failed to post message.');
//     }
//   };

//   if (loading) return <p>Loading...</p>;
//   if (error) return <p>{error}</p>;

//   return (
//     <div>
//       <h1>User Profile</h1>
//       <p>ID: {user.id}</p>
//       <p>Name: {user.name}</p>

//       <h1>Post to Facebook</h1>
//       <form onSubmit={handleSubmit}>
//         <input
//           type="text"
//           value={message}
//           onChange={(e) => setMessage(e.target.value)}
//           placeholder="Enter your message"
//         />
//         <button type="submit">Post</button>
//       </form>
//     </div>
//   );
// };

// // export default UserProfile;
// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import axiosClient from '../axiosClient';

// const UserProfile = () => {
//   const [user, setUser] = useState(null);
//   const [error, setError] = useState(null);
//   const [message, setMessage] = useState('');
//   const [image, setImage] = useState(null); // For storing the selected image file
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchUserData = async () => {
//       try {
//         const accessToken = 'EAAF1pWMJ19YBO8axx4evFZA3XywqF26xiYrsEYZCqWr4450qeZBNo6rw9xPXPWjuQMkcVwJCOADyOsHuv4SR9n4iLZCQ1MC8AjDAS30hudcmE6j5ZCELngvqo81de7nWFAjYCIldL10Cptg2uZC1sFOlaSjaFN3rZAuKeFB2hLyTyZCNGKz9QWZAakz0gWAZBN6MW0Hk1MXEnPmbF3GEvck2c6HE0ZD'; // Replace with your actual access token
//         const response = await axios.get(`https://graph.facebook.com/me?access_token=${accessToken}`);
//         setUser(response.data);
//         setLoading(false);
//       } catch (error) {
//         console.error('Error fetching user data:', error);
//         setError('Failed to fetch user data.');
//         setLoading(false);
//       }
//     };

//     fetchUserData();
//   }, []);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!message.trim() && !image) {
//       alert('You must provide a message or an image.');
//       return;
//     }

//     try {
//       const formData = new FormData();
//       formData.append('message', message);
//       if (image) {
//         formData.append('source', image); // 'source' is the key for image files in Facebook API
//       }

//       const accessToken = 'EAAF1pWMJ19YBO8axx4evFZA3XywqF26xiYrsEYZCqWr4450qeZBNo6rw9xPXPWjuQMkcVwJCOADyOsHuv4SR9n4iLZCQ1MC8AjDAS30hudcmE6j5ZCELngvqo81de7nWFAjYCIldL10Cptg2uZC1sFOlaSjaFN3rZAuKeFB2hLyTyZCNGKz9QWZAakz0gWAZBN6MW0Hk1MXEnPmbF3GEvck2c6HE0ZD'; // Replace with your actual access token
//       const response = await axios.post(
//         `https://graph.facebook.com/me/photos?access_token=${accessToken}`,
//         formData,
//         { headers: { 'Content-Type': 'multipart/form-data' } }
//       );

//       if (response.status === 200) {
//         alert('Post created successfully!');
//         setMessage('');
//         setImage(null); // Clear the image after posting
//       }
//     } catch (error) {
//       console.error('Error posting to Facebook:', error);
//       alert('Failed to post.');
//     }
//   };

//   const handleImageChange = (e) => {
//     const file = e.target.files[0];
//     setImage(file); // Store the image file
//   };

//   if (loading) return <p>Loading...</p>;
//   if (error) return <p>{error}</p>;

//   return (
//     <div>
//       <h1>User Profile</h1>
//       <p>ID: {user.id}</p>
//       <p>Name: {user.name}</p>

//       <h1>Post to Facebook</h1>
//       <form onSubmit={handleSubmit}>
//         <input
//           type="text"
//           value={message}
//           onChange={(e) => setMessage(e.target.value)}
//           placeholder="Enter your message"
//         />
//         <input
//           type="file"
//           accept="image/*"
//           onChange={handleImageChange}
//         />
//         <button type="submit">Post</button>
//       </form>
//     </div>
//   );
// };

// import React, { useState } from 'react';
// import axiosClient from '../axiosClient';

// import { toast } from "react-toastify";

// const UserProfile = () => {
//   const [message, setMessage] = useState('');
//   const [images, setImages] = useState([]);
//   const [loading, setLoading] = useState(false);

//   // Handle image selection
//   const handleImageChange = (e) => {
//     const files = Array.from(e.target.files);
//     const imageFiles = files.map((file) => ({
//       file,
//       url: URL.createObjectURL(file),
//     }));
//     setImages((prevImages) => [...prevImages, ...imageFiles]);
//   };

//   // Remove an image by index
//   const removeImage = (indexToRemove) => {
//     setImages((prevImages) => prevImages.filter((_, index) => index !== indexToRemove));
//   };

//   // Handle form submit
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     const formData = new FormData();
//     formData.append('message', message);

//     images.forEach((image) => {
//       formData.append('images', image.file);
//     });

//     try {
//       await axiosClient.post('/postToFacebook', formData, {
//         headers: {
//           'Content-Type': 'multipart/form-data',
//         },
//       });
//       // alert('Message and images posted successfully!');
//             toast.success('Message and images posted successfully!')

//       // Reset form fields
//       setMessage('');
//       setImages([]);
//     } catch (error) {
//       console.error('Error posting message:', error);
//       // alert('Failed to post message.');
//       toast.error('Failed to post message.')

//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="max-w-lg mx-auto p-6 ">
//       <h1 className="text-2xl font-semibold mb-6">Post to Facebook</h1>

//       <form onSubmit={handleSubmit} className="space-y-6">
//         {/* Message Input */}
//         <div>
//           <label htmlFor="message" className="block text-sm font-medium text-gray-700">
//             Message
//           </label>
//           <textarea
//             type="text"
//             id="message"
//             value={message}
//             onChange={(e) => setMessage(e.target.value)}
//             placeholder="Enter your message"
//             className="mt-1 p-2 block w-full border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
//           />
//         </div>

//         {/* Image Upload Input */}
//         <div>
//           <label className="block text-sm font-medium text-gray-700">Images</label>
//           <input
//             type="file"
//             multiple
//             accept="image/*"
//             onChange={handleImageChange}
//             className="mt-1 block w-full text-sm text-gray-900 border border-gray-300 rounded-md cursor-pointer focus:outline-none"
//           />
//         </div>

//         {/* Image Previews */}
//         <div className="flex flex-wrap gap-4">
//           {images.map((image, index) => (
//             <div key={index} className="relative inline-block">
//               <img
//                 src={image.url}
//                 alt={`Preview ${index}`}
//                 className="w-24 h-24 object-cover rounded-md shadow-sm"
//               />
//               <button
//                 type="button"
//                 onClick={() => removeImage(index)}
//                 className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full transform translate-x-1/2 -translate-y-1/2"
//               >
//                 X
//               </button>
//             </div>
//           ))}
//         </div>

//         {/* Submit Button with Loading Spinner */}
//         <button
//           type="submit"
//           className={`w-full py-2 px-4 text-white font-semibold rounded-md shadow-sm transition-colors ${
//             loading ? 'bg-gray-500 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'
//           }`}
//           disabled={loading}
//         >
//           {loading ? (
//             <span className="flex items-center justify-center">
//               <svg
//                 className="animate-spin h-5 w-5 text-white mr-2"
//                 xmlns="http://www.w3.org/2000/svg"
//                 fill="none"
//                 viewBox="0 0 24 24"
//               >
//                 <circle
//                   className="opacity-25"
//                   cx="12"
//                   cy="12"
//                   r="10"
//                   stroke="currentColor"
//                   strokeWidth="4"
//                 ></circle>
//                 <path
//                   className="opacity-75"
//                   fill="currentColor"
//                   d="M4 12a8 8 0 018-8v8H4z"
//                 ></path>
//               </svg>
//               Posting...
//             </span>
//           ) : (
//             'Post'
//           )}
//         </button>
//       </form>
//     </div>
//   );
// };

// export default UserProfile;

import React, { useState } from 'react';
import axiosClient from '../axiosClient';
import { toast } from "react-toastify";

const UserProfile = () => {
  const [message, setMessage] = useState('');
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [postToFacebook, setPostToFacebook] = useState(false); // For Facebook checkbox
  const [postToTelegram, setPostToTelegram] = useState(false); // For Telegram checkbox

  // Handle image selection
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const imageFiles = files.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));
    setImages((prevImages) => [...prevImages, ...imageFiles]);
  };

  // Remove an image by index
  const removeImage = (indexToRemove) => {
    setImages((prevImages) => prevImages.filter((_, index) => index !== indexToRemove));
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append('message', message);
    formData.append('postToFacebook', postToFacebook);
    formData.append('postToTelegram', postToTelegram);

    images.forEach((image) => {
      formData.append('images', image.file);
    });

    try {
      await axiosClient.post('/postToFacebook', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      toast.success('Message and images posted successfully!');

      // Reset form fields
      setMessage('');
      setImages([]);
      setPostToFacebook(false);
      setPostToTelegram(false);
    } catch (error) {
      console.error('Error posting message:', error);
      toast.error('Failed to post message.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-6">Post to Facebook/Telegram</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Message Input */}
        <div>
          <label htmlFor="message" className="block text-sm font-medium text-gray-700">
            Message
          </label>
          <textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Enter your message"
            className="mt-1 p-2 block w-full border rounded-md shadow-sm"
          />
        </div>

        {/* Checkboxes for Posting Options */}
        <div className="flex items-center space-x-4">
          <label>
            <input
              type="checkbox"
              checked={postToFacebook}
              onChange={() => setPostToFacebook(!postToFacebook)}
            />
            Post to Facebook
          </label>
          <label>
            <input
              type="checkbox"
              checked={postToTelegram}
              onChange={() => setPostToTelegram(!postToTelegram)}
            />
            Post to Telegram
          </label>
        </div>

        {/* Submit Button with Loading Spinner */}
        <button
          type="submit"
          className={`w-full py-2 px-4 text-white font-semibold rounded-md shadow-sm transition-colors ${
            loading ? 'bg-gray-500 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'
          }`}
          disabled={loading}
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg
                className="animate-spin h-5 w-5 text-white mr-2"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8H4z"
                ></path>
              </svg>
              Posting...
            </span>
          ) : (
            'Post'
          )}
        </button>
      </form>
    </div>
  );
};

export default UserProfile;


