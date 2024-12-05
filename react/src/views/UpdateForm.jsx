
import { useNavigate, useParams } from "react-router-dom";
import axiosClient from "../axiosClient";
import SignatureCanvas from 'react-signature-canvas';
import React, { useState, useRef,useEffect } from 'react';
import { Link } from "react-router-dom";
import { jsPDF } from 'jspdf';
import { useLocation } from 'react-router-dom';
import { useStateContext } from "../contexts/contextprovider";
import { v4 as uuidv4 } from 'uuid';


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
export default function UpdateForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [approved, setApproved] = useState(false);

  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token'); // Assuming you stored your JWT in local storage

    if (token) {
        const decodedToken = parseJwt(token);
        setUserId(decodedToken.userId); // Assuming userId is a field in the token
       
    }

}, [userId]); // Re-fetch tasks when userId changes

  const [formData, setForm] = useState({
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
    user_id:userId,
    reference: '',
    job_id:null,
    approved:approved
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState(null);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useStateContext();

  const handleCheckboxChange = (event) => {
      setApproved(event.target.checked);
  };
 
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };
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
  
  const fetchData = (id) => {

    if (id) {
      setLoading(true);
      axiosClient.get(`/orders/${id}`)
        .then(({ data }) => {
          setForm(data);
       
          console.log(data.signatureFile1)

           setImageUrls({
            signatureFile1: data.signatureFile1,
            signatureFile2: data.signatureFile2,
            signatureFile3: data.signatureFile3,
            signatureFile4: data.signatureFile4
          });
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
          setErrors("Failed to load data");
        });
    }
  }

  useEffect(() => {
    fetchData(id)
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
  //   setForm((prevState) => ({
  //     ...prevState,
  //     materials: prevState.materials.map((material) =>
  //       material.id === id ? { ...material, [field]: value } : material
  //     ),
  //   }));
  // };
// Handler functions 
// useEffect(() => {
//   // Assuming fetchData returns materials as an array or undefined/null
//   const fetchData = async () => {
//     const data = await fetchMaterials();
//     setForm((prevUser) => ({
//       ...prevUser,
//       materials: data.materials || [], // Ensure it's an array
//     }));
//   };

//   fetchData();
// }, []);

const handleMaterialChange = (id, field, value) => {
  setForm(prevState => ({
    ...prevState,
    materials: prevState.materials.map(material =>
      material.id === id ? { ...material, [field]: value } : material
    )
  }));
};

const handleRemoveMaterial = (id) => {
  setForm(prevState => ({
    ...prevState,
    materials: prevState.materials.filter(material => material.id !== id)
  }));
};

const addMaterial = () => {
  setForm((prevState) => ({
    ...prevState,
    materials: [...(prevState.materials || []), { id: uuidv4(), materialUsed: '', mst: 0, qty: 0, remark: '' }]
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
const buttonText = id ? 'Update' : 'Submit';

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
const onSubmit = async (ev) => {
  ev.preventDefault();

  const submitData = new FormData(); // Create a FormData object

  for (const fileKey of Object.keys(signatureFiles)) {
    let signatureBlob = null;

    // Check if a new signature has been drawn
    if (isSignatureDrawn[fileKey]) {
      const signatureDataUrl = signatureCanvasRefs[fileKey].current.toDataURL('image/png');
      signatureBlob = await resizeImage(signatureDataUrl, 300, 100); // Resize the drawn signature
    } else if (signatureFiles[fileKey]) {
      // Check if a new file has been uploaded
      const fileUrl = URL.createObjectURL(signatureFiles[fileKey]);
      signatureBlob = await resizeImage(fileUrl, 300, 100); // Resize the uploaded signature
    }

    // Append only if there's a new or updated signature
    if (signatureBlob) {
      submitData.append(fileKey, signatureBlob, `${fileKey}.png`);
    }
  }

  // Append all other fields except materials
  Object.keys(formData).forEach((key) => {
    if (key !== 'materials' && formData[key] !== undefined && formData[key] !== null) {
      submitData.append(key, formData[key]);
    }
  });

  // Append materials, if available
  if (formData.materials && formData.materials.length > 0) {
    submitData.append('materials', JSON.stringify(formData.materials));
  }

  setLoading(true);
  setUploadStatus('Uploading...');

  try {
    const response = id
      ? await axiosClient.put(`/orders/${id}`, submitData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
      : await axiosClient.post('/orders', submitData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

    console.log('Submission successful:', response.data);
    setSuccess(response.data.message);

    // Trigger full reload after successful submission
   window.location.reload();
  } catch (error) {
    console.error('Error submitting form:', error);
    setErrors(error.response?.data?.errors || 'An unexpected error occurred.');
  } finally {
    setLoading(false);
  }
};


// Utility function to add a new page if needed
const addPageIfNeeded = (height) => {
  if (currentY + height > doc.internal.pageSize.height - margin) {
      doc.addPage();
      currentY = margin;
  }
};


const generatePDF = (formData,imageData) => {
  const doc = new jsPDF('p', 'mm', 'a4');
  const margin = 10;
  const lineHeight = 6; // Reduced line height
  let currentY = margin;
  doc.setFont('Helvetica', 'bold');

  const addPageIfNeeded = (height) => {
      const pageHeight = doc.internal.pageSize.height;
      if (currentY + height > pageHeight - margin) {
          doc.addPage();
          currentY = margin;
      }
  };

  // Company and Form Title
  doc.setFontSize(14);
  doc.text('MTS TRADING PLC', 105, currentY + 4, { align: 'center' });
  doc.text('HVAC Services', 105, currentY + 10, { align: 'center' });
  currentY += 20;
  doc.setFontSize(8);
  doc.text('Reference Number' +" " + formData.reference, 105, currentY , { align: 'center' });

  currentY += 20;
  doc.setFontSize(8);
  doc.text('job order and Validation Sheet', 105, currentY, { align: 'center' });
  doc.text('No', 180, currentY);
  currentY += 3;

// General Information Section
doc.setFontSize(9);
doc.text('General Information', margin, currentY);
doc.line(margin, currentY + 1, 200 - margin, currentY + 1);
currentY += 8;

const generalInfoData = [
{ label: 'Job Assessment No', value: formData.jobAssessmentNo },
{ label: 'Client Name', value: formData.clientName },
{ label: 'Start Date', value: formData.startDate },
{ label: 'Branch', value: formData.branch },
{ label: 'Type of Service', value: formData.typeOfService },
{ label: 'Start Time', value: formData.startTime },
{ label: 'Telephone', value: formData.telephone },
{ label: 'End Time', value: formData.endTime },
{ label: 'Supervisor Name', value: formData.supervisorName },
// { label: 'Signature4', value: '' },
];

const splitIndex = Math.ceil(generalInfoData.length / 2);
const leftColumn = generalInfoData.slice(0, splitIndex);
const rightColumn = generalInfoData.slice(splitIndex);

leftColumn.forEach((item, index) => {
addPageIfNeeded(8);

// Print left column text
doc.text(`${item.label}:`, margin, currentY);
doc.text(item.value || '', margin + 60, currentY);

// Print corresponding right column text
if (rightColumn[index]) {
  doc.text(`${rightColumn[index].label}:`, margin + 100, currentY);
  doc.text(rightColumn[index].value || '', margin + 160, currentY);
}

// Update currentY after both columns are printed
currentY += lineHeight;
});
const addSignature = (label, signature, startX) => {
  doc.text(label, startX, currentY);
  if (signature) {
      doc.addImage(signature, 'PNG', startX + 10, currentY  , 40, 10); // Adjust positioning if needed
  }
};
// Align currentY back to the level of "Supervisor Name"
currentY -= lineHeight;  // Move Y position back to align with "Supervisor Name"
// Define X position for the signature section, aligning with the second column
const startX = margin + 160; // Adjust to align perfectly with the second column
// const addSignature = (label, primarySignatureDataUrl, fallbackSignatureDataUrl, startX) => {
// // Define a placeholder for the signature if not available
// const placeholderText = 'Signature:';

// // Define Y offset for the label and signature
// const labelOffsetY = 5; // Position of the label
// const signatureOffsetY = 5; // Reduced value to move the signature closer to the label

// // Add the label for the signature
// doc.text(label, startX, currentY + labelOffsetY);

// // Calculate the Y position for the signature or placeholder text
// const signatureY = currentY + labelOffsetY + signatureOffsetY;

// if (primarySignatureDataUrl) {
// // Add the primary signature image if available
// doc.addImage(primarySignatureDataUrl, 'PNG', startX + 5, signatureY, 40, 10);
// } else if (fallbackSignatureDataUrl) {
// // Add the fallback signature image if primary signature is not available
// doc.addImage(fallbackSignatureDataUrl, 'PNG', startX + 5, signatureY, 40, 10);
// } else {
// // Add a single placeholder text if no signatures are available
// doc.text(placeholderText, startX, signatureY); // Adjust Y position to accommodate placeholder
// }

// // Move currentY to avoid overlap with the next section
// currentY += 35; // Adjust this value to provide enough space below the signature section
// };

// Example usage of the function
addSignature('Signature:', imageData.signatureFile4, startX - 60); // Check primary signature first, then fallback if needed
currentY += 35;


// Ensure that a new page is added if needed
addPageIfNeeded(20);

// Define the margin and spacing values
const labelWidth = 90; // Adjust based on your layout needs
const valueStartX = margin + labelWidth + 10; // Position where the value text will start

// Set font size
doc.setFontSize(9);
doc.setFont('Helvetica', 'bold');

// Display "Work Type" section in one row
doc.setFont('Helvetica', 'bold'); // Set font to bold for labels
doc.text('Work Type:', margin, currentY);
// doc.setFont('Helvetica', 'normal'); // Revert to normal font for values
doc.text(formData.typesOfWork || '', valueStartX, currentY);

// Update currentY for the next section
currentY += lineHeight; // Move down for the next row

// Display "Types Of Machine" section in one row
doc.setFont('Helvetica', 'bold'); // Set font to bold for labels
doc.text('Types Of Machine:', margin, currentY);
// doc.setFont('Helvetica', 'normal'); // Revert to normal font for values
doc.text(formData.typesOfMachine || '', valueStartX, currentY);

// Update currentY for the next section
currentY += lineHeight; // Move down for the next row

// Display "Temperature" section in one row
doc.setFont('Helvetica', 'bold'); // Set font to bold for labels
doc.text('Temperature (°C):', margin, currentY);
doc.text(formData.temperature  || '', valueStartX, currentY);

// Update currentY for additional content or end of document
currentY += lineHeight; // Add space for additional content if needed
doc.setFont('Helvetica', 'bold');
  // HVAC-R Services Section
  doc.setFontSize(12);

  doc.text('HVAC-R SERVICES', margin, currentY + 4);
  currentY += 8;

  doc.setFontSize(9);
  doc.text('Nature of Problem (Problem Description):', margin, currentY);
  currentY += 8;
  doc.rect(margin, currentY, 190 - 2 * margin, 20); // Reduced height
  doc.text(doc.splitTextToSize(formData.natureOfProblem || '', 190 - 2 * margin), margin + 2, currentY + 5);
  currentY += 24;

  doc.text('Detailed Problem Reported:', margin, currentY);
  currentY += 8;
  doc.rect(margin, currentY, 190 - 2 * margin, 20); // Reduced height
  doc.text(doc.splitTextToSize(formData.detailProblemReported || '', 190 - 2 * margin), margin + 2, currentY + 5);
  currentY += 24;

  addPageIfNeeded(20);

  // Required Materials and Spare Parts Section
  doc.text('Materials and Spare Parts Used', margin, currentY);
  doc.line(margin, currentY + 1, 200 - margin, currentY + 1);
  currentY += 8;

   
     // Ensure formData.materials is defined and is an array
    const materials = Array.isArray(formData.materials) ? formData.materials : [];

    const calculateColumnWidths = () => {
        const sNoWidth = 15;
        const materialListWidth = 60;
        const mstWidth = 30;
        const qtyWidth = 20;
        const remarkWidth = 40;

        return {
            sNo: sNoWidth,
            materialList: materialListWidth,
            mst: mstWidth,
            qty: qtyWidth,
            remark: remarkWidth
        };
    };

    const columnWidths = calculateColumnWidths();

    // Table Headers
    doc.setFontSize(9);
    doc.text('S.No', margin, currentY);
    doc.text('Material List', margin + columnWidths.sNo + 5, currentY);
    doc.text('MST', margin + columnWidths.sNo + columnWidths.materialList + 10, currentY);
    doc.text('QTY', margin + columnWidths.sNo + columnWidths.materialList + columnWidths.mst + 15, currentY);
    doc.text('Remark', margin + columnWidths.sNo + columnWidths.materialList + columnWidths.mst + columnWidths.qty + 20, currentY);
    currentY += lineHeight;

    // doc.line(margin, currentY, 200 - margin, currentY);
    currentY += 2;

    // Table Rows
    materials.forEach((item, index) => {
        addPageIfNeeded(lineHeight + 2);

        doc.text(`${index + 1}`, margin, currentY);
        doc.text(item.materialUsed || '', margin + columnWidths.sNo + 5, currentY);
        doc.text(item.mst || '', margin + columnWidths.sNo + columnWidths.materialList + 10, currentY);
        doc.text(item.qty || '', margin + columnWidths.sNo + columnWidths.materialList + columnWidths.mst + 15, currentY);
        doc.text(item.remark || '', margin + columnWidths.sNo + columnWidths.materialList + columnWidths.mst + columnWidths.qty + 20, currentY);

        currentY += lineHeight;
        // doc.line(margin, currentY, 200 - margin, currentY);
        currentY += 2;
    });


  addPageIfNeeded(20);
  doc.setFont('Helvetica', 'bold');
  // Technical Description Section
  doc.text('Technical Service Procedure:', margin, currentY + 3);
  currentY += 8;
  doc.rect(margin, currentY, 190 - 2 * margin, 15); // Reduced height
  doc.text(doc.splitTextToSize(formData.serviceRendered || '', 190 - 2 * margin), margin + 2, currentY + 4);
  currentY += 20;

  addPageIfNeeded(20);
  doc.setFont('Helvetica', 'bold');
  // Performance Assurance Section
  doc.text('Performance Assurance:', margin, currentY);
  currentY += 8;
  doc.rect(margin, currentY, 190 - 2 * margin, 15); // Reduced height
  doc.text(doc.splitTextToSize(formData.performanceAssurance || '', 190 - 2 * margin), margin + 2, currentY + 4);
  currentY += 20;

  addPageIfNeeded(20);
  doc.setFont('Helvetica', 'bold');
  // Customer Comment Section
  doc.text('Customer Comment:', margin, currentY);
  currentY += 8;
  doc.rect(margin, currentY, 190 - 2 * margin, 15); // Reduced height
  doc.text(doc.splitTextToSize(formData.customerComment || '', 190 - 2 * margin), margin + 2, currentY + 4);
  currentY += 20;

  addPageIfNeeded(20);
// Signature Section Dimensions
const sectionWidth = 60; // Width for each section

const spaceBetweenSections = 20; // Space between sections
doc.setFont('Helvetica', 'bold');
// Function to add signature section
const addSignatureSection = (label, name, position, date, startX) => {
doc.text(label, startX, currentY);
doc.text(`Name: ${name}`, startX, currentY + 8);
doc.text(`Position: ${position}`, startX, currentY + 16);
doc.text(`Date: ${date}`, startX, currentY + 24);
};

// Define the X positions for each section to ensure they are spaced out evenly
const startX1 = margin;
const startX2 = margin + sectionWidth + spaceBetweenSections;
const startX3 = margin + 2 * (55 + spaceBetweenSections);

doc.setFont('Helvetica', 'bold');
// Add 'Executed By' Signature Section
addSignatureSection(
'Executed By:',
formData.executedBy,
formData.executedByPosition,
formData.executedByDate,
startX1
);
doc.setFont('Helvetica', 'bold');
// Add 'Checked By' Signature Section
addSignatureSection(
'Checked By:',
formData.checkedBy,
formData.checkedByPosition,
formData.checkedByDate,
startX2
);
doc.setFont('Helvetica', 'bold');
// Add 'Approved By' Signature Section
addSignatureSection(
'Approved By:',
formData.approvedBy,
formData.approvedByPosition,
formData.approvedByDate,
startX3
);

// Adjust currentY for additional content or end of page
currentY += 35; // Adding some extra space after the last section



addPageIfNeeded(15);



// Add signatures aligned with the sections
addSignature('Signature1:', imageData.signatureFile1, startX1);
addSignature('Signature2:', imageData.signatureFile2, startX2);
addSignature('Signature3:', imageData.signatureFile3, startX3);
currentY += 20;
   // Footer Information
  addPageIfNeeded(15);
  doc.setFontSize(8);
  const currentDate = new Date();
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  const formattedDate = currentDate.toLocaleDateString(undefined, options);

  doc.text(`Generated Date: ${formattedDate}`, margin, currentY);

  // Return the generated PDF as a blob
  return doc.output('blob');
  // doc.save('job_order_and_validation_sheet.pdf');

};



const sendToTelegram = async (pdfBlob) => {
  const formData = new FormData();
  formData.append('chat_id', chat_id);
  formData.append('document', pdfBlob, 'HVAC-R_Services_Form.pdf');

  const token = '6685274704:AAE7ausiXp1M7AOG0wUB5f0pOO97Q8RDgzE'; // Your bot token

  try {
      const response = await fetch(`https://api.telegram.org/bot${token}/sendDocument`, {
          method: 'POST',
          body: formData,
      });

      const result = await response.json();
      if (result.ok) {
          alert('PDF sent successfully!');
          // setFormData({ data: " " });
      } else {
          alert(`Failed to send PDF: ${result.description}`);
      }
  } catch (error) {
      console.error('Error sending PDF:', error);
      alert('Error sending PDF. Please try again.');
  }
};

// async function handleSubmit(userData) {
 
//   const files = imageUrls

//   // let files = {
//   //   file1: "data:image/png;base64,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",
//   //   file2: "data:image/png;base64,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tgur5tXM2t90EJZXwB3a4vnK65C1RO4iWVAZ6yDu3ljU5kpRczvyanpd7Xtgry6duma2e3vv26l3Xz2r2d2jGhnL6AffO69nPndM4WBTr33/A/3Mrz1truhTk0O2K5KZ7CDUsq2Nu2s6/8aHZsy1cOSInvjsMzr91msqF9a0/cA+jU5u19t/86bOn7qpZ7/4sMZmRkwT8MP/9bpyE0nduFLTF3/9MQNkAGCSiahlO929tK4jn3lc5945YVX6/ocP6oPXLmt+z25tLS1p+8JunXjjnA5/YkFDwyS2lOxo/ss/eUe//59+SxdvXDLwBnAnyuwllNUf/edva3R6TLv2jui9t67axPH+h/dYnQERZ/vOaSsOCV+lUyNwncki2dkom+gKCF6jNvC8toJkW5sZGEV6307lKkaeklKRgAGFjLtdQDhYEXhDSGcWC3ps57BR+plABv7oKw/67m52UX5e37dYYADFGqbcXVa50y0mIwwrfMXiZDsFVK02zK0Vl3FanHTShX+RBpPIDVnsHyIQYM+tYktn37+oY49tU6cd1laxpn3379XVMzetKt//wE6d/+CKMkMJTc1v08t/dVrHPrlHp966oFKpoa//1osKhDi1kKtRBKGiy5i+IjeU18y2nbpz55INa5Cyn/3wmk0Y9x3ZZbXJyR+9a8HgV86v6rlfetQsdv/hz19RqYTPI85iQfWDKf2T3/klVUsbWrmxrNuXq3rmi0/prZd+bOSbQ08cUI4apN/X699/XbmxvLYvzJipR4PAMPX11996W7/2L76qanlZnVZE8STtsxOibizf091ry3rk2UdULBSt0LQIo6anxctLhoCObQdHcB5VcBtoCY2QatyCkLWBNodhkyFghQmCHRBhqgytzFCzrjrZ0C7YxbACy98cLAIOl/evrenItoyFhRqv4r9+6QieK87HJxRWA95BJGAu4NxdLY4fM5FGGdM3EOJjJhErsNZsK5dJGr2aySJBE3D0GWdj7V/YKJgb273NulZuV/S5nzuq0x9eUrXU0aGH5nXtwk0jxeRHUjr30ZLmdk9o2+5p7T50v6Wn/sV/+RstHIhq39EHbGelc3nTADIvoJMBXsVBxSRjNscP6OKJC+aQtm3fFCiIEomozr12WvP3LdhuJD+CboLOJ5AY1mt//pc69pkn9dr/fUedQFSf/5UntLG4pqXba5q/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",
//   //   file3:"data:image/png;base64,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",
//   //   file4 :" data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASwAAABFCAYAAADw8dtTAAAAAXNSR0IArs4c6QAAEJlJREFUeF7t3QOwLdkVBuA/tm1NbFdsO5nYtjOxbdvGxLZt29bEdvpL7a56c4+6332TuX3O2lW33sy7ffrs/nfv/631L+yDpEYhUAgUAhNB4CATmWdNsxAoBAqBFGHVS1AIFAKTQaAIazJLVRMtBAqBIqx6BwqBQmAyCBRhTWapaqKFQCFQhFXvQCFQCEwGgSKsySxVTbQQKASKsOodKAQKgckgUIQ1maWqiRYChUARVr0DhUAhMBkEirAms1Q10UKgECjCqnegECgEJoNAEdZklqomWggUAkVY9Q4UAoXAZBAowprMUtVEC4FCoAir3oFCoBCYDAJFWJNZqppoIVAIFGHVO1AIFAKTQaAIa/lSHTHJ2ZIcOsnHkvx6MitbEy0E1hCBdSesMyVBOp9K8ueR63eoJFdIcs9GWC9I8rQkvx15n7q8ECgE9hAC605Yeye5aZJHJXlvkn+NwO0ESR6X5DJJDtqsqysm+USS/4y4T11aCBQCewiBdSesI3XW0cOTnKYR1zdG4HaGJK9N8u0k/0xy0ST7NCvr7yPuM8VLT5zk7Enek+RXU3yAmvN6IrDuhGXVLpbkCc1Cun4joCGreZYkb2kbloV1lCRX64jrQ0n+PeQGE77mbknukeQ3SWD2kUbaE36kmvo6ILAJhHXIJE9Ocr1mMd14oJ517iQfaIv8vSQPTfLygZ+d+rsh0PDIJOdrRHW7ht1+U3+wmv+0EdgEwrJCZ03yrCREeBbDi1Ysm6jgNZM8O8m3mga2b5LfT3u5R83+4kkekoSl+Y+G35M64v9OWVujcKyL9yACm0JYILtJ24CshOt0EcDPLsDxsM0au1VnmR09yWMacf1uD+I+lVtdPckTkxymucECF4j//Z2e96epPETNc30Q2CTCOnySm3WRwvt0utaHkzwoyec6reZvbTmPnORcXRTw0kmumuSY3f+/vX3mh+uz5KOe5HBJbpmEpnWE5H8H7369Wagv6wIZP66I6Sg86+JtIrBJhAUqm+6ynUtz75biQJv6ZrMeTpdkryQnaiLzsdufLLN1F9mXvUYw4x5eo0uevWQSxM9KfUfTub644fhscwvWx8cgsGmEBZtDJDl1cxHlVXH7DFi8syOs5zUSe04L64uWbfo4eIuSIvFzJLlB07Z+kuQZSWhbvaW66VjV8x+ACGwiYfVwHiyJbHY5R/K1ftS5Pz9vAvOxGnm9sAnuB+ASTO7WUjy4z7fu0h5u3/6bEM9tfGMJ8pNbz0lNeJMJa9lCyXJ/V1eGc4ckb53Uiv5/J3uBJA/uUh7O2MqXYPXAJF/tCOwvpW/9fxdjE76tCGv+Ksvyfn6SayX5/Ca8CNt4RikgN2oW18m7IAU3USRRztr3y+LaBrL10RkEirDmvxSihFycS3Ub8Zf13gxCQK7bXTvL9LztahFWCbtfKNIahF9dNACBIqz5IBHaRcb8SJqssRoB79JxWg7blbr8raO2LhmPbjlvmxxpXY1eXTEIgSKs+TBpIyN8f91BKE7vInWRLCJlS4IPooCifPLSuHRjx4VaFQH3UPsd0UTF4rRACbp3GlHDOfa76/oNQqAIa/5ii3bRruRrrdsQ4fNcen0hK1E/74HWO1/q+oc9Nsn7Rjz03ZuGdbR2vz+2FjzudfkWhdX88MobUoc5Arq6dCwCRVjzEdPwT34R8XjdBhLRH4yr+6pWdkOnO0kjHi6caoAh44atKPwYu5Qvuc+pmqUmr+3m7d4qC0QQaxQCu41AEdZ86L7bEkvfvdvI7swPcv3u1VrH3LmRDFfQe3DhLqH2Fd2079/E8iFP8IZWynSJrrPDrliJFrLgZMPr+Oq+SE3x+VeG3LiuKQTmIVCENYuKQl+JkFqr6NSwToMup6Gh+sALJvlgezjvgf9/Zov0aVy4akiufV3Tq06xIjiBDLWYRmC3aTlaq+5fvy8EZhAowpp9KWzEj7cupWP7wO/0V0wx88NaJE9dIG3JoGVpBa0ltNSEVw94kPM0l5llJcF2Vftp9398SzSVo1WlPANArkv2j0AR1uwboZ2yPlga+K3bkGrwiNaFlQj+mfaA6ivlnrG+HLrx4gEPLqnW9X6ePqAAGim69iLdtfdt1ta6t5oeAGNdMgaBIqxZtM7f+r+vY0qDSB7S0JlCdroSGoO2pRCcBSSCKMt/1dAIUYO/W3T93988sAzntK01jUgirUxHV/3yaxQCgxAowpqFSdO6Pmt7EIgH8kVEbb27/tqRx89WEADhG2ERxZ0mpLeVwfrRdoelJELIwlw1eguLZTb0JCHNERGcH6kTiJH7vcqdXDWX+v2GIFCENbvQd2yFvLSenTwI3bolcF0FCqQpSCPQIVSfr3ljkYXFJUTUUg9k+dOYVg0tpBU+s8z0xBoyvG8KpZHiD1pelgiiz9fRaUMQ3PBrirBmXwCHTSjalYe1ncFqUURNK5KbJANc+xqtliVrsnaQzqdbdO6nI76Ma/XK1nCQO0cLYqU45YdL11tOW28pw52F5QizXV1C7XWe2u4nivfJAXPpXUJlOEOu72/puQn7AhpO45H+QFeDeY1CYCkCRViz8PSN+16yjXeHxXKXpvHQaPzAusebNaG2zp/KY7hgesj3w9/5zLz6O2THleotIsS1iKC2PoK0Bpbj6Vvr5/6cRg0NtY12X2U0Q0bvErKwevF+yOdcY+59axrk6yQjxeasrrK0hqK4gdcVYc0uOnfIjxyjVQN5+NlVOGbxyHNyFiKLSoqADY0s+r7orAu5XqwiTQJf2tqz+D7unexw2fbOQNw6TtasK9FMKRhjDsdQ68eCRFAsKYfEGtw7Vo5kUgQ4ZFy7WWssLHMdM3TBoKE54ANRXq618iHif7lIawyUm3VtEdbseiMq4vPbVrwKsDtht8FZCDZdTxzO9NP8D4nJa1LqsijnyLW+T8SsF7oREdeOm0XQ3joUFrOEFBcjDQQztBMCcR4x6bLqQA797A3ale/S+rjPzVq1E1yLYBwuy7UbYxmds7M2H9DI2j8O5u/wD+THwiXiD32mVfOs368RAkVYs4spEZLbhHQWDbjRpYjecpvkLvUn6+gBxcJCKrddUvDLMkM492v3kRpg6CflRBpHajn8dd7gttnwdC+HQwx1yXRPcEAql9U9uGDHb2K9FtFIi9Y2ZJg7nJAMHW7MUGuIyBGdVIo+QVeOFuJS8sO6rOjhGFQ34NoirNlF/miLlC3rWEBjYj3JFudiISebS9jeJhQJQzwsr0WDKM8lEuWj6ahfNGg79DPWj7Yt8wYx/01NuOdOspaGZOWzCBU+O4IeUSIuUUHEiACRyNCBKFlrNKxFZzwuuhey91kus4LovkkiTOCmD5l/MJx/WJbW0BXZgOuKsGYXmTviaPZlrpGjwFg1rBKCca/haGCH8PweeelrvmjQuiROsmh0UOh1sDM3N1EbmOMuOLDU4RncRjV6v2gC/6LTrE/ZSJCLab4I4niNEGhJCAI50LScMzh00Nn6Roe9eD/0s6w60UokrxjbvPrhHwMkrraRWz7URR363XXdhBEowppdPC19kdCyUL0seFbVe5qF0Z+CTM+yydTscRWXDQI4gVlBMBeyH47R0vaF+8aSWiRoq81jZbFA3EdfKiS2dTgcVoqG1IXfN6He/Ohqkk65X74f8Y3RoZyag7CQ5ljCQuzcSaS+z5yUBpaf4nPEBYuvTXiP1dT3IAJFWLNgShFwlP0ywqJd2XD6Zfnvfth88qBYLFdZsU7yoLhF0hl2jcxp1eJsRJta6gA9a96wdiKRdDJEQ/NCIls3t+tEKFlTSE1KA+uOftUL37tTHkO74tJK/BQI0Btr6HAWJMHe5xZ1I6Xx+Q5613ObXjf0/nXdmiJQhDWfsJDJMv0JMSAbAjsSMCRl7tvcL9aPrPOtwyZk3bi/5EkZ3qJsLJ9+sHZkkLN+3I+4vWjY+Kwr0T9RSnoabW1RH3rrLdvd/UUZzXNoDtfWOdDaRFPpUf7UsWHoYFlxTfXH4oous6CQdh8Z/fXQL6jr1hOBIqzZdeUS2kT0pUVDHhOtS44VvQvhnKW5idwZmeRbScMm9fcyxIn1Gtn5bJ8L1X+XFAdWFzdL+gGLiEg+b1g/Fp3uB6wm7iMrz9yXidWIQt96uWAstLFE4BlF9JQBeXbu2zK9buvcaXCeEw4sM73kFw0kDzN4vr7LFfvDem7FeqohCBRhzaLUH5rAxVo06E+0JzoT0ZglJC+J1cAdtAn7kLzIFxFeuF40DubIAtltTfqUNMrNVLLD5ZSbxXJZJKib30nbvZAQXUoUkKu2LD0BCbDy5F9pJaNxX5+Tteq9YaERxLnNxHvPxiqUTzY0ogc/7ijCgtuqKCMM6Yqw0whQoXeNDUSgCGt20WlXykQI6sv+1Rd6V8Srjs+fNh+LSWoAl8vmZYmI+nEhReNEvIj1UibmuW2u4V45BANhvaZFD5HDfgsmY/P7PXdQnZ7opQie3KhlIjpdS9cEc/bMhHmdExZlznN5PYvnJOSz4ri9iESgAFkT8IdYQNxi1yM+xDnksFrPKTuetSnZdHd0tw3c4uv1yEVY8wlL9GtZ4qhPcWuIwvKZHI0lcZSw7bQYupMcI1FDiZHSE5Tg2Gium5cQ2VsdiqVZYshNYTBNykk2T1liwdCwaGIsHSTJeuGurSIPbioCQqjKfMxdW2juqM8iXVYfF1hLGmVBklUFCRyUikT9ncRZbiEiZnnCbpmFJ2UDqcOH+9v35Vq1u5AsbGCLzMdENVfdu34/AQSKsGYXiYViA64qzfFJG4irp9DZoOcot5E8ipwIxnQr5MENXGS9IL+9G+n4XtaVDa/2kLXEhePqLdqgfea9AACyZC1x9xZpX7s+tXuLxMkFE6FEIqwXFqDv84PEWGEsIToZ0t21WyhRHGEJIPg89xKpyd6fNwe5YSxR94BdnzQ7ZMvI4fKM8t2W6YxD7lXXTAyBIqzZBRN1Y2Fxb4YMZCPTnBuJYJCYTS43iwVDn2HBcNHmaTz0GV1OJVJqwId0RM3cw/qwvFyjS+eygXi4bYR6VpB7DdWU+u8xX/lj7kEbQ5rmT5QnqtPIFrliRH/P3xdWIzBkpdTJj4ioxFTdTgn9GgYKFkjhGNMq2XPS63yeey09o8aGIFCEtT0Lq/+0jY6wuDcSNA0WCves7+ag/ERyJiKTzS06yLXhatGuROwI7P1JNlN+BT0zK0ouGguU1cW1RHr0K+SryFldIwzGDgSuw4Pv0Mdrles79v51/Q5FoAhrdmHoN8hnyFFXWz/NGhI1s2HlN+3V6uK0XEZMtCt6FyvGNZJD1QDSfCRHrtuxYj0+iJswrxOFCB9rc7vnE8pB4xpyT2X8j7HSduh2rGmtQqAIaxYhrguX0CY4oAdrgyVWm233kOZ+suBEN/0sSpjdvbvXp3YcAkVYs0tCP6IjDWngt+MWdAMnpKOFekYdLli1FTlc45egCGt2cYXYRa76/lRrvPxr8Wj0QOkfggRSSAQGBEKkW9C2+j5la/Gwm/4QRVizb4BWJ2MPVtj09+jAfn6uNd1RDpjGf1If5KLJC1tWJXBgz7u+fyQCRVj7B0zZCVFcXaD0hhrTQUA5k2RUmfvWUaKtesVljRin83Q10/8hUIS1/xdB6YnESIQ1pFykXqOdg4B3mfboQA1alvQRZUPVZnnnrNG2Z/JfLrsHcw2jOhwAAAAASUVORK5CYII="
  
//   //  }
//    const pdfBlob = generatePDF(userData,files); // Pass formData here

// };

async function handleSubmit(userData) {
  const files = imageUrls
  
  if (!chat_id) {
      alert('Chat ID is missing.');
      return;
  }
  setIsSubmitting(true);

  try {
    const pdfBlob = generatePDF(userData,files);
    await sendToTelegram(pdfBlob);

  } catch (error) {
      console.error('Error submitting form:', error);
      alert('Error submitting form. Please try again.');
  } finally {
      setIsSubmitting(false);
  }
};
setTimeout(() => {
  setErrors(null); // Clear the errors
   
  setSuccess(null); // Clear the errors

}, 5000);


  return (
    <>
  <div className="container">
 
  <h1 className="text-xl font-bold">MTS Trading PLC</h1>
  <h2 className="text-xl font-bold">HVAC Services</h2>
  <h3 className="text-lg font-bold">Job Order and Validation Sheet</h3>

  {id ? <h1>Update Order: {formData.jobAssessmentNo}</h1> : <h1>New Order</h1>}


  <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
  <div className="flex items-center mb-4">
    <span className={`text-white ${Boolean(Number(formData.approved)) ? 'bg-green-500' : 'bg-yellow-500'} px-2 py-1 rounded`}>
      {Boolean(Number(formData.approved)) ? "Approved" : "Pending For Approval"}
    </span>
  </div>
  
  <h3 className="text-xl font-semibold text-gray-800 bg-gray-100 p-4 rounded-lg shadow-md border border-gray-200">
    Order Reference Number: <span className="font-bold text-blue-600">{formData.reference}</span>
  </h3>
</div>

  <div className="card animated fadeInDown">
    {loading && <div className="text-center">Loading...</div>}
    {errors && (
      <div className="alert">
        {typeof errors === "string" ? <p>{errors}</p> : Object.keys(errors).map(key => (<p key={key}>{errors[key][0]}</p>))}
      </div>
    )}

{success && (
      <div  >
         <span className="inline-flex w-full items-center justify-center px-3 py-1 text-sm font-medium text-white bg-green-500 rounded-full">
         {typeof success === "string" ? <p>{success}</p> : Object.keys(success).map(key => (<p key={key}>{success[key][0]}</p>))}

</span>
      </div>
    )}
    {!loading && (
      <form onSubmit={onSubmit} className="hvac-form" encType="multipart/form-data">
        <h4>General Information</h4>
       
        <div className="form-group">
        <div className="approval-section">
            {(user.role === "1" || user.role === "2") && (
                <div className="checkbox-container">
                    <label>
                        <input
                            type="checkbox"
                            checked={approved}
                            onChange={handleCheckboxChange}
                        />
                        Approved
                    </label>
                </div>
            )}
        </div>
        <div className="form-row">
            <label htmlFor="job_id">Job ID</label>
            <input type="text" id="job_id" name="job_id" disabled={formData.job_id} value={formData.job_id} onChange={ev => setForm({ ...formData, job_id: ev.target.value })} />
          </div>
          <div className="form-row">
            <label htmlFor="jobAssessmentNo">Job Assessment No</label>
            <input type="text" id="jobAssessmentNo" name="jobAssessmentNo" value={formData.jobAssessmentNo} onChange={ev => setForm({ ...formData, jobAssessmentNo: ev.target.value })} />
          </div>
          <div className="form-row">
            <label htmlFor="typeOfService">Type of Service</label>
            <input type="text" id="typeOfService" name="typeOfService" value={formData.typeOfService} onChange={ev => setForm({ ...formData, typeOfService: ev.target.value })} />
          </div>
          <div className="form-row">
            <label htmlFor="clientName">Client Name</label>
            <input type="text" id="clientName" name="clientName" value={formData.clientName} onChange={ev => setForm({ ...formData, clientName: ev.target.value })} />
          </div>
          <div className="form-row">
            <label htmlFor="startDate">Start Date</label>
            <input type="date" id="startDate" name="startDate" value={formData.startDate} onChange={ev => setForm({ ...formData, startDate: ev.target.value })} />
          </div>
          <div className="form-row">
            <label htmlFor="branch">Branch</label>
            <input type="text" id="branch" name="branch" value={formData.branch} onChange={ev => setForm({ ...formData, branch: ev.target.value })} />
          </div>
          <div className="form-row">
            <label htmlFor="startTime">Start Time</label>
            <input type="time" id="startTime" name="startTime" value={formData.startTime} onChange={ev => setForm({ ...formData, startTime: ev.target.value })} />
          </div>
          <div className="form-row">
            <label htmlFor="endTime">End Time</label>
            <input type="time" id="endTime" name="endTime" value={formData.endTime} onChange={ev => setForm({ ...formData, endTime: ev.target.value })} />
          </div>
          <div className="form-row">
            <label htmlFor="telephone">Telephone</label>
            <input type="tel" id="telephone" name="telephone" value={formData.telephone} onChange={ev => setForm({ ...formData, telephone: ev.target.value })} />
          </div>
          <div className="form-row">
            <label htmlFor="supervisorName">Supervisor Name</label>
            <input type="text" id="supervisorName" name="supervisorName" value={formData.supervisorName} onChange={ev => setForm({ ...formData, supervisorName: ev.target.value })} />
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

        <div className="form-group">
          <div className="form-row">
            <label htmlFor="typesOfWork">Correction</label>
            <select id="typesOfWork" className="block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" name="typesOfWork" value={formData.typesOfWork} onChange={ev => setForm({ ...formData, typesOfWork: ev.target.value })}>
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
            <input type="text" id="typesOfMachine" name="typesOfMachine" value={formData.typesOfMachine} onChange={ev => setForm({ ...formData, typesOfMachine: ev.target.value })} />
          </div>
          <div className="form-row">
            <label htmlFor="temperature">Temperature In °C</label>
            <input type="text" id="temperature" name="temperature" value={formData.temperature} onChange={ev => setForm({ ...formData, temperature: ev.target.value })} />
          </div>
          <div className="form-row">
            <label htmlFor="natureOfProblem">Nature of Problem (Problem Description)</label>
            <input type="text" id="natureOfProblem" name="natureOfProblem" value={formData.natureOfProblem} onChange={ev => setForm({ ...formData, natureOfProblem: ev.target.value })} style={{ width: '100%' }} />
          </div>
          <div className="form-row">
            <label htmlFor="detailProblemReported">Detail Problem Reported</label>
            <textarea id="detailProblemReported" name="detailProblemReported" value={formData.detailProblemReported} onChange={ev => setForm({ ...formData, detailProblemReported: ev.target.value })} style={{ width: '100%' }} />
          </div>
        </div>

        <h2>Technical Service Procedure</h2>
        <div className="form-group">
          <div className="form-row">
            <label htmlFor="serviceRendered">Service Rendered</label>
            <textarea id="serviceRendered" name="serviceRendered" value={formData.serviceRendered} onChange={ev => setForm({ ...formData, serviceRendered: ev.target.value })} style={{ width: '100%' }} />
          </div>
        </div>

        {/* Materials Table */}
        <div>
  <label>Materials and Spare Parts Used:</label>
  {formData.materials?.map(material => (
              <div key={material.id} className="material-group">
                <input
                  type="text"
                  value={material.materialUsed}
                  onChange={e => handleMaterialChange(material.id, 'materialUsed', e.target.value)}
                  placeholder="Material Used"
                />
                <input
                  type="number"
                  value={material.mst}
                  onChange={e => handleMaterialChange(material.id, 'mst', e.target.value)}
                  placeholder="MST"
                />
                <input
                  type="number"
                  value={material.qty}
                  onChange={e => handleMaterialChange(material.id, 'qty', e.target.value)}
                  placeholder="Quantity"
                />
                <input
                  type="text"
                  value={material.remark}
                  onChange={e => handleMaterialChange(material.id, 'remark', e.target.value)}
                  placeholder="Remark (Replaced, Repaired, Reconfigured, Reinstallation…)"
                  />
                 <button 
    className={`bg-red-500 hover:bg-red-600 text-xs mt-3 mb-3 text-white font-medium py-2 px-4 rounded-md shadow-md transition duration-200 ease-in-out }`} 
    type="button" 
    onClick={() => handleRemoveMaterial(material.id)}
    disabled={isLoading }
>
Remove
</button>
                
              </div>
            )) || <p>No materials added yet.</p>} {/* Default content when materials is empty */}

            
            
            <button 
    className={`bg-green-600 hover:bg-green-700 text-xs mt-3 text-white font-medium py-2 px-4 rounded-md shadow-md transition duration-200 ease-in-out }`} 
    type="button" 
    onClick={addMaterial} 
    disabled={isLoading }
>
Add Material
</button>
</div>



        <h2>Performance Assurance</h2>
        <textarea name="performanceAssurance" value={formData.performanceAssurance} onChange={ev => setForm({ ...formData, performanceAssurance: ev.target.value })} style={{ width: '100%' }} />

        <h2>Customer Comment</h2>
        <textarea name="customerComment" value={formData.customerComment} onChange={ev => setForm({ ...formData, customerComment: ev.target.value })} style={{ width: '100%' }} />

        {/* Signature Section */}
        {/* <div className="signature-section">
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
        
        </div> */}



        


        
      {/* Section 1: Executed By */}
      <h2>Executed By</h2>
      <div className="form-group">
        <label>Executed By:</label>
        <input
          type="text"
          name="executedBy"
   
          value={formData.executedBy} onChange={ev => setForm({ ...formData, executedBy: ev.target.value })}
        />
        <label>Position:</label>
        <input
          type="text"
          name="executedByPosition"
          value={formData.executedByPosition} onChange={ev => setForm({ ...formData, executedByPosition: ev.target.value })}

        />
        <label>Date:</label>
        <input
          type="date"
          name="executedByDate"
           value={formData.executedByDate} onChange={ev => setForm({ ...formData, executedByDate: ev.target.value })}

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
      </div>

      {/* Section 2: Checked By */}
      <h2>Checked By</h2>
      <div className="form-group">
        <label>Checked By:</label>
        <input
          type="text"
          name="checkedBy"
          value={formData.checkedBy} onChange={ev => setForm({ ...formData, checkedBy: ev.target.value })}

        />
        <label>Position:</label>
        <input
          type="text"
          name="checkedByPosition"
           value={formData.checkedByPosition} onChange={ev => setForm({ ...formData, checkedByPosition: ev.target.value })}

        />
        <label>Date:</label>
        <input
          type="date"
          name="checkedByDate"
         value={formData.checkedByDate} onChange={ev => setForm({ ...formData, checkedByDate: ev.target.value })}

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
      </div>

      {/* Section 3: Approved By */}
      <h2>Approved By</h2>
      <div className="form-group">
        <label>Approved By:</label>
        <input
          type="text"
          name="approvedBy"
       
                    value={formData.approvedBy} onChange={ev => setForm({ ...formData, approvedBy: ev.target.value })}

        />
        <label>Position:</label>
        <input
          type="text"
          name="approvedByPosition"
   
                    value={formData.approvedByPosition} onChange={ev => setForm({ ...formData, approvedByPosition: ev.target.value })}

        />
        <label>Date:</label>
        <input
          type="date"
          name="approvedByDate"
     
         value={formData.approvedByDate} onChange={ev => setForm({ ...formData, approvedByDate: ev.target.value })}

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
      </div>

{/*       
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
    </div> */}
     
        
     <div className="mb-3 flex items-center space-x-4 mt-5">
    <button 
        className={`w-full max-w-xs bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded shadow-lg transition duration-200 ease-in-out text-center`}
        type="submit" 
        onClick={onSubmit} 
        disabled={isLoading || Boolean(Number(formData.approved))}
    >
        {isLoading ? 'Loading...' : buttonText}
    </button>
    {/* <pre>{JSON.stringify(formData, null, 2)};
    </pre> */}
    <div className="form-actions w-full max-w-xs">
        <Link 
            className="w-full block bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded shadow-lg transition duration-200 ease-in-out text-center"
            to={`/order-by-slug/${id}`}
        >
            View Order
        </Link>
    </div>
</div>
{/* <img src={base64String} alt="Uploaded" /> */}

      </form>
    )}
  </div>
</div>

    </>
  );
}
