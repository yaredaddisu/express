
import { useNavigate, useParams } from "react-router-dom";
import axiosClient from "../axiosClient";
import SignatureCanvas from 'react-signature-canvas';
import React, { useState, useRef,useEffect } from 'react';

import { useLocation } from 'react-router-dom';

import { useStateContext } from "../contexts/contextprovider";
import { v4 as uuidv4 } from 'uuid';
export default function UpdateForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  
   
  
  const [user, setUser] = useState({
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
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState(null);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };
  

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
  
  useEffect(() => {
    if (id) {
      setLoading(true);
      axiosClient.get(`/orders/${id}`)
        .then(({ data }) => {
          setUser(data.data);
           setImageUrls({
            signatureFile1: data.signatures.signatureFile1,
            signatureFile2: data.signatures.signatureFile2,
            signatureFile3: data.signatures.signatureFile3,
            signatureFile4: data.signatures.signatureFile4
          });
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
          setErrors("Failed to load data");
        });
    }
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
 
  // const handleMaterialChange = (id, field, value) => {
  //   setUser((prevState) => ({
  //     ...prevState,
  //     materials: prevState.materials.map((material) =>
  //       material.id === id ? { ...material, [field]: value } : material
  //     ),
  //   }));
  // };
// Handler functions 
useEffect(() => {
  // Assuming fetchData returns materials as an array or undefined/null
  const fetchData = async () => {
    const data = await fetchMaterials();
    setUser((prevUser) => ({
      ...prevUser,
      materials: data.materials || [], // Ensure it's an array
    }));
  };

  fetchData();
}, []);
const handleMaterialChange = (id, field, value) => {
  setUser(prevUser => ({
    ...prevUser,
    materials: prevUser.materials.map(material =>
      material.id === id ? { ...material, [field]: value } : material
    )
  }));
};

const handleRemoveMaterial = (id) => {
  setUser(prevUser => ({
    ...prevUser,
    materials: prevUser.materials.filter(material => material.id !== id)
  }));
};

const addMaterial = () => {
  setUser(prevUser => ({
    ...prevUser,
    materials: [
      ...prevUser.materials,
      { id: Date.now(), materialUsed: "", mst: "", qty: "", remark: "" }
    ]
  }));
};


const onSubmit = async ev => {
  ev.preventDefault();
  
   // Create a new FormData object
   const formData = new FormData();

   // Append image if available
   if (image) {
     formData.append('image', image);
   }
 
   // Append signature files if available
   Object.keys(signatureFiles).forEach(key => {
     if (signatureFiles[key]) {
       formData.append(key, signatureFiles[key]);
     }
   });
 
   // Append other form data
   Object.keys(user).forEach(key => {
     if (user[key] !== undefined && user[key] !== null) {
       formData.append(key, user[key]);
     }
   });
 
  setLoading(true);
  setUploadStatus('Uploading...');

  try {
    let response;

    if (id) {
      formData.append('_method', 'put');

      response = await axiosClient.post(`/orders/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      // Automatically fetch updated data after a successful update
      const { data } = await axiosClient.get(`/orders/${id}`, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setUser(data.data);
    } else {
      response = await axiosClient.post('/orders', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    }

    console.log('Files uploaded successfully:', response.data);
    navigate(`/orders/${id || response.data.id}`);
  } catch (error) {
    const response = error.response;

    if (response && response.status === 422) {
      setErrors(response.data.errors);
    } else {
      setErrors("An unexpected error occurred.");
    }
  } finally {
    setLoading(false);
  }
};


  return (
    <>
  <div className="container">
  <h1>MTS Trading PLC</h1>
  <h2>HVAC Services</h2>
  <h3>Job Order and Validation Sheet</h3>

  {id ? <h1>Update Order: {user.jobAssessmentNo}</h1> : <h1>New Order</h1>}
  <div className="card animated fadeInDown">
    {loading && <div className="text-center">Loading...</div>}
    {errors && (
      <div className="alert">
        {typeof errors === "string" ? <p>{errors}</p> : Object.keys(errors).map(key => (<p key={key}>{errors[key][0]}</p>))}
      </div>
    )}
    {!loading && (
      <form onSubmit={onSubmit} className="hvac-form" encType="multipart/form-data">
        <h4>General Information</h4>
        <div className="form-group">
          <div className="form-row">
            <label htmlFor="jobAssessmentNo">Job Assessment No</label>
            <input type="text" id="jobAssessmentNo" name="jobAssessmentNo" value={user.jobAssessmentNo} onChange={ev => setUser({ ...user, jobAssessmentNo: ev.target.value })} />
          </div>
          <div className="form-row">
            <label htmlFor="typeOfService">Type of Service</label>
            <input type="text" id="typeOfService" name="typeOfService" value={user.typeOfService} onChange={ev => setUser({ ...user, typeOfService: ev.target.value })} />
          </div>
          <div className="form-row">
            <label htmlFor="clientName">Client Name</label>
            <input type="text" id="clientName" name="clientName" value={user.clientName} onChange={ev => setUser({ ...user, clientName: ev.target.value })} />
          </div>
          <div className="form-row">
            <label htmlFor="startDate">Start Date</label>
            <input type="date" id="startDate" name="startDate" value={user.startDate} onChange={ev => setUser({ ...user, startDate: ev.target.value })} />
          </div>
          <div className="form-row">
            <label htmlFor="branch">Branch</label>
            <input type="text" id="branch" name="branch" value={user.branch} onChange={ev => setUser({ ...user, branch: ev.target.value })} />
          </div>
          <div className="form-row">
            <label htmlFor="startTime">Start Time</label>
            <input type="time" id="startTime" name="startTime" value={user.startTime} onChange={ev => setUser({ ...user, startTime: ev.target.value })} />
          </div>
          <div className="form-row">
            <label htmlFor="endTime">End Time</label>
            <input type="time" id="endTime" name="endTime" value={user.endTime} onChange={ev => setUser({ ...user, endTime: ev.target.value })} />
          </div>
          <div className="form-row">
            <label htmlFor="telephone">Telephone</label>
            <input type="tel" id="telephone" name="telephone" value={user.telephone} onChange={ev => setUser({ ...user, telephone: ev.target.value })} />
          </div>
          <div className="form-row">
            <label htmlFor="supervisorName">Supervisor Name</label>
            <input type="text" id="supervisorName" name="supervisorName" value={user.supervisorName} onChange={ev => setUser({ ...user, supervisorName: ev.target.value })} />
          </div>
        </div>

        {/* Signature Section */}
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
         
        </div>

        <div className="form-group">
          <div className="form-row">
            <label htmlFor="typesOfWork">Correction</label>
            <select id="typesOfWork" name="typesOfWork" value={user.typesOfWork} onChange={ev => setUser({ ...user, typesOfWork: ev.target.value })}>
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
            <input type="text" id="typesOfMachine" name="typesOfMachine" value={user.typesOfMachine} onChange={ev => setUser({ ...user, typesOfMachine: ev.target.value })} />
          </div>
          <div className="form-row">
            <label htmlFor="temperature">Temperature In °C</label>
            <input type="text" id="temperature" name="temperature" value={user.temperature} onChange={ev => setUser({ ...user, temperature: ev.target.value })} />
          </div>
          <div className="form-row">
            <label htmlFor="natureOfProblem">Nature of Problem (Problem Description)</label>
            <input type="text" id="natureOfProblem" name="natureOfProblem" value={user.natureOfProblem} onChange={ev => setUser({ ...user, natureOfProblem: ev.target.value })} style={{ width: '100%' }} />
          </div>
          <div className="form-row">
            <label htmlFor="detailProblemReported">Detail Problem Reported</label>
            <textarea id="detailProblemReported" name="detailProblemReported" value={user.detailProblemReported} onChange={ev => setUser({ ...user, detailProblemReported: ev.target.value })} style={{ width: '100%' }} />
          </div>
        </div>

        <h2>Technical Service Procedure</h2>
        <div className="form-group">
          <div className="form-row">
            <label htmlFor="serviceRendered">Service Rendered</label>
            <textarea id="serviceRendered" name="serviceRendered" value={user.serviceRendered} onChange={ev => setUser({ ...user, serviceRendered: ev.target.value })} style={{ width: '100%' }} />
          </div>
        </div>

        {/* Materials Table */}
        <div>
  <label>Materials and Spare Parts Used:</label>
  {user.materials?.map((material) => (
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
        placeholder="Remark"
      />
      <button type="button" onClick={() => handleRemoveMaterial(material.id)}>Remove</button>
    </div>
  )) || <p>No materials added yet.</p>} {/* Default content when materials is empty */}
  <button type="button" onClick={addMaterial}>
    Add Material
  </button>
</div>


        <h2>Performance Assurance</h2>
        <textarea name="performanceAssurance" value={user.performanceAssurance} onChange={ev => setUser({ ...user, performanceAssurance: ev.target.value })} style={{ width: '100%' }} />

        <h2>Customer Comment</h2>
        <textarea name="customerComment" value={user.customerComment} onChange={ev => setUser({ ...user, customerComment: ev.target.value })} style={{ width: '100%' }} />

        {/* Signature Section */}
        <div className="signature-section">
          <div className="signature-field">
            <label>Executed By Signature:</label>
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
        
        </div>
        <div>
    
        <input type="file" accept="image/*" onChange={handleImageChange} />
        {preview && (
          <div>
            <img src={preview} alt="Selected" style={{ maxWidth: '300px', marginTop: '10px' }} />
          </div>
        )}
        <button type="submit">Upload Image</button>
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
    </div>
        <div className="form-actions">
          <button type="submit" className="btn">Submit</button>
        </div>
      </form>
    )}
  </div>
</div>

    </>
  );
}
