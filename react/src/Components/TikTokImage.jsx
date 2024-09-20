import React, { useState } from 'react';
import axiosClient from '../axiosClient';
import { toast } from "react-toastify";

const TikTokImage = () => {
  const [message, setMessage] = useState('');
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);

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

  // Merge images with text and download
  const mergeImagesWithText = async () => {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    const totalHeight = 1920; // TikTok height
    const totalWidth = 1080;  // TikTok width
    let imageHeight, imageWidth;

    if (images.length === 1) {
      imageHeight = totalHeight / 2;
      imageWidth = totalWidth; // Full width for one image
    } else if (images.length === 2) {
      imageHeight = totalHeight / 2;
      imageWidth = totalWidth / 2; // Half width for two images
    } else if (images.length === 3) {
      imageHeight = totalHeight / 2; // Upper half for images
      imageWidth = totalWidth; // Full width for one large image
    } else if (images.length === 4) {
      imageHeight = totalHeight / 2; // Upper half for images
      imageWidth = totalWidth / 2; // Quarter width for four images
    }

    canvas.width = totalWidth;
    canvas.height = totalHeight;

    // Load images onto the canvas
    for (let i = 0; i < images.length; i++) {
      const img = new Image();
      img.src = images[i].url;

      await new Promise((resolve) => {
        img.onload = () => {
          if (images.length === 1) {
            context.drawImage(img, 0, 0, imageWidth, imageHeight);
          } else if (images.length === 2) {
            context.drawImage(img, (i * imageWidth), 0, imageWidth, imageHeight);
          } else if (images.length === 3) {
            if (i === 0) {
              context.drawImage(img, 0, 0, imageWidth, imageHeight+10);
            } else {
              const smallImgWidth = imageWidth / 2;
              context.drawImage(img, (smallImgWidth * (i - 1)), imageHeight / 2, smallImgWidth, imageHeight / 2);
            }
          } else if (images.length === 4) {
            const imgHeight = totalHeight / 2; // Top half for images
            context.drawImage(img, (i % 2) * (imageWidth), Math.floor(i / 2) * (imgHeight), imageWidth, imgHeight);
          }
          resolve();
        };
      });
    }

    // Draw white background for text
    context.fillStyle = '#FFFFFF'; // White background
    context.fillRect(0, totalHeight / 2, totalWidth, totalHeight / 2 + 5);

    // Add the text with black font
    context.fillStyle = '#000000'; // Text color black
    context.font = 'normal 50px Arial'; // Bold, larger font
    context.textAlign = 'center';

    // Break the message into lines if it's too long
    const maxTextWidth = totalWidth - 40;
    const words = message.split(' ');
    let line = '';
    const lines = [];
    words.forEach((word) => {
      const testLine = line + word + ' ';
      const metrics = context.measureText(testLine);
      const testWidth = metrics.width;

      if (testWidth > maxTextWidth && line) {
        lines.push(line);
        line = word + ' ';
      } else {
        line = testLine;
      }
    });
    lines.push(line);

    // Draw each line of text
  // Draw each line of text with added spacing
lines.forEach((line, index) => {
  const lineHeight = 60; // Increase line height for more spacing between lines
  context.fillText(line, totalWidth / 2, (totalHeight / 2) + 40 + index * lineHeight);
});


    // Convert canvas to a Blob and trigger a download
    const mergedImage = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = mergedImage;
    link.download = 'tiktok-post.png';
    link.click();
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Call the merge function before posting

    try {
      await mergeImagesWithText();

      

       
     
    } catch (error) {
      console.error('Error posting message:', error);
      toast.error('Failed to post message.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto p-6 ">
      <h1 className="text-2xl font-semibold mb-6">Post to TikTok</h1>

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
            className="mt-1 p-2 block w-full border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>

        {/* Image Upload Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Images</label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageChange}
            className="mt-1 block w-full text-sm text-gray-900 border border-gray-300 rounded-md cursor-pointer focus:outline-none"
          />
        </div>

        {/* Image Previews */}
        <div className="flex flex-wrap gap-4">
          {images.map((image, index) => (
            <div key={index} className="relative inline-block">
              <img
                src={image.url}
                alt={`Preview ${index}`}
                className="w-24 h-24 object-cover rounded-md shadow-sm"
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full transform translate-x-1/2 -translate-y-1/2"
              >
                X
              </button>
            </div>
          ))}
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

export default TikTokImage;  