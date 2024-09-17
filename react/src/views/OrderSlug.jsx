
import { useNavigate, useParams } from "react-router-dom";
import axiosClient from "../axiosClient";
import SignatureCanvas from 'react-signature-canvas';
import React, { useState, useRef,useEffect } from 'react';
import { jsPDF } from 'jspdf';

import { useLocation } from 'react-router-dom';

import { useStateContext } from "../contexts/contextprovider";
import { v4 as uuidv4 } from 'uuid';
export default function UpdateForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const pathname = location.pathname;
  
  const [url, setUrl] = useState(" ");
 
  const [formData, setJob] = useState({
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
    approved:null,
    reference:'',
    job_id:' '
  });
 
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState(null);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [chatID, setChatID ] = useState(null);
  const [IsSubmitting, setIsSubmitting] = useState(false);
  const [showSelect, setShowSelect] = useState(false); // State to manage visibility
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [getUrl, setGetUrl] = useState(null);

//   const generateRef = () => {
//     const randomPart = Math.random().toString(36).substring(2, 10).toUpperCase(); // Generates a random string
//     const timePart = Date.now().toString(36).toUpperCase(); // Converts current time to a base-36 string
//     return `${randomPart}-${timePart}`; // Combine the parts for a unique reference
// };

// // Usage
// const ref = generateRef();
// console.log(ref); // Example output: "A1B2C3D4-E5F6G7H8"

  const closeModal = () => {
    setIsModalOpen(false); // Close the modal
    setSelectedUser(null)
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
      axiosClient.get(`/order-by-slug/${id}`)
        .then(({ data }) => {
          setJob(data.data);
           setGetUrl(window.location.origin)
           setImageUrls({
            signatureFile1: data.data.signatureFile1,
            signatureFile2: data.data.signatureFile2,
            signatureFile3: data.data.signatureFile3,
            signatureFile4: data.data.signatureFile4
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
  //   setJob((prevState) => ({
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
//     setJob((prevUser) => ({
//       ...prevUser,
//       materials: data.materials || [], // Ensure it's an array
//     }));
//   };

//   fetchData();
// }, []);


const handleMaterialChange = (id, field, value) => {
  setJob(prevState => ({
    ...prevState,
    materials: prevState.materials.map(material =>
      material.id === id ? { ...material, [field]: value } : material
    )
  }));
};

const handleRemoveMaterial = (id) => {
  setJob(prevState => ({
    ...prevState,
    materials: prevState.materials.filter(material => material.id !== id)
  }));
};

const addMaterial = () => {
  setJob((prevState) => ({
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
const buttonText = id ? 'Save' : 'Submit';

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
 

 

const getUsersData = async (ev) => {
  setShowSelect(true); // Show the select UI when button is clicked
  setIsModalOpen(true);

  ev.preventDefault();
  axiosClient.get('/getUsersData')
          .then(({ data }) => {
            setLoading(false)
            setUsers(data.data)
          })
          .catch(() => {
            setLoading(false)
          })
}
const onSubmit = async (ev) => {
  ev.preventDefault();

  // Create a new FormData object
  const formData = new FormData();

   // Add signature files, even if null
   for (const fileKey of Object.keys(signatureFiles)) {
    const signatureBlob = await getSignatureBlob(fileKey);
    if (signatureBlob) {
      formData.append(fileKey, signatureBlob, `${fileKey}.png`);
    }
}

  // Append other form data except materials
  Object.keys(formData).forEach((key) => {
    if (key !== 'materials' && formData[key] !== undefined && formData[key] !== null) {
      formData.append(key, formData[key]);
    }
  });

  // Append materials as individual fields
  if (formData.materials && formData.materials.length > 0) {
    formData.materials.forEach((material, index) => {
      formData.append(`materials[${index}][id]`, material.id);
      formData.append(`materials[${index}][materialUsed]`, material.materialUsed);
      formData.append(`materials[${index}][mst]`, material.mst);
      formData.append(`materials[${index}][qty]`, material.qty);
      formData.append(`materials[${index}][remark]`, material.remark || '');
    });
  }

  setLoading(true);
  setUploadStatus('Uploading...');

  try {
    let response;

    if (id) {
      setLoading(true);
      formData.append('_method', 'put');
      response = await axiosClient.post(`/order-by-slug/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setLoading(false);

      fetchData(id)
    } else {
      response = await axiosClient.post('/order-by-slug', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    }

    console.log('Files uploaded successfully:', response.data);
    setSuccess(response.data.message)
    navigate(`/order-by-slug/${id || response.data.id}`);
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
setTimeout(() => {
  setErrors(null); // Clear the errors
   
  setSuccess(null); // Clear the errors

}, 5000);

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
  doc.save('job_order_and_validation_sheet.pdf');

  // Return the generated PDF as a blob
  return doc.output('blob');

};


const sendToTelegram = async (pdfBlob, chatID) => {
  const token = '6685274704:AAFR-NXKCnfe7RZy9tGq5Swn2A0tDkTsrBU'; // Your bot token
  const buttonText = "Click Here To Open";
  const messageText = `Job Order Validation Form for Order Referecnce:  ${formData.reference}`;
//  const ur = window.location.origin

//  console.log(axiosClient.defaults.baseURL)
  // console.log(window.location.origin)

  const formData2 = new FormData();
  formData2.append('chat_id', chatID);
  formData2.append('document', pdfBlob, 'HVAC-R_Services_Form.pdf');

 

  try {
    // Send the document to Telegram
    const documentResponse = await fetch(`https://api.telegram.org/bot${token}/sendDocument`, {
      method: 'POST',
      body: formData2,
    });

    const documentResult = await documentResponse.json();
    if (documentResult.ok) {
      alert('PDF sent successfully!');
     
      // Send a message with an inline button
      const messageResponse = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },

     
        body: JSON.stringify({
          chat_id: chatID,
          text: messageText, // The message text
          reply_markup: JSON.stringify({
            inline_keyboard: [
              [
                {
                  text: buttonText, // Button text
                  url: url,   // URL for the button
                },
              ],
            ],
          }),
        }),
      });

      const messageResult = await messageResponse.json();
      if (messageResult.ok) {
        console.log('Message with inline button sent successfully!');
      } else {
        console.error(`Failed to send message with inline button: ${messageResult.description}`);
      }
    } else {
      alert(`Failed to send PDF: ${documentResult.description}`);
    }
  } catch (error) {
    console.error('Error sending PDF or message with inline button:', error);
    alert('Error sending PDF or message. Please try again.');
  }
};
// const sendToTelegram = async (pdfBlob, chatID) => {
//   const token = '7050516624:AAFv4A-VUxLiWONdRd0iZWbqrkGoqG-6hC4'; // Your bot token
//   setUrl(window.location.href)

//   console.log(url)

//   const formData = new FormData();
//   formData.append('chat_id', chatID);
//   formData.append('document', pdfBlob, 'HVAC-R_Services_Form.pdf');

//   try {
//     // Send the document to Telegram
//     const documentResponse = await fetch(`https://api.telegram.org/bot${token}/sendDocument`, {
//       method: 'POST',
//       body: formData,
//     });

//     const documentResult = await documentResponse.json();
//     if (documentResult.ok) {
//       alert('PDF sent successfully!');
      
//       // Send a message with the URL
//       const messageResponse = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           chat_id: chatID,
//           text: url,
//         }),
//       });

//       const messageResult = await messageResponse.json();
//       if (messageResult.ok) {
//         console.log('Message sent successfully!');
//       } else {
//         console.error(`Failed to send message: ${messageResult.description}`);
//       }
//     } else {
//       alert(`Failed to send PDF: ${documentResult.description}`);
//     }
//   } catch (error) {
//     console.error('Error sending PDF or message:', error);
//     alert('Error sending PDF or message. Please try again.');
//   }
// };

async function handleSubmit(userData, chatID) {
  const files = imageUrls; // Assuming imageUrls is defined in your component
  setIsSubmitting(true);

  try {
      const pdfBlob = generatePDF(userData, files);
      await sendToTelegram(pdfBlob, chatID );
  } catch (error) {
      console.error('Error submitting form:', error);
      alert('Error submitting form. Please try again.');
  } finally {
      setIsSubmitting(false);
  }
}

const handleSelectChange = (event) => {
  const userId = parseInt(event.target.value, 10);
  const userInfo = users.find(u => u.id === userId);
  setSelectedUser(userInfo);
  //  console.log(userInfo.role);
    
  setChatID(userInfo.chat_id); // Assuming setChatID is a state setter for chatID
  const buttonUrl = userInfo.role === "3"
  ? `${getUrl}/order-by-slug/${id}`
  : `${getUrl}/orders/${id}`;

console.log(buttonUrl); // Check the URL in the console
  setUrl(buttonUrl);  
  handleSubmit(formData, userInfo.chat_id,);
};
 
  return (
    <>
  <div className="container">
  <h1 className="text-xl font-bold">MTS Trading PLC</h1>
  <h2 className="text-xl font-bold">HVAC Services</h2>
  <h3 className="text-lg font-bold">Job Order and Validation Sheet</h3>
 
  {id ? <h1 className="text-lg">Update JobAssessmentNo: {formData.jobAssessmentNo}  </h1> : <h1>New Order</h1> }
  <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
  <div className="flex items-center mb-4">
  <span className={`text-white ${Boolean(Number(formData.approved)) ? 'bg-green-500' : 'bg-red-500'} px-2 py-1 rounded`}>
    {Boolean(Number(formData.approved)) ? "Approved" : "Not Approved"}
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
        <div className="form-row">
        <label htmlFor="job_id">Job Id</label>
        <input type="text" id="job_id" name="job_id"  disabled={formData.job_id} value={formData.job_id} onChange={ev => setJob({ ...formData, job_id: ev.target.value })} />
        </div>
          <div className="form-row">
            <label htmlFor="jobAssessmentNo">Job Assessment No</label>

            <input type="text" id="jobAssessmentNo" name="jobAssessmentNo"  disabled={formData.jobAssessmentNo} value={formData.jobAssessmentNo} onChange={ev => setJob({ ...formData, jobAssessmentNo: ev.target.value })} />
          </div>
          <div className="form-row">
            <label htmlFor="typeOfService">Type of Service</label>
            <input type="text" id="typeOfService" name="typeOfService"  disabled={formData.typeOfService} value={formData.typeOfService} onChange={ev => setJob({ ...formData, typeOfService: ev.target.value })} />
          </div>
          <div className="form-row">
            <label htmlFor="clientName">Client Name</label>
            <input type="text" id="clientName" name="clientName"   disabled={formData.clientName} value={formData.clientName}  onChange={ev => setJob({ ...formData, clientName: ev.target.value })} />
          </div>
          <div className="form-row">
            <label htmlFor="startDate">Start Date</label>
            <input type="date" id="startDate" name="startDate" disabled={formData.startDate} value={formData.startDate} onChange={ev => setJob({ ...formData, startDate: ev.target.value })} />
          </div>
          <div className="form-row">
            <label htmlFor="branch">Branch</label>
            <input type="text" id="branch" name="branch" disabled={formData.branch} value={formData.branch} onChange={ev => setJob({ ...formData, branch: ev.target.value })} />
          </div>
          <div className="form-row">
            <label htmlFor="startTime">Start Time</label>
            <input type="time" id="startTime" name="startTime" disabled={formData.startTime} value={formData.startTime} onChange={ev => setJob({ ...formData, startTime: ev.target.value })} />
          </div>
          <div className="form-row">
            <label htmlFor="endTime">End Time</label>
            <input type="time" id="endTime" name="endTime" disabled={formData.endTime} value={formData.endTime} onChange={ev => setJob({ ...formData, endTime: ev.target.value })} />
          </div>
          <div className="form-row">
            <label htmlFor="telephone">Telephone</label>
            <input type="tel" id="telephone" name="telephone" disabled={formData.telephone} value={formData.telephone} onChange={ev => setJob({ ...formData, telephone: ev.target.value })} />
          </div>
          <div className="form-row">
            <label htmlFor="supervisorName">Supervisor Name</label>
            <input type="text" id="supervisorName" name="supervisorName" disabled={formData.supervisorName} value={formData.supervisorName} onChange={ev => setJob({ ...formData, supervisorName: ev.target.value })} />
          </div>
        </div>

        {/* Signature Section */}
        <div className="signature-section">
        {!imageUrls.signatureFile4 &&

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
          </div>}
          <div>
        <label>Signature File 4:</label>
        <input
          type="file"
          onChange={(e) => handleFileChange(e, 'signatureFile4')}
          disabled={imageUrls.signatureFile4}


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
            <select id="typesOfWork" className="block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" name="typesOfWork" disabled={formData.typesOfWork} value={formData.typesOfWork} onChange={ev => setJob({ ...formData, typesOfWork: ev.target.value })}>
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
            <input type="text" id="typesOfMachine" name="typesOfMachine" disabled={formData.typesOfMachine} value={formData.typesOfMachine} onChange={ev => setJob({ ...formData, typesOfMachine: ev.target.value })} />
          </div>
          <div className="form-row">
            <label htmlFor="temperature">Temperature In °C</label>
            <input type="text" id="temperature" name="temperature" disabled={formData.temperature} value={formData.temperature} onChange={ev => setJob({ ...formData, temperature: ev.target.value })} />
          </div>
          <div className="form-row">
            <label htmlFor="natureOfProblem">Nature of Problem (Problem Description)</label>
            <input type="text" id="natureOfProblem" name="natureOfProblem" disabled={formData.natureOfProblem} value={formData.natureOfProblem} onChange={ev => setJob({ ...formData, natureOfProblem: ev.target.value })} style={{ width: '100%' }} />
          </div>
          <div className="form-row">
            <label htmlFor="detailProblemReported">Detail Problem Reported</label>
            <textarea id="detailProblemReported" name="detailProblemReported" disabled={formData.detailProblemReported} value={formData.detailProblemReported} onChange={ev => setJob({ ...formData, detailProblemReported: ev.target.value })} style={{ width: '100%' }} />
          </div>
        </div>

        <h2>Technical Service Procedure</h2>
        <div className="form-group">
          <div className="form-row">
            <label htmlFor="serviceRendered">Service Rendered</label>
            <textarea id="serviceRendered" name="serviceRendered" disabled={formData.serviceRendered} value={formData.serviceRendered} onChange={ev => setJob({ ...formData, serviceRendered: ev.target.value })} style={{ width: '100%' }} />
          </div>
        </div>

        {/* Materials Table */}
        <div>
  <label>Materials and Spare Parts Used:</label>
  {formData.materials?.length > 0 ? (
  formData.materials.map((material, index) => (
    <div key={index} className="material-group mb-4 p-4 border border-gray-200 rounded-lg shadow-sm">
      {index+1}
      <input
        type="text"
        disabled={material.materialUsed}
        value={material.materialUsed || ''}
        onChange={e => handleMaterialChange(material.id, 'materialUsed', e.target.value)}
        placeholder="Material Used"
        className="block w-full mb-2 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-opacity-50"
      />
      <input
        type="number"
        disabled={material.mst}
        value={material.mst || ''}
        onChange={e => handleMaterialChange(material.id, 'mst', e.target.value)}
        placeholder="MST"
        className="block w-full mb-2 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-opacity-50"
      />
      <input
        type="number"
        disabled={material.qty}
        value={material.qty || ''}
        onChange={e => handleMaterialChange(material.id, 'qty', e.target.value)}
        placeholder="Quantity"
        className="block w-full mb-2 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-opacity-50"
      />
      <input
        type="text"
        disabled={material.remark}
        value={material.remark || ''}
        onChange={e => handleMaterialChange(material.id, 'remark', e.target.value)}
        placeholder="Remark (Replaced, Repaired, Reconfigured, Reinstallation…)"
        className="block w-full mb-2 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-opacity-50"
      />
      {!Boolean(Number(formData.approved)) && (
        <button
          className="bg-red-500 hover:bg-red-600 text-xs text-white font-medium py-2 px-4 rounded-md shadow-md transition duration-200 ease-in-out mt-3"
          type="button"
          onClick={() => handleRemoveMaterial(material.id)}
          disabled={isLoading}
        >
          Remove
        </button>
      )}
    </div>
  ))
) : (
  <p className="text-gray-500">No materials added yet.</p>
)}

            
            
{!Boolean(Number(formData.approved)) && (
  <button 
    className="bg-green-600 hover:bg-green-700 text-xs mt-3 text-white font-medium py-2 px-4 rounded-md shadow-md transition duration-200 ease-in-out" 
    type="button" 
    onClick={addMaterial} 
    disabled={isLoading}
  >
    {isLoading ? 'Loading...' : 'Add Material'}
  </button>
 
)}

</div>



        <h2>Performance Assurance</h2>
        <textarea name="performanceAssurance" disabled={formData.serviceRendered} value={formData.performanceAssurance} onChange={ev => setJob({ ...formData, performanceAssurance: ev.target.value })} style={{ width: '100%' }} />

        <h2>Customer Comment</h2>
        <textarea name="customerComment" disabled={formData.serviceRendered} value={formData.customerComment} onChange={ev => setJob({ ...formData, customerComment: ev.target.value })} style={{ width: '100%' }} />

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
    disabled={formData.executedBy}
          value={formData.executedBy} onChange={ev => setJob({ ...formData, executedBy: ev.target.value })}
        />
        <label>Position:</label>
        <input
          type="text"
         disabled={formData.executedByPosition}  name="executedByPosition"
          value={formData.executedByPosition} onChange={ev => setJob({ ...formData, executedByPosition: ev.target.value })}

        />
        <label>Date:</label>
        <input
          type="date"
          disabled={formData.executedByDate} name="executedByDate"
           value={formData.executedByDate} onChange={ev => setJob({ ...formData, executedByDate: ev.target.value })}

        />
      </div>

      {/* Signature 1 */}
      <div className="signature-section">
              {!imageUrls.signatureFile1 &&

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
        </div>}
        <div>
        <label>Signature File 1:</label>
        <input
          type="file"
          onChange={(e) => handleFileChange(e, 'signatureFile1')}
                    disabled={imageUrls.signatureFile1}

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
         disabled={formData.checkedBy}  name="checkedBy"
          value={formData.checkedBy} onChange={ev => setJob({ ...formData, checkedBy: ev.target.value })}

        />
        <label>Position:</label>
        <input
          type="text"
          disabled={formData.checkedByPosition} name="checkedByPosition"
           value={formData.checkedByPosition} onChange={ev => setJob({ ...formData, checkedByPosition: ev.target.value })}

        />
        <label>Date:</label>
        <input
          type="date"
        disabled={formData.checkedByDate}   name="checkedByDate"
         value={formData.checkedByDate} onChange={ev => setJob({ ...formData, checkedByDate: ev.target.value })}

        />
      </div>

      {/* Signature 2 */}
      <div className="signature-section">
      {!imageUrls.signatureFile2 &&
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
        </div>}
        <div>
        <label>Signature File 2:</label>
        <input
          type="file"
          onChange={(e) => handleFileChange(e, 'signatureFile2')}
          disabled={imageUrls.signatureFile2}
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
        disabled={formData.approvedBy}
                    value={formData.approvedBy} onChange={ev => setJob({ ...formData, approvedBy: ev.target.value })}

        />
        <label>Position:</label>
        <input
          type="text"
          name="approvedByPosition"
    disabled={formData.approvedByPosition}
                    value={formData.approvedByPosition} onChange={ev => setJob({ ...formData, approvedByPosition: ev.target.value })}

        />
        <label>Date:</label>
        <input
          type="date"
          name="approvedByDate"
      disabled={formData.approvedByDate}
         value={formData.approvedByDate} onChange={ev => setJob({ ...formData, approvedByDate: ev.target.value })}

        />
      </div>

      {/* Signature 3 */}
     
      <div className="signature-section" >
      {!imageUrls.signatureFile3 &&
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
    }
        <div>
        <label>Signature File 3:</label>
        <input
          type="file"
          onChange={(e) => handleFileChange(e, 'signatureFile3')}
          disabled={imageUrls.signatureFile3}
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
    

    
 
 
   
<div className="form-actions w-full max-w-xs">

<button 
            className="w-full block bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded shadow-lg transition duration-200 ease-in-out text-center"
            type="submit" 
    onClick={getUsersData} 
    disabled={isLoading}
>
    Send To Telegram
</button>
</div>


</div>
      </form>
    )}
  </div>


  
</div>
<div>
          

            {isModalOpen && (
              <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-70 z-50">
              <div className="relative bg-white p-6 rounded-lg shadow-lg w-full max-w-lg max-h-[90vh] overflow-auto">
                <button
                  onClick={closeModal}
                  className="absolute top-4 right-4 text-gray-500 hover:bg-gray-200 hover:text-white py-0.4 px-2 text-2xl"
                  aria-label="Close"
                >
                  &times;
                </button>
                      
                        <h2 className="text-xs font-bold mb-4 ">Select a formData</h2>
                        <div>
                            <label htmlFor="userSelect" className="block text-gray-700">formData:</label>
                            <select 
                                id="userSelect" 
                                onChange={handleSelectChange} 
                                value={selectedUser?.id || ''} 
                                className="block w-full mt-2 p-2 border border-gray-300 rounded"
                            >
                                <option value="" disabled >Select a formData...</option>
                                {users.map(formData => (
                                    <option key={formData.id} value={formData.id}>
                                        {formData.email}
                                    </option>
                                ))}
                                
                            </select>
                        </div>
                        {selectedUser && (
                          
                            <div className="mt-4">
                              
                                <h3 className="text-lg font-semibold">Selected formData Details</h3>
                                <p>ID: {selectedUser.id}</p>
                                <p>Chat ID: {selectedUser.chat_id}</p>
                                <p>Name: {selectedUser.email}</p>
                                <pre>{JSON.stringify(selectedUser.role, null, 2)};
                                </pre>
                            </div>
                        )}
                       
                    </div>
                </div>
                
            )}
        </div>
   
    </>
  );
}
