import React, { useState, useRef, useEffect } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import axiosClient from "../axiosClient";
import { useNavigate } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import { useStateContext } from "../contexts/contextprovider";
import { v4 as uuidv4 } from 'uuid';
import { toast } from "react-toastify";
const parseJwt = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/'); // Fix URL encoding
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Failed to decode JWT:', error);
    return null;
  }
};
const HVACForm = () => {
  const { user, setUser } = useStateContext();
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const navigate = useNavigate();

  const queryParams = new URLSearchParams(location.search);
  const taskId = queryParams.get("id");
  console.log(taskId); // Will log the taskId

  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token'); // Assuming you stored your JWT in local storage

    if (token) {
      const decodedToken = parseJwt(token);
      setUserId(decodedToken.userId); // Assuming userId is a field in the token

    }

  }, [userId]); // Re-fetch tasks when userId changes

  const [error, setError] = useState('');
  // const password = decodeURIComponent(query.get('chat_id')) || ''; // Default empty string if null
  // const email = decodeURIComponent(query.get('email')) || ''; // Default empty string if null

  const generateRef = () => {
    const randomPart = Math.random().toString(36).substring(2, 10).toUpperCase(); // Generates a random string
    const timePart = Date.now().toString(36).toUpperCase(); // Converts current time to a base-36 string
    return `${randomPart}-${timePart}`; // Combine the parts for a unique reference
  };

  // Usage
  // const ref = generateRef();
  // console.log(ref); // Example output: "A1B2C3D4-E5F6G7H8"

  // useEffect(() => {
  //   axiosClient.get('/user')
  //     .then(({data}) => {
  //        setUser(data)
  //     })
  // }, [])

  const initialFormData = {
    jobAssessmentNo: '',
    typeOfService: '',
    clientName: '',
    startDate: '',
    branch: '',
    startTime: '',
    endTime: '',
    telephone: '',
    supervisorName: '',
    typesOfWork: '',
    typesOfMachine: '',
    temperature: '',
    natureOfProblem: '',
    detailProblemReported: '',
    serviceRendered: '',
    materials: [],
    performanceAssurance: '',
    customerComment: '',
    executedBy: '',
    executedByPosition: '',
    executedByDate: '',
    checkedBy: '',
    checkedByPosition: '',
    checkedByDate: '',
    approvedBy: '',
    approvedByPosition: '',
    approvedByDate: '',
    user_id: userId,
    reference: generateRef(),
    job_id: taskId
  };


  const handleLogin = async (ev) => {
    if (ev) ev.preventDefault(); // Prevent default form submission behavior

    if (!email || !password) {
      console.log('Email and password are required.');
      return;
    }

    const payload = {
      email: email,
      password: password,
    };

    try {
      const { data } = await axiosClient.post("/login", payload);
      setUser(data.user);
      setToken(data.token);
    } catch (err) {
      const response = err.response;
      if (response && response.status === 422) {
        console.log(response.data.errors);
      } else {
        console.error('An error occurred:', err);
      }
    }
  };

  // useEffect(() => {
  //     // Trigger login only if both email and password are available
  //     if (email && password) {
  //         handleLogin();
  //     }
  // }, [email, password]);

  const [formData, setFormData] = useState(initialFormData);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);

  const [isSignatureDrawn, setIsSignatureDrawn] = useState({
    signatureFile1: false,
    signatureFile2: false,
    signatureFile3: false,
    signatureFile4: false,
  });

  const [signatureFiles, setSignatureFiles] = useState({
    signatureFile1: null,
    signatureFile2: null,
    signatureFile3: null,
    signatureFile4: null,
  });

  const signatureCanvasRefs = {
    signatureFile1: useRef(null),
    signatureFile2: useRef(null),
    signatureFile3: useRef(null),
    signatureFile4: useRef(null),
  };

  const fileInputRefs = {
    signatureFile1: useRef(null),
    signatureFile2: useRef(null),
    signatureFile3: useRef(null),
    signatureFile4: useRef(null),
  };

  const handleSignature = (fileKey) => {
    setIsSignatureDrawn((prevState) => ({
      ...prevState,
      [fileKey]: !signatureCanvasRefs[fileKey].current.isEmpty(),
    }));
  };

  const handleClearSignature = (fileKey) => {
    signatureCanvasRefs[fileKey].current.clear();
    setIsSignatureDrawn((prevState) => ({
      ...prevState,
      [fileKey]: false,
    }));
    setSignatureFiles((prevState) => ({
      ...prevState,
      [fileKey]: null,
    }));
    if (fileInputRefs[fileKey].current) {
      fileInputRefs[fileKey].current.value = ''; // Clear the file input field
    }
  };

  const handleFileChange = (e, fileKey) => {
    const file = e.target.files[0];
    if (file) {
      setSignatureFiles((prevState) => ({
        ...prevState,
        [fileKey]: file,
      }));
      setIsSignatureDrawn((prevState) => ({
        ...prevState,
        [fileKey]: false,
      }));
    }
  };

  const handleMaterialChange = (id, field, value) => {
    setFormData(prevState => ({
      ...prevState,
      materials: prevState.materials.map(material =>
        material.id === id ? { ...material, [field]: value } : material
      )
    }));
  };

  const handleRemoveMaterial = (id) => {
    setFormData(prevState => ({
      ...prevState,
      materials: prevState.materials.filter(material => material.id !== id)
    }));
  };

  const addMaterial = () => {
    setFormData(prevState => ({
      ...prevState,
      materials: [
        ...prevState.materials,
        { id: Date.now(), materialUsed: '', mst: '', qty: '', remark: '' }
      ]
    }));
  };
  const handleRemoveFile = (fileKey) => {
    setSignatureFiles((prevState) => ({
      ...prevState,
      [fileKey]: null,
    }));
    if (fileInputRefs[fileKey].current) {
      fileInputRefs[fileKey].current.value = ''; // Clear the file input field
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const resizeImage = (image, maxWidth, maxHeight) => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(maxWidth / img.width, maxHeight / img.height);
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => {
          resolve(blob);
        }, 'image/png');
      };
      img.src = image;
    });
  };

  const getSignatureBlob = async (fileKey) => {
    if (isSignatureDrawn[fileKey]) {
      const signatureDataUrl = signatureCanvasRefs[fileKey].current.toDataURL('image/png');
      return await resizeImage(signatureDataUrl, 300, 100);
    } else if (signatureFiles[fileKey]) {
      const fileUrl = URL.createObjectURL(signatureFiles[fileKey]);
      return await resizeImage(fileUrl, 300, 100);
    }
    return null;
  };
  const { id } = useParams();
  const [userData, setUserData] = useState(null);
  const buttonText = id ? 'Update' : 'Submit';

  // useEffect(() => {
  //   const fetchUserData = async () => {
  //     try {
  //       const response = await axiosClient.get(`/orders/${id}`);
  //       setFormData(response.data.data); // Assuming response.data contains the form data
  //       console.log(response.data.data);
  //       setIsLoading(false); // Set loading state to true

  //     } catch (error) {
  //       console.error('Failed to fetch user data:', error);
  //       // Handle the error as needed
  //     }
  //   };

  //   fetchUserData();
  // }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true); // Set loading state to true

    const formDataToSubmit = new FormData();

    // Add each form field, ensuring that empty fields are also included
    const fields = {
      jobAssessmentNo: formData.jobAssessmentNo || '',
      typeOfService: formData.typeOfService || '',
      clientName: formData.clientName || '',
      startDate: formData.startDate || '',
      branch: formData.branch || '',
      startTime: formData.startTime || '',
      endTime: formData.endTime || '',
      telephone: formData.telephone || '',
      supervisorName: formData.supervisorName || '',
      typesOfWork: formData.typesOfWork || '',
      typesOfMachine: formData.typesOfMachine || '',
      temperature: formData.temperature || '',
      natureOfProblem: formData.natureOfProblem || '',
      detailProblemReported: formData.detailProblemReported || '',
      serviceRendered: formData.serviceRendered || '',
      performanceAssurance: formData.performanceAssurance || '',
      customerComment: formData.customerComment || '',
      executedBy: formData.executedBy || '',
      executedByPosition: formData.executedByPosition || '',
      executedByDate: formData.executedByDate || '',
      checkedBy: formData.checkedBy || '',
      checkedByPosition: formData.checkedByPosition || '',
      checkedByDate: formData.checkedByDate || '',
      approvedBy: formData.approvedBy || '',
      approvedByPosition: formData.approvedByPosition || '',
      approvedByDate: formData.approvedByDate || '',
      user_id: userId,
      reference: generateRef(),
      job_id: formData.job_id || '',
    };

    // Append all fields to FormData
    for (const [key, value] of Object.entries(fields)) {
      formDataToSubmit.append(key, value);
    }

    // Handle the materials array
    if (formData.materials && formData.materials.length > 0) {
      formDataToSubmit.append('materials', JSON.stringify(formData.materials));
    }


    // Add signature files, even if null
    for (const fileKey of Object.keys(signatureFiles)) {
      const signatureBlob = await getSignatureBlob(fileKey);
      if (signatureBlob) {
        formDataToSubmit.append(fileKey, signatureBlob, `${fileKey}.png`);
      }
    }

    try {
      let response;
      if (id) {
        console.log('Updating existing order...'); // Log before making the update request
        response = await axiosClient.put(`/orders/${id}`, formDataToSubmit);
        console.log('Form updated successfully:', response.data.data); // This log should happen after the response
        setIsLoading(false); // Set loading state to false
        setSuccess(response.data.message); // Set success message from server
        toast.success(response.data.message)
        // Navigate after successful update
        navigate(`/orders/${response.data.insertId}`);
      } else {
        console.log('Creating new order...'); // Log before making the create request
        response = await axiosClient.post('/orders', formDataToSubmit);
        console.log('Form submitted successfully:', response.data.data); // This log should happen after the response
        setIsLoading(false); // Set loading state to false
        setSuccess(response.data.message); // Set success message from server
        toast.success(response.data.message)
        // Navigate to the new order's page
        navigate(`/orders/${response.data.insertId}`);
      }
    } catch (error) {
      setIsLoading(false); // Set loading state to false
      console.error('Error occurred:', error); // Add a log here to inspect the error
    
      const response = error.response;
      if (response && response.status === 422) {
        console.log('Validation errors:', response.data.errors); // Log validation errors if any
        setErrors(response.data.errors);
        toast.error(response.data.errors)

      } else {
        console.log('Unexpected error:', error.response.data.message); // Log the unexpected error
      
        toast.error(error.response.data.message)
      }
    } finally {
      setIsLoading(false); // Set loading state to false (just to ensure loading is stopped)
    }
    
  };



  setTimeout(() => {
    setErrors(null); // Clear the errors

    setSuccess(null); // Clear the errors

  }, 7000);


  if (!formData) {
    return <div>Loading...</div>;
  }

  return (

    <div className="container">
      <h1 className="text-xl font-bold">MTS Trading PLC</h1>
      <h2 className="text-xl font-bold">HVAC Services</h2>
      <h3 className="text-lg font-bold">Job Order and Validation Sheet</h3>
      {loading && <div className="text-center">Loading...</div>}
      {errors && (
        <div className="alert">
          {typeof errors === "string" ? <p>{errors}</p> : Object.keys(errors).map(key => (<p key={key}>{errors[key][0]}</p>))}
        </div>
      )}

      {success && (
        <div className="danger">
          {typeof success === "string" ? <p>{success}</p> : Object.keys(success).map(key => (<p key={key}>{success[key][0]}</p>))}
        </div>
      )}
      {!loading && (
        <form onSubmit={handleSubmit} className="hvac-form">
          <h4>General Information</h4>
          <div className="form-group">
            <div className="form-row">
              <label htmlFor="job_id">Job Id</label>
              <input type="number" disabled required id="job_id" name="job_id" value={formData.job_id} onChange={handleChange} />
            </div>
            <div className="form-row">
              <label htmlFor="jobAssessmentNo">Job Assessment No</label>
              <input type="text" id="jobAssessmentNo" name="jobAssessmentNo" value={formData.jobAssessmentNo} onChange={handleChange} />
            </div>
            <div className="form-row">
              <label htmlFor="typeOfService">Type of Service</label>
              <input type="text" id="typeOfService" name="typeOfService" value={formData.typeOfService} onChange={handleChange} />
            </div>
            <div className="form-row">
              <label htmlFor="clientName">Client Name</label>
              <input type="text" id="clientName" name="clientName" value={formData.clientName} onChange={handleChange} />
            </div>
            <div className="form-row">
              <label htmlFor="startDate">Start Date</label>
              <input type="date" id="startDate" name="startDate" value={formData.startDate} onChange={handleChange} />
            </div>
            <div className="form-row">
              <label htmlFor="branch">Branch</label>
              <input type="text" id="branch" name="branch" value={formData.branch} onChange={handleChange} />
            </div>
            <div className="form-row">
              <label htmlFor="startTime">Start Time</label>
              <input type="time" id="startTime" name="startTime" value={formData.startTime} onChange={handleChange} />
            </div>

            <div className="form-row">
              <label htmlFor="endTime">End Time</label>
              <input type="time" id="endTime" name="endTime" value={formData.endTime} onChange={handleChange} />
            </div>
            <div className="form-row">
              <label htmlFor="telephone">Telephone</label>
              <input type="tel" id="telephone" name="telephone" value={formData.telephone} onChange={handleChange} />
            </div>
            <div className="form-row">
              <label htmlFor="supervisorName">Supervisor Name</label>
              <input type="text" id="supervisorName" name="supervisorName" value={formData.supervisorName} onChange={handleChange} />
            </div>


            {/* Signature 4 */}
            <div className="signature-section">
              <div className="signature-field">
                <label>Signature:</label>
                <SignatureCanvas
                  penColor="black"
                  canvasProps={{ className: 'sigCanvas' }}
                  onEnd={() => handleSignature('signatureFile4')}
                  ref={signatureCanvasRefs.signatureFile4}
                />
                <button type="button" onClick={() => handleClearSignature('signatureFile4')}>
                  Clear Signature
                </button>
              </div>
              <div className="file">
                <label>Upload Signature:</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, 'signatureFile4')}
                  ref={fileInputRefs.signatureFile4}
                  placeholder="Upload Signature"
                  disabled={isSignatureDrawn.signatureFile4}
                />
                {signatureFiles.signatureFile4 && (
                  <div>
                    <img src={URL.createObjectURL(signatureFiles.signatureFile4)} alt="Signature preview" />
                    <button type="button" onClick={() => handleRemoveFile('signatureFile4')}>
                      X
                    </button>
                  </div>
                )}
              </div>
            </div>

          </div>
          <div className="form-group">
            <div className="form-row">
              <label htmlFor="typesOfWork">Correction</label>
              <select id="typesOfWork" name="typesOfWork" value={formData.typesOfWork} onChange={handleChange}>
                <option value="">Select a type</option>
                <option value="Correction">Correction</option>
                <option value="Installation">Installation</option>
                <option value="Prevention">Prevention</option>
              </select>
            </div>


          </div>

          <h2>HVAC-R Services</h2>
          <div className="form-group">
            <div className="form-row">
              <label htmlFor="typesOfMachine">Types of Machine</label>
              <input type="text" id="typesOfMachine" name="typesOfMachine" value={formData.typesOfMachine} onChange={handleChange} />
            </div>
            <div className="form-row">
              <label htmlFor="temperature">Temperature In °C</label>
              <input type="text" id="temperature" name="temperature" value={formData.temperature} onChange={handleChange} />
            </div>
            <div className="form-row">
              <label htmlFor="natureOfProblem">Nature of Problem (Problem Description)</label>
              <input type="text" id="natureOfProblem" name="natureOfProblem" value={formData.natureOfProblem} onChange={handleChange} style={{ width: '100%' }} />
            </div>
            <div className="form-row">
              <label htmlFor="detailProblemReported">Detail Problem Reported</label>
              <textarea id="detailProblemReported" name="detailProblemReported" value={formData.detailProblemReported} onChange={handleChange} style={{ width: '100%' }} />
            </div>
          </div>

          <h2>Technical Service Procedure</h2>
          <div className="form-group">
            <div className="form-row">
              <label htmlFor="serviceRendered">Service Rendered</label>
              <textarea id="serviceRendered" name="serviceRendered" value={formData.serviceRendered} onChange={handleChange} style={{ width: '100%' }} />
            </div>
          </div>


          {/* Materials Table */}
          <div>
            <label>Materials and Spare Parts Used:</label>
            {formData.materials.map((material) => (
              <div key={material.id} className="material-row">
                <input
                  className="material-input"
                  type="text"
                  value={material.materialUsed}
                  onChange={(e) => handleMaterialChange(material.id, 'materialUsed', e.target.value)}
                  placeholder="Material Used"
                />
                <input
                  className="material-input"
                  type="number"
                  value={material.mst}
                  onChange={(e) => handleMaterialChange(material.id, 'mst', e.target.value)}
                  placeholder="MST"
                />
                <input
                  className="material-input"
                  type="number"
                  value={material.qty}
                  onChange={(e) => handleMaterialChange(material.id, 'qty', e.target.value)}
                  placeholder="Qty"
                />
                <input
                  className="material-input"
                  type="text"
                  value={material.remark}
                  onChange={(e) => handleMaterialChange(material.id, 'remark', e.target.value)}
                  placeholder="Remark (Replaced, Repaired, Reconfigured, Reinstallation…)"
                />
                <button
                  className={`bg-red-500 hover:bg-red-600 text-xs mt-3 mb-3 text-white font-medium py-2 px-4 rounded-md shadow-md transition duration-200 ease-in-out }`}
                  type="button"
                  onClick={() => handleRemoveMaterial(material.id)}
                  disabled={isLoading}
                >
                  Remove
                </button>

              </div>
            )) || <p>No materials added yet.</p>} {/* Default content when materials is empty */}



            <button
              className={`bg-green-600 hover:bg-green-700 text-xs mt-3 text-white font-medium py-2 px-4 rounded-md shadow-md transition duration-200 ease-in-out }`}
              type="button"
              onClick={addMaterial}
              disabled={isLoading}
            >
              Add Material
            </button>
          </div>
          <h2>Performance Assurance</h2>
          <textarea name="performanceAssurance" value={formData.performanceAssurance} onChange={handleChange} style={{ width: '100%' }} />

          <h2>For Customer Purpose Only</h2>
          <textarea name="customerComment" placeholder='Customer Comment:' value={formData.customerComment} onChange={handleChange} style={{ width: '100%' }} />


          {/* Section 1: Executed By */}
          <h2>Executed By</h2>
          <div className="form-group">
            <label>Executed By:</label>
            <input
              type="text"
              name="executedBy"
              value={formData.executedBy}
              onChange={handleChange}
            />
            <label>Position:</label>
            <input
              type="text"
              name="executedByPosition"
              value={formData.executedByPosition}
              onChange={handleChange}
            />
            <label>Date:</label>
            <input
              type="date"
              name="executedByDate"
              value={formData.executedByDate}
              onChange={handleChange}
            />
          </div>

          {/* Signature 1 */}
          <div className="signature-section">
            <div className="signature-field">
              <label>Signature:</label>
              <SignatureCanvas
                penColor="black"
                canvasProps={{ className: 'sigCanvas' }}
                onEnd={() => handleSignature('signatureFile1')}
                ref={signatureCanvasRefs.signatureFile1}
              />
              <button type="button" onClick={() => handleClearSignature('signatureFile1')}>
                Clear Signature
              </button>
            </div>
            <div className="file">
              <label>Upload Signature:</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e, 'signatureFile1')}
                ref={fileInputRefs.signatureFile1}
                placeholder="Upload Signature"
                disabled={isSignatureDrawn.signatureFile1}
              />
              {signatureFiles.signatureFile1 && (
                <div>
                  <img src={URL.createObjectURL(signatureFiles.signatureFile1)} alt="Signature preview" />
                  <button type="button" onClick={() => handleRemoveFile('signatureFile1')}>
                    X
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Section 2: Checked By */}
          <h2>Checked By</h2>
          <div className="form-group">
            <label>Checked By:</label>
            <input
              type="text"
              name="checkedBy"
              value={formData.checkedBy}
              onChange={handleChange}
            />
            <label>Position:</label>
            <input
              type="text"
              name="checkedByPosition"
              value={formData.checkedByPosition}
              onChange={handleChange}
            />
            <label>Date:</label>
            <input
              type="date"
              name="checkedByDate"
              value={formData.checkedByDate}
              onChange={handleChange}
            />
          </div>

          {/* Signature 2 */}
          <div className="signature-section">
            <div className="signature-field">
              <label>Signature:</label>
              <SignatureCanvas
                penColor="black"
                canvasProps={{ className: 'sigCanvas' }}
                onEnd={() => handleSignature('signatureFile2')}
                ref={signatureCanvasRefs.signatureFile2}
              />
              <button type="button" onClick={() => handleClearSignature('signatureFile2')}>
                Clear Signature
              </button>
            </div>
            <div className="file">
              <label>Upload Signature:</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e, 'signatureFile2')}
                ref={fileInputRefs.signatureFile2}
                placeholder="Upload Signature"
                disabled={isSignatureDrawn.signatureFile2}
              />
              {signatureFiles.signatureFile2 && (
                <div>
                  <img src={URL.createObjectURL(signatureFiles.signatureFile2)} alt="Signature preview" />
                  <button type="button" onClick={() => handleRemoveFile('signatureFile2')}>
                    X
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Section 3: Approved By */}
          <h2>Approved By</h2>
          <div className="form-group">
            <label>Approved By:</label>
            <input
              type="text"
              name="approvedBy"
              value={formData.approvedBy}
              onChange={handleChange}
            />
            <label>Position:</label>
            <input
              type="text"
              name="approvedByPosition"
              value={formData.approvedByPosition}
              onChange={handleChange}
            />
            <label>Date:</label>
            <input
              type="date"
              name="approvedByDate"
              value={formData.approvedByDate}
              onChange={handleChange}
            />
          </div>

          {/* Signature 3 */}
          <div className="signature-section">
            <div className="signature-field">
              <label>Signature:</label>
              <SignatureCanvas
                penColor="black"
                canvasProps={{ className: 'sigCanvas' }}
                onEnd={() => handleSignature('signatureFile3')}
                ref={signatureCanvasRefs.signatureFile3}
              />
              <button type="button" onClick={() => handleClearSignature('signatureFile3')}>
                Clear Signature
              </button>
            </div>
            <div className="file">
              <label>Upload Signature:</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e, 'signatureFile3')}
                ref={fileInputRefs.signatureFile3}
                placeholder="Upload Signature"
                disabled={isSignatureDrawn.signatureFile3}
              />
              {signatureFiles.signatureFile3 && (
                <div>
                  <img src={URL.createObjectURL(signatureFiles.signatureFile3)} alt="Signature preview" />
                  <button type="button" onClick={() => handleRemoveFile('signatureFile3')}>
                    X
                  </button>
                </div>
              )}
            </div>
          </div>

          <button
            className={`bg-green-500 mt-2 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded shadow-lg transition duration-200 ease-in-out   }`}
            type="submit"
            onClick={handleSubmit} disabled={isLoading}

          >
            {isLoading ? 'Loading...' : buttonText}</button>



        </form>
      )}
    </div>
  );
};

export default HVACForm;
