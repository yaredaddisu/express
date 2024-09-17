import React, { useState, useEffect } from 'react';
import axiosClient from '../axiosClient';
import { useParams } from 'react-router-dom';

const ImageUpload = () => {
  const [signatureFiles, setSignatureFiles] = useState({
    signatureFile1: null,
    signatureFile2: null,
    signatureFile3: null,
    signatureFile4: null
  });
  const [previews, setPreviews] = useState({
    signatureFile1: '',
    signatureFile2: '',
    signatureFile3: '',
    signatureFile4: ''
  });
  const [imageUrls, setImageUrls] = useState({
    signatureFile1: '',
    signatureFile2: '',
    signatureFile3: '',
    signatureFile4: ''
  });
  const [uploadStatus, setUploadStatus] = useState('');
  const { id } = useParams();

  useEffect(() => {
    // Fetch existing image URLs from the server
    const fetchImages = async () => {
      try {
        const response = await axiosClient.get(`/signatures/${id}`); // Adjust the endpoint as needed
        const { data } = response.data;
        setImageUrls({
          signatureFile1: data.signatureFile1,
          signatureFile2: data.signatureFile2,
          signatureFile3: data.signatureFile3,
          signatureFile4: data.signatureFile4
        });
      } catch (error) {
        console.error('Error fetching images:', error);
      }
    };

    fetchImages();
  }, [id]);

  const handleFileChange = (e, fileKey) => {
    const file = e.target.files[0];
    setSignatureFiles(prevState => ({
      ...prevState,
      [fileKey]: file
    }));

    // Generate a preview URL for the file
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setPreviews(prevState => ({
        ...prevState,
        [fileKey]: previewUrl
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const formData = new FormData();
    Object.keys(signatureFiles).forEach(key => {
      if (signatureFiles[key]) {
        formData.append(key, signatureFiles[key]);
      }
    });
    if (id) {
      formData.append('id', id); 
    }
  
    try {
      setUploadStatus('Uploading...');
      let response;
  
      if (id) {
        formData.append('_method', 'put');

        response = await axiosClient.post(`/signatures/${id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        response = await axiosClient.post('/upload-signatures', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }
  
      setUploadStatus('Files uploaded successfully!');
      console.log('Files uploaded successfully:', response.data);
    } catch (error) {
      setUploadStatus('Error uploading files.');
      console.error('Error uploading files:', error);
    }
  };
  
  

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Signature File 1:</label>
        <input
          type="file"
          onChange={(e) => handleFileChange(e, 'signatureFile1')}
        />
        {previews.signatureFile1 ? (
          <img src={previews.signatureFile1} alt="Preview 1" style={{ maxWidth: '300px', marginTop: '10px' }} />
        ) : (
          imageUrls.signatureFile1 && <img src={imageUrls.signatureFile1} alt="Existing 1" style={{ maxWidth: '300px', marginTop: '10px' }} />
        )}
      </div>
      <div>
        <label>Signature File 2:</label>
        <input
          type="file"
          onChange={(e) => handleFileChange(e, 'signatureFile2')}
        />
        {previews.signatureFile2 ? (
          <img src={previews.signatureFile2} alt="Preview 2" style={{ maxWidth: '300px', marginTop: '10px' }} />
        ) : (
          imageUrls.signatureFile2 && <img src={imageUrls.signatureFile2} alt="Existing 2" style={{ maxWidth: '300px', marginTop: '10px' }} />
        )}
      </div>
      <div>
        <label>Signature File 3:</label>
        <input
          type="file"
          onChange={(e) => handleFileChange(e, 'signatureFile3')}
        />
        {previews.signatureFile3 ? (
          <img src={previews.signatureFile3} alt="Preview 3" style={{ maxWidth: '300px', marginTop: '10px' }} />
        ) : (
          imageUrls.signatureFile3 && <img src={imageUrls.signatureFile3} alt="Existing 3" style={{ maxWidth: '300px', marginTop: '10px' }} />
        )}
      </div>
      <div>
        <label>Signature File 4:</label>
        <input
          type="file"
          onChange={(e) => handleFileChange(e, 'signatureFile4')}
        />
        {previews.signatureFile4 ? (
          <img src={previews.signatureFile4} alt="Preview 4" style={{ maxWidth: '300px', marginTop: '10px' }} />
        ) : (
          imageUrls.signatureFile4 && <img src={imageUrls.signatureFile4} alt="Existing 4" style={{ maxWidth: '300px', marginTop: '10px' }} />
        )}
      </div>
      <button type="submit">Upload Signatures</button>
      {uploadStatus && <p>{uploadStatus}</p>}
    </form>
  );
};

export default ImageUpload;
