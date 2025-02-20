// const express = require('express');
// const app = express();
// const cors = require('cors');
//  const { createRegion,getAllRegions,updateRegion   } = require('./models/Region');

// // Enable CORS for all routes
// app.use(cors());

// // You can also configure CORS to only allow specific origins
// // app.use(cors({
// //   origin: 'http://localhost:4200' // Allow only this origin
// // }));

// app.use(express.json());
 


// // Insert data into the database
 
//   app.post('/api/Region/Add', async (req, res) => {
//     try {
//       const result = await createRegion(req.body);
  
//       if (result.success) {
//         res.status(200).json(result); // Send success response
//       } else {
//         res.status(500).json(result); // Send error response
//       }
//     } catch (error) {
//       console.error('Unhandled error: ', error);
//       res.status(500).json({ success: false, message: 'Internal server error' });
//     }
//   });
  
// // Route to get all regions
// // app.get('/api/Region/GetAll', (req, res) => {
// //     const query = 'SELECT * FROM regions';
  
// //     connection.query(query, (err, results) => {
// //       if (err) {
// //         console.error('Error retrieving data: ', err);
// //         return res.status(500).send('Database error');
// //       }
  
// //       res.status(200).json(results); // Send the data back as JSON
// //     });
// //   });// Route to get all regions with pagination and search

// // app.get('/api/Region/GetAll', (req, res) => {
// //     const { PageNumber = 1, PageSize = 10, SearchTerm = '' } = req.query;
  
// //     // Parse query parameters
// //     const pageNumber = parseInt(PageNumber, 10);
// //     const pageSize = parseInt(PageSize, 10);
// //     const searchTerm = `%${SearchTerm}%`;
  
// //     // Calculate offset for pagination
// //     const offset = (pageNumber - 1) * pageSize;
  
// //     // SQL query with pagination and search
// //     const query = `
// //       SELECT * FROM regions
// //       WHERE name LIKE ?
// //       LIMIT ? OFFSET ?
// //     `;
  
// //     // Execute query for paginated results
// //     connection.query(query, [searchTerm, pageSize, offset], (err, results) => {
// //       if (err) {
// //         console.error('Error retrieving data: ', err);
// //         return res.status(500).send('Database error');
// //       }
  
// //       // Count total records for pagination
// //       const countQuery = 'SELECT COUNT(*) AS total FROM regions WHERE name LIKE ?';
// //       connection.query(countQuery, [searchTerm], (countErr, countResults) => {
// //         if (countErr) {
// //           console.error('Error counting records: ', countErr);
// //           return res.status(500).send('Database error');
// //         }

// //         const totalRecords = countResults[0].total;

// //         // Send results as JSON with pagination metadata
// //         res.status(200).json({
// //           data: results,
// //           metaData: {
// //             currentPage: pageNumber,
// //             pageSize: pageSize,
// //             totalRecords: totalRecords,
// //             totalPages: Math.ceil(totalRecords / pageSize)
// //           }
// //         });
// //       });
// //     });
// //   });
 
//     app.get('/api/Region/GetAll', async(req, res) => {
//         const { PageNumber = 1, PageSize = 10, SearchTerm = '' } = req.query;
    
//         // Parse query parameters
//         const pageNumber = parseInt(PageNumber, 10);
//         const pageSize = parseInt(PageSize, 10);
//         const searchTerm = `%${SearchTerm}%`;
      
//         try {
//           const results = await getAllRegions(pageNumber, pageSize, searchTerm);
//           res.status(200).json(results)
//         } catch (err) {
//           res.status(500).json({ success: false, message: err.message });
//         }
//       });
  
//       // Send results as JSON
     
//   // PUT route to update a region
// app.put('/api/Region/Update/:id', async (req, res) => {
//     const { id } = req.params;
//     const updateData = req.body;
  
//     try {
//       const result = await updateRegion(id, updateData);
//       res.status(200).json({
//         success: true,
//         message: 'Data updated successfully'
//       });
//     } catch (err) {
//       res.status(500).json({
//         success: false,
//         message: err.message
//       });
//     }
//   });
  
  
// // Start the server
// const PORT = 3000;
// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });
const express = require('express');
const cors = require('cors');
const { createRegion, getAllRegions, updateRegion } = require('./models/Region');
const { createUser,getAllUsers,updateUser,getUserById,deleteUserById} = require('./models/Users');
const { createJob,getAllJobs,getJobById,updateJob,deleteJobById,saveOrderDetails,updateOrderDetails,approveOrderById,fetchAllOrders,getOrderById } = require('./models/Jobs');
 const {  getAllTasks ,confirmJob,getAllConfirmedTasks,rejectJob,CompleteJob, CompletedJobs,CancelJob,totalSalary, getCancelJobs,activeJobsCount,completedPercentage} = require('./models/Tasks');
 const {  getAllTechniciansCount,getConfirmedTasksCount,
  getCompletedTasksCount,
  getCanceledTasksCount,
  getAllTasksCount,
  getTotalSalary, 
  allCompletedPercentage,allJobsCount,totalCompletedJobs,importExcel
} = require('./models/Reports');


// const Sequelize = require('sequelize');
// const sequelize = new Sequelize('technician_management', 'root', {
//   dialect: 'mysql',
//   logging: false
// });

// // Import models
// const User = require('./model/User')(sequelize, Sequelize.DataTypes);
// const Job = require('./model/Job')(sequelize, Sequelize.DataTypes);
// const Technician = require('./model/Technician')(sequelize, Sequelize.DataTypes);

// Call the associate method after all models are initialized
// User.associate({ Job });
// Job.associate({ User, Technician });
// Technician.associate({ Job });

// Sync the models with the database
// sequelize.sync()
//   .then(() => console.log('Database synced'))
//   .catch(err => console.error('Error syncing database', err));
const authenticate = require('./middleware/authenticate');
const authRoutes = require('./routes/auth');
require('dotenv').config();
const userRoutes = require('./routes/userRoutes'); // Adjust the path to your user routes
const { Op, fn, col, literal } = require('sequelize');
const User = require('./model/User'); // Adjust the path to your User model
const authorizeRole = require('./middleware/authorizeRole.js');

const app = express();
const axios = require('axios');
const multer = require('multer');
const FormData = require('form-data');
const { json } = require('body-parser');

 
app.use(express.json()); // Parse incoming JSON payloads
const storage = multer.memoryStorage(); 
//const upload = multer(); // For handling file uploads
const upload = multer({ storage: storage });

app.use(cors());
app.use(express.json());
// Access API_URL from .env
const apiUrl = process.env.API_URL;
// Example: Use apiUrl in an endpoint or middleware
app.get('/', (req, res) => {
  console.log(apiUrl)
  res.send("Heloo");
});
// Authentication routes
app.use('/api', authRoutes); // Ensure this path matches your API route
app.use('/api', userRoutes); // Handles user routes like /user
app.use('/auth', authRoutes); // Ensure this path matches your API route

// Public route for adding a region
app.post('/api/Region/Add', authenticate, async (req, res) => {
  try {
    const result = await createRegion(req.body);
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(500).json(result);
    }
  } catch (error) {
    console.error('Unhandled error: ', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Protected route to get all regions
app.get('/api/Region/GetAll', authenticate, async (req, res) => {
  const { PageNumber = 1, PageSize = 10, SearchTerm = '' } = req.query;

  const pageNumber = parseInt(PageNumber, 10);
  const pageSize = parseInt(PageSize, 10);
  const searchTerm = `%${SearchTerm}%`;

  try {
    const results = await getAllRegions(pageNumber, pageSize, searchTerm);
    res.status(200).json(results);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Protected route to update a region
app.put('/api/Region/Update/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  try {
    await updateRegion(id, updateData);
    res.status(200).json({
      success: true,
      message: 'Data updated successfully'
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});
app.post('/api/users-registration',authenticate, authorizeRole("1"), async (req, res) => {
    try {
      const users = await createUser(req.body);
      console.log(req.body);
      if (users.success) {
        res.status(200).json(users);
      } else {
        res.status(500).json(users);
      }
    } catch (error) {
      console.error('Unhandled error: ', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  });

  app.get('/api/users-registration', authenticate, authorizeRole("1" ), async (req, res) => {
    const { PageNumber = 1, PageSize = 10, SearchTerm = '' } = req.query;
  
    const pageNumber = parseInt(PageNumber, 10);
    const pageSize = parseInt(PageSize, 10);
    const searchTerm = `%${SearchTerm}%`;
  
    try {
      const results = await getAllUsers(pageNumber, pageSize, searchTerm);
      
      // Send results in the desired format: data.data
      res.status(200).json({
        success: true,  // optional success indicator
       
          data: results  // Wrap results in a data object as an array
      
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: err.message
      });
    }
  });
  app.put('/api/users-registration/:id', authenticate, authorizeRole("1"), async (req, res) => {
    const userId = req.params.id;
    const updatedData = req.body;
  
    try {
      // Assuming `updateUser` is a function that updates the user and returns the updated record.
      const updatedUser = await updateUser(userId, updatedData);
  
      if (updatedUser) {
        // Send the updated user in the requested format: data.data
        res.status(200).json({
          success: true,
          data: {
            data: updatedUser // Return the updated user data
          }
        });
      } else {
        res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
    } catch (err) {
      res.status(500).json({
        success: false,
        message: err.message
      });
    }
  });
  app.get('/api/users-registration/:id', authenticate, authorizeRole("1"), async (req, res) => {
    const userId = req.params.id;
  
    try {
      // Assuming `getUserById` is a function that fetches the user by ID
      const data = await getUserById(userId);
  
      if (data) {
        // Return the user in the requested format: data.data
        res.status(200).json(data);
      } else {
        res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
    } catch (err) {
      res.status(500).json({
        success: false,
        message: err.message
      });
    }
  });

  app.post('/api/jobs', authenticate, authorizeRole("1"), async (req, res) => {
    
    try {
      const users = await createJob(req.body);
   
      if (users.success) {

        res.status(200).json(users);
      } else {
        res.status(500).json(users);
      }
    } catch (error) {
      console.error('Unhandled error: ', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  });

 // Function to retrieve jobs with pagination and search

// API route handler
app.get('/api/jobs', authenticate, authorizeRole("1"), async (req, res) => {
  // Use lowercase parameter names to match frontend params
  const { page = 1, pageSize = 10, search = '' } = req.query;

  // Convert page and pageSize to integers, and set default if NaN
  const pageNumber = parseInt(page, 10) || 1;
  const pageSizeInt = parseInt(pageSize, 10) || 10;

  // Wrap search term with `%` for partial matching
  const searchTerm = `%${search}%`;

  try {
    // Call getAllJobs with updated parameters
    const { jobs, totalCount } = await getAllJobs(pageNumber, pageSizeInt, searchTerm);

    // Respond with job data, total pages, and current page
    res.status(200).json({
      success: true,
      data: {
        jobs,
        totalPages: Math.ceil(totalCount / pageSizeInt),
        currentPage: pageNumber,
      }
    });
  } catch (err) {
    // Send error message if query fails
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve jobs: ' + err.message,
    });
  }
});


  app.put('/api/jobs/:id', authenticate, authorizeRole("1"), async (req, res) => {
 
  
    try {
        const jobId = req.params.id;
        const jobData = req.body;
        const result = await updateJob(jobId, jobData);
  
        if (!result.success) {
          return res.status(404).json({ success: false, message: result.message });
        }
    
        res.status(200).json(result);
      }  catch (err) {
      res.status(500).json({
        success: false,
        message: err.message
      });
    }
  });
  app.get('/api/jobs/:id', authenticate, authorizeRole("1"), async (req, res) => {
    const jobId = req.params.id;
  
    try {
      // Assuming `getUserById` is a function that fetches the user by ID
      const data = await getJobById(jobId);
      console.log(data)
      if (data) {
        // Return the user in the requested format: data.data
        res.status(200).json(data);
      } else {
        res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
    } catch (err) {
      res.status(500).json({
        success: false,
        message: err.message
      });
    }
  });
// DELETE job by ID
 

// Setup multer for file uploads
//const storage = multer.memoryStorage(); // Store files in memory (or use diskStorage for saving to disk)
//const upload = multer({ storage: storage });

app.delete('/api/jobs/:id', authenticate, authorizeRole("1"), async (req, res) => {
    const jobId = req.params.id;
    
    try {
      const result = await deleteJobById(jobId);
      console.log(result);
      if (result.success) {
        return res.status(200).json({ success: true, message: 'Job deleted successfully' });
      } else {
        return res.status(404).json({ success: false, message: 'Job not found' });
      }
    } catch (err) {
      console.error('Error deleting job:', err);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  });
  app.get('/api/orders/:id', authenticate , async (req, res) => {
    const jobId = req.params.id;
  
    try {
      // Assuming `getUserById` is a function that fetches the user by ID
      const data = await getOrderById(jobId);
      console.log("data", data)
      if (data) {
        // Return the user in the requested format: data.data
        res.status(200).json(data);
      } else {
        res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
    } catch (err) {
      res.status(500).json({
        success: false,
        message: err.message
      });
    }
  });
  app.get('/api/order-by-slug/:id' , async (req, res) => {
    const jobId = req.params.id;
  
    try {
      // Assuming `getUserById` is a function that fetches the user by ID
      const data = await getOrderById(jobId);
      console.log("data", data)
      if (data) {
        // Return the user in the requested format: data.data
        res.status(200).json(data);
      } else {
        res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
    } catch (err) {
      res.status(500).json({
        success: false,
        message: err.message
      });
    }
  });
 
  app.post('/api/orders', authenticate, upload.fields([
    { name: 'signatureFile1' },
    { name: 'signatureFile2' },
    { name: 'signatureFile3' },
    { name: 'signatureFile4' },
  ]), async (req, res) => {
    const {
      jobAssessmentNo,
      typeOfService,
      clientName,
      startDate,
      branch,
      startTime,
      endTime,
      telephone,
      supervisorName,
      typesOfWork,
      typesOfMachine,
      temperature,
      natureOfProblem,
      detailProblemReported,
      serviceRendered,
      performanceAssurance,
      customerComment,
      executedBy,
      executedByPosition,
      executedByDate,
      checkedBy,
      checkedByPosition,
      checkedByDate,
      approvedBy,
      approvedByPosition,
      approvedByDate,
      user_id,
      reference,
      job_id,
      materials,
    } = req.body;

    const files = req.files;

    // Convert materials (array of objects) to a JSON string
    const materialsData = JSON.stringify(JSON.parse(materials));

    // Convert uploaded files to Base64 strings
    const convertFileToBase64 = (file) =>
      file ? `data:${file.mimetype};base64,${file.buffer.toString("base64")}` : null;

    const signatureFile1 = files.signatureFile1 ? convertFileToBase64(files.signatureFile1[0]) : null;
    const signatureFile2 = files.signatureFile2 ? convertFileToBase64(files.signatureFile2[0]) : null;
    const signatureFile3 = files.signatureFile3 ? convertFileToBase64(files.signatureFile3[0]) : null;
    const signatureFile4 = files.signatureFile4 ? convertFileToBase64(files.signatureFile4[0]) : null;
    console.log( "signatureFile1",signatureFile1)
    try {
      // Call the model method to save the order
      const result = await saveOrderDetails({
        jobAssessmentNo,
        typeOfService,
        clientName,
        startDate,
        branch,
        startTime,
        endTime,
        telephone,
        supervisorName,
        typesOfWork,
        typesOfMachine,
        temperature,
        natureOfProblem,
        detailProblemReported,
        serviceRendered,
        performanceAssurance,
        customerComment,
        executedBy,
        executedByPosition,
        executedByDate,
        checkedBy,
        checkedByPosition,
        checkedByDate,
        approvedBy,
        approvedByPosition,
        approvedByDate,
        user_id,
        reference,
        job_id,
        materialsData,
        signatureFile1,
        signatureFile2,
        signatureFile3,
        signatureFile4,
      });

      if (result.success) {
 

        return res.status(200).json({ success: true, message: 'Order saved successfully!',  insertId: result.insertId });
      } else {
        return res.status(400).json({ success: false, message: result.message });
      }
    } catch (err) {
      console.error('Error saving order:', err);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  });

  app.put('/api/order-by-slug/:id', authenticate, upload.fields([
    { name: 'signatureFile1' },
    { name: 'signatureFile2' },
    { name: 'signatureFile3' },
    { name: 'signatureFile4' },
  ]), async (req, res) => {
    const {
      jobAssessmentNo,
      typeOfService,
      clientName,
      startDate,
      branch,
      startTime,
      endTime,
      telephone,
      supervisorName,
      typesOfWork,
      typesOfMachine,
      temperature,
      natureOfProblem,
      detailProblemReported,
      serviceRendered,
      performanceAssurance,
      customerComment,
      executedBy,
      executedByPosition,
      executedByDate,
      checkedBy,
      checkedByPosition,
      checkedByDate,
      approvedBy,
      approvedByPosition,
      approvedByDate,
      user_id,
      reference,
      job_id,
      materials,
    } = req.body;
  
    const files = req.files;
    const { id } = req.params;
   console.log(id)
    // Convert materials to JSON string
    const materialsData = JSON.stringify(JSON.parse(materials));
  
    // Convert uploaded files to Base64 strings
    const convertFileToBase64 = (file) =>
      file ? `data:${file.mimetype};base64,${file.buffer.toString('base64')}` : null;
  
    const signatureFile1 = files.signatureFile1 ? convertFileToBase64(files.signatureFile1[0]) : null;
    const signatureFile2 = files.signatureFile2 ? convertFileToBase64(files.signatureFile2[0]) : null;
    const signatureFile3 = files.signatureFile3 ? convertFileToBase64(files.signatureFile3[0]) : null;
    const signatureFile4 = files.signatureFile4 ? convertFileToBase64(files.signatureFile4[0]) : null;
  
    try {
      const result = await updateOrderDetails({
        id,
        jobAssessmentNo,
        typeOfService,
        clientName,
        startDate,
        branch,
        startTime,
        endTime,
        telephone,
        supervisorName,
        typesOfWork,
        typesOfMachine,
        temperature,
        natureOfProblem,
        detailProblemReported,
        serviceRendered,
        performanceAssurance,
        customerComment,
        executedBy,
        executedByPosition,
        executedByDate,
        checkedBy,
        checkedByPosition,
        checkedByDate,
        approvedBy,
        approvedByPosition,
        approvedByDate,
        user_id,
        reference,
        job_id,
        materialsData,
        signatureFile1,
        signatureFile2,
        signatureFile3,
        signatureFile4,
      });
  
      if (result.success) {
        return res.status(200).json({ success: true, message: 'Order updated successfully!' });
      } else {
        return res.status(400).json({ success: false, message: result.message });
      }
    } catch (err) {
      console.error('Error updating order:', err);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  });
  app.put(
    '/api/orders/:id',
    authenticate,
    upload.fields([
      { name: 'signatureFile1' },
      { name: 'signatureFile2' },
      { name: 'signatureFile3' },
      { name: 'signatureFile4' },
    ]),
    async (req, res) => {
      const {
        jobAssessmentNo,
        typeOfService,
        clientName,
        startDate,
        branch,
        startTime,
        endTime,
        telephone,
        supervisorName,
        typesOfWork,
        typesOfMachine,
        temperature,
        natureOfProblem,
        detailProblemReported,
        serviceRendered,
        performanceAssurance,
        customerComment,
        executedBy,
        executedByPosition,
        executedByDate,
        checkedBy,
        checkedByPosition,
        checkedByDate,
        approvedBy,
        approvedByPosition,
        approvedByDate,
        user_id,
        reference,
        job_id,
        materials,
      } = req.body;
  
      const files = req.files;
      const { id } = req.params;
  
      console.log(id);
  
      // Convert materials to JSON string
      const materialsData = JSON.stringify(JSON.parse(materials));
  
      // Convert uploaded files to Base64 strings
      const convertFileToBase64 = (file) =>
        file ? `data:${file.mimetype};base64,${file.buffer.toString('base64')}` : null;
  
      const signatureFile1 = files.signatureFile1 ? convertFileToBase64(files.signatureFile1[0]) : null;
      const signatureFile2 = files.signatureFile2 ? convertFileToBase64(files.signatureFile2[0]) : null;
      const signatureFile3 = files.signatureFile3 ? convertFileToBase64(files.signatureFile3[0]) : null;
      const signatureFile4 = files.signatureFile4 ? convertFileToBase64(files.signatureFile4[0]) : null;
  
      try {
        const updateData = {
          id,
          jobAssessmentNo,
          typeOfService,
          clientName,
          startDate,
          branch,
          startTime,
          endTime,
          telephone,
          supervisorName,
          typesOfWork,
          typesOfMachine,
          temperature,
          natureOfProblem,
          detailProblemReported,
          serviceRendered,
          performanceAssurance,
          customerComment,
          executedBy,
          executedByPosition,
          executedByDate,
          checkedBy,
          checkedByPosition,
          checkedByDate,
          approvedBy,
          approvedByPosition,
          approvedByDate,
          user_id,
          reference,
          job_id,
          materialsData,
        };
  
        // Only include signatures if they are not null
        if (signatureFile1) updateData.signatureFile1 = signatureFile1;
        if (signatureFile2) updateData.signatureFile2 = signatureFile2;
        if (signatureFile3) updateData.signatureFile3 = signatureFile3;
        if (signatureFile4) updateData.signatureFile4 = signatureFile4;
  
        const result = await updateOrderDetails(updateData);
  
        if (result.success) {
          return res.status(200).json({ success: true, message: 'Order updated successfully!' });
        } else {
          return res.status(400).json({ success: false, message: result.message });
        }
      } catch (err) {
        console.error('Error updating order:', err);
        return res.status(500).json({ success: false, message: 'Internal server error' });
      }
    }
  );
  
// PUT /api/approve/:id
app.put('/api/approve/:id', async (req, res) => {
  const { id } = req.params;
  const { approved } = req.body; // Extract 'approved' from the request body
console.log(id)
  if (approved !== 1) {
    return res.status(400).json({
      success: false,
      message: 'Invalid approval value.',
    });
  }
  try {
    const result = await approveOrderById(id,approved);

    if (result.affectedRows > 0) {
      res.status(200).json({
        success: true,
        message: 'Order approved successfully!',
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Order not found.',
      });
    }
  } catch (error) {
    console.error('Error approving order:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error.',
    });
  }
});

  // GET /api/getOrders
app.get('/api/getOrders', async (req, res) => {
  try {
    const orders = await fetchAllOrders(); // Use the reusable function
    res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (error) {
    console.error('Error fetching job orders:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch job orders.',
    });
  }
});

  // DELETE user by ID
  app.delete('/api/users/:id', authenticate, authorizeRole("1"), async (req, res) => {
    const userId = req.params.id;
    
    try {
      const result = await deleteUserById(userId);
      if (result.success) {
        return res.status(200).json({ success: true, message: 'User deleted successfully' });
      } else {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
    } catch (err) {
      console.error('Error deleting user:', err);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  });
//   async function getUserWithJobsAndTechnicians(userId) {
//     const user = await User.findOne({
//       where: { id: userId },
//       include: [
//         {
//           model: Job,
//           as: 'jobs',
//           include: [
//             {
//               model: Technician,
//               as: 'technician',
//               attributes: ['id', 'firstName', 'lastName'] // Specify the fields you want from Technician
//             }
//           ]
//         }
//       ]
//     });
  
//     if (user) {
//       const jobsWithTechnicianId = user.jobs.map(job => ({
//         job_id: job.id,
//         technician_id: job.technician.id,
//         technician_name: `${job.technician.firstName} ${job.technician.lastName}`
//       }));
  
//       return {
//         user: {
//           id: user.id,
//           firstName: user.firstName,
//           lastName: user.lastName,
//           jobs: jobsWithTechnicianId
//         }
//       };
//     } else {
//       return null; // Handle if user is not found
//     }
//   }
  
//   // Example Usage
//   getUserWithJobsAndTechnicians(1).then(result => console.log(result));
// Helper function to calculate distance


const calculateDistanceQuery = (latitude, longitude) => `
    ( 6371 * acos( cos( radians(${latitude}) ) *
      cos( radians( latitude ) ) *
      cos( radians( longitude ) - radians(${longitude}) ) +
      sin( radians(${latitude}) ) *
      sin( radians( latitude ) ) )
    )`;

    app.post('/api/getUsers', async (req, res) => {
      try {
          const latitude = req.body.latitude || 9.009368357991079;
          const longitude = req.body.longitude || 38.77109527587891;
          const skillId = req.body.skill_id;
  
          // Fetch users with distance calculation
          const users = await User.findAll({
              attributes: {
                  include: [
                      [literal(calculateDistanceQuery(latitude, longitude)), 'distance']
                  ],
                  exclude: ['createdAt', 'updatedAt'] // Exclude these columns if they are not needed
              },
              where: {
                  role: 3,
                  status: 1,
                  availability: 1
              },
              having: literal(`distance <= 5`),
              order: [['distance', 'ASC']]
          });
  
          // Filter users by skill ID
          const filteredUsers = users.filter(user => {
              try {
                  const userSkills = JSON.parse(user.skills); // Decode JSON string to array
  
                  // Ensure userSkills is an array and check if it includes the skillId
                  return Array.isArray(userSkills) && userSkills.some(skill => skill.id === parseInt(skillId));
              } catch (error) {
                  console.error('Error parsing skills for user:', user.id, error);
                  return false; // If there's an error parsing skills, exclude the user
              }
          });
          // console.log(users)

          // Return filtered users
          res.json({ data: filteredUsers });
  
      } catch (error) {
          console.error('Error fetching users:', error);
          res.status(500).json({ success: false, message: error.message });
      }
  });
  
// POST /api/jobs - Create a new job entry
 
const twilio = require('twilio');

// Initialize Twilio client with environment variables
const client = new twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

 

app.post('/api/send-sms', async (req, res) => {
  const { phoneNumber, message } = req.body;
  console.log(process.env.TWILIO_PHONE_NUMBER)
  try {
    // Send SMS using Twilio
    const sms = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber
    });
    
    res.status(200).json({ success: true, sms });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to send SMS', error });
  }
});



// const axios = require('axios');
// const multer = require('multer');
// const FormData = require('form-data');

// const upload = multer();

// app.post('/api/postToFacebook', upload.array('images', 5), async (req, res) => {
//   const { message } = req.body;
//   const images = req.files; // Images uploaded by user
//   const pageAccessToken = 'EAAF1pWMJ19YBO7axqg9PfQSFC69kSZA8eHHaFXBen4q4pibZB1DHEBi6pNYspCuZAVON1ZBv3joFXgwBTOwBsIl9ScDk9kHE4Coty3IpN7vFZCD6RQlMN0GmkqDcos2dFQY8YWEJZAt386BZCxY4bwvnkXvdDmg8z8j8CpwwlCQJ1t2a4vMA5XKx1sN1g5vu6AZD';
//   const pageId = '107493672373057';

//   const telegramBotToken = '6685274704:AAE7ausiXp1M7AOG0wUB5f0pOO97Q8RDgzE'; // Your bot token
//   const telegramChatId = '@lomiworks';
//   const telegramChatId2 = '@jobsite123';

//   try {
//     // Post images to Facebook
//     const uploadedImages = await Promise.all(images.map(async (image) => {
//       const formData = new FormData();
//       formData.append('source', image.buffer, {
//         filename: image.originalname,
//         contentType: image.mimetype,
//       });
//       formData.append('published', 'false'); // Do not publish yet
//       formData.append('access_token', pageAccessToken);

//       const response = await axios.post(`https://graph.facebook.com/v14.0/${pageId}/photos`, formData, {
//         headers: formData.getHeaders()
//       });

//       return response.data.id; // Facebook image ID (media_fbid)
//     }));

//     // Post message with images to Facebook
//     const mediaAttachments = uploadedImages.map((id) => ({ media_fbid: id }));
//     const postResponse = await axios.post(`https://graph.facebook.com/v14.0/${pageId}/feed`, {
//       message,
//       attached_media: mediaAttachments,
//       access_token: pageAccessToken
//     });

//     // Prepare media for Telegram
//     const telegramMedia = images.map((image, index) => ({
//       type: 'photo',
//       media: `attach://${image.originalname}`,
//       caption: index === 0 ? message : '', // Add the caption to the first image only
//     }));

//     // Create FormData for Telegram request
//     const telegramFormData = new FormData();
//     telegramFormData.append('chat_id', telegramChatId);
//     telegramFormData.append('media', JSON.stringify(telegramMedia));

//     const telegramFormData2 = new FormData();
//     telegramFormData2.append('chat_id', telegramChatId2);
//     telegramFormData2.append('media', JSON.stringify(telegramMedia));

//     // Attach each file
//     images.forEach((image) => {
//       telegramFormData.append(image.originalname, image.buffer, {
//         filename: image.originalname,
//         contentType: image.mimetype,
//       });
//     });
//    images.forEach((image) => {
//       telegramFormData2.append(image.originalname, image.buffer, {
//         filename: image.originalname,
//         contentType: image.mimetype,
//       });
//     });
//     // Send the media group to Telegram
//     const telegramResponse = await axios.post(`https://api.telegram.org/bot${telegramBotToken}/sendMediaGroup`, telegramFormData, {
//       headers: telegramFormData.getHeaders(),
//     });

//       // Send the media group to Telegram
//       const telegramResponse2 = await axios.post(`https://api.telegram.org/bot${telegramBotToken}/sendMediaGroup`, telegramFormData2, {
//         headers: telegramFormData2.getHeaders(),
//       });

//     // Response handling
//     res.status(200).json({ 
//       facebookPostId: postResponse.data.id, 
//       telegramResult: telegramResponse.data,
//       telegramResult2: telegramResponse2.data  // Add the result from Telegram chat 2 as well for comparison
//     });
    
//   } catch (error) {
//     console.error('Error posting to Facebook or Telegram:', error.response ? error.response.data : error.message);
//     res.status(500).json({ error: 'Failed to post message', details: error.response ? error.response.data : error.message });
//   }
// });



// Facebook and Telegram credentials
const pageAccessToken = 'EAAF1pWMJ19YBO6AKdXpgQvDEE7pke4wo5G5cFSyTPmVNWnWhilLMLUZAG6KCdwe6C6e7Ivdd0mgrR1YW9EuMzan6gZBqdlQTBfq66sWtwsnbRmPRdMtro3zRkOJhZB03VL3jgZCtsXlP8ZCGk66fwbAh9BtaruXNA0vH724OKgBn1GNEbPGqR8w7vRhJ3cQp7bWVTy3OLaQw49wCwhoRq7aV4EgsZD';
const pageId = '107493672373057';
const telegramBotToken = '6685274704:AAE7ausiXp1M7AOG0wUB5f0pOO97Q8RDgzE';
const telegramChatId = '@lomiworks';
const telegramChatId2 = '@Education_Minstry';

// API route to post message and images to Facebook and/or Telegram
app.post('/api/postToFacebook', upload.array('images', 5), async (req, res) => {
  const { message, postToFacebook, postToTelegram } = req.body;
  const images = req.files; // Images uploaded by user
  
  try {
    // Initialize variables for Facebook and Telegram results
    let facebookPostId, telegramResult, telegramResult2;

    // Facebook posting logic

    if (postToFacebook === 'true') {
      if (images.length === 0 && message) {
        // Only text, post message to Facebook
        const postResponse = await axios.post(`https://graph.facebook.com/v14.0/${pageId}/feed`, {
          message,
          access_token: pageAccessToken
        });
        facebookPostId = postResponse.data.id;
      } else if (images.length > 0 && !message) {
        // Only images, post images to Facebook
        const uploadedImages = await Promise.all(images.map(async (image) => {
          const formData = new FormData();
          formData.append('source', image.buffer, {
            filename: image.originalname,
            contentType: image.mimetype,
          });
          formData.append('published', 'false'); // Do not publish yet
          formData.append('access_token', pageAccessToken);

          const response = await axios.post(`https://graph.facebook.com/v14.0/${pageId}/photos`, formData, {
            headers: formData.getHeaders()
          });
          return response.data.id; // Facebook image ID (media_fbid)
        }));

        const mediaAttachments = uploadedImages.map((id) => ({ media_fbid: id }));
        const postResponse = await axios.post(`https://graph.facebook.com/v14.0/${pageId}/feed`, {
          attached_media: mediaAttachments,
          access_token: pageAccessToken
        });
        facebookPostId = postResponse.data.id;
      } else if (images.length > 0 && message) {
        // Both message and images, post both to Facebook
        const uploadedImages = await Promise.all(images.map(async (image) => {
          const formData = new FormData();
          formData.append('source', image.buffer, {
            filename: image.originalname,
            contentType: image.mimetype,
          });
          formData.append('published', 'false');
          formData.append('access_token', pageAccessToken);

          const response = await axios.post(`https://graph.facebook.com/v14.0/${pageId}/photos`, formData, {
            headers: formData.getHeaders()
          });
          return response.data.id;
        }));

        const mediaAttachments = uploadedImages.map((id) => ({ media_fbid: id }));
        const postResponse = await axios.post(`https://graph.facebook.com/v14.0/${pageId}/feed`, {
          message,
          attached_media: mediaAttachments,
          access_token: pageAccessToken
        });
        facebookPostId = postResponse.data.id;
      }
    }

    // // Telegram posting logic
    // if (postToTelegram === 'true') {
    //   const telegramMedia = images.map((image, index) => ({
    //     type: 'photo',
    //     media: `attach://${image.originalname}`,
    //     caption: index === 0 ? message : '', // Add caption only to the first image
    //   }));

    //   if (images.length === 0 && message) {
    //     // Only text, post message to Telegram
    //     telegramResult = await axios.post(`https://api.telegram.org/bot${telegramBotToken}/sendMessage`, {
    //       chat_id: telegramChatId,
    //       text: message,
    //     });
    //     telegramResult2 = await axios.post(`https://api.telegram.org/bot${telegramBotToken}/sendMessage`, {
    //       chat_id: telegramChatId2,
    //       text: message,
    //     });
    //   } else if (images.length > 0 && !message) {
    //     // Only images, post images to Telegram
    //     const telegramFormData = new FormData();
    //     telegramFormData.append('chat_id', telegramChatId);
    //     telegramFormData.append('media', JSON.stringify(telegramMedia));

    //     images.forEach((image) => {
    //       telegramFormData.append(image.originalname, image.buffer, {
    //         filename: image.originalname,
    //         contentType: image.mimetype,
    //       });
    //     });

    //     const telegramFormData2 = new FormData();
    //     telegramFormData2.append('chat_id', telegramChatId2);
    //     telegramFormData2.append('media', JSON.stringify(telegramMedia));

    //     images.forEach((image) => {
    //       telegramFormData2.append(image.originalname, image.buffer, {
    //         filename: image.originalname,
    //         contentType: image.mimetype,
    //       });
    //     });

    //     telegramResult = await axios.post(`https://api.telegram.org/bot${telegramBotToken}/sendMediaGroup`, telegramFormData, {
    //       headers: telegramFormData.getHeaders(),
    //     });
    //     telegramResult2 = await axios.post(`https://api.telegram.org/bot${telegramBotToken}/sendMediaGroup`, telegramFormData2, {
    //       headers: telegramFormData2.getHeaders(),
    //     });
    //   } else if (images.length > 0 && message) {
    //     // Both message and images, post both to Telegram
    //     const telegramFormData = new FormData();
    //     telegramFormData.append('chat_id', telegramChatId);
    //     telegramFormData.append('media', JSON.stringify(telegramMedia));

    //     images.forEach((image) => {
    //       telegramFormData.append(image.originalname, image.buffer, {
    //         filename: image.originalname,
    //         contentType: image.mimetype,
    //       });
    //     });

    //     const telegramFormData2 = new FormData();
    //     telegramFormData2.append('chat_id', telegramChatId2);
    //     telegramFormData2.append('media', JSON.stringify(telegramMedia));

    //     images.forEach((image) => {
    //       telegramFormData2.append(image.originalname, image.buffer, {
    //         filename: image.originalname,
    //         contentType: image.mimetype,
    //       });
    //     });

    //     telegramResult = await axios.post(`https://api.telegram.org/bot${telegramBotToken}/sendMediaGroup`, telegramFormData, {
    //       headers: telegramFormData.getHeaders(),
    //     });
    //     telegramResult2 = await axios.post(`https://api.telegram.org/bot${telegramBotToken}/sendMediaGroup`, telegramFormData2, {
    //       headers: telegramFormData2.getHeaders(),
    //     });
    //   }
    // }
// Telegram posting logic
if (postToTelegram === 'true') {
  const telegramMedia = images.map((image, index) => {
    let caption = index === 0 ? message : ''; // Add caption only to the first image
    if (caption.length > 1024) {
      caption = caption.substring(0, 1021) + '...'; // Trim caption to fit within 1024 characters
    }

    return {
      type: 'photo',
      media: `attach://${image.originalname}`,
      caption,
    };
  });

  if (images.length === 0 && message) {
    // Only text, post message to Telegram
    telegramResult = await axios.post(`https://api.telegram.org/bot${telegramBotToken}/sendMessage`, {
      chat_id: telegramChatId,
      text: message.length > 4096 ? message.substring(0, 4093) + '...' : message, // Ensure message fits Telegram's text limit
    });
    telegramResult2 = await axios.post(`https://api.telegram.org/bot${telegramBotToken}/sendMessage`, {
      chat_id: telegramChatId2,
      text: message.length > 4096 ? message.substring(0, 4093) + '...' : message,
    });
  } else if (images.length > 0 && !message) {
    // Only images, post images to Telegram
    const telegramFormData = new FormData();
    telegramFormData.append('chat_id', telegramChatId);
    telegramFormData.append('media', JSON.stringify(telegramMedia));

    images.forEach((image) => {
      telegramFormData.append(image.originalname, image.buffer, {
        filename: image.originalname,
        contentType: image.mimetype,
      });
    });

    const telegramFormData2 = new FormData();
    telegramFormData2.append('chat_id', telegramChatId2);
    telegramFormData2.append('media', JSON.stringify(telegramMedia));

    images.forEach((image) => {
      telegramFormData2.append(image.originalname, image.buffer, {
        filename: image.originalname,
        contentType: image.mimetype,
      });
    });

    telegramResult = await axios.post(`https://api.telegram.org/bot${telegramBotToken}/sendMediaGroup`, telegramFormData, {
      headers: telegramFormData.getHeaders(),
    });
    telegramResult2 = await axios.post(`https://api.telegram.org/bot${telegramBotToken}/sendMediaGroup`, telegramFormData2, {
      headers: telegramFormData2.getHeaders(),
    });
  } else if (images.length > 0 && message) {
    // Both message and images, post both to Telegram
    const telegramFormData = new FormData();
    telegramFormData.append('chat_id', telegramChatId);
    telegramFormData.append('media', JSON.stringify(telegramMedia));

    images.forEach((image) => {
      telegramFormData.append(image.originalname, image.buffer, {
        filename: image.originalname,
        contentType: image.mimetype,
      });
    });

    const telegramFormData2 = new FormData();
    telegramFormData2.append('chat_id', telegramChatId2);
    telegramFormData2.append('media', JSON.stringify(telegramMedia));

    images.forEach((image) => {
      telegramFormData2.append(image.originalname, image.buffer, {
        filename: image.originalname,
        contentType: image.mimetype,
      });
    });

    telegramResult = await axios.post(`https://api.telegram.org/bot${telegramBotToken}/sendMediaGroup`, telegramFormData, {
      headers: telegramFormData.getHeaders(),
    });
    telegramResult2 = await axios.post(`https://api.telegram.org/bot${telegramBotToken}/sendMediaGroup`, telegramFormData2, {
      headers: telegramFormData2.getHeaders(),
    });
  }
}

    // Respond with the post IDs/results from both platforms
    res.status(200).json({
      message: 'Post successful!',
      facebookPostId: facebookPostId || null,
      telegramResult: telegramResult?.data || null,
      telegramResult2: telegramResult2?.data || null,
    });
  } catch (error) {
    console.error('Error posting to platforms:', error.response ? error.response.data : error.message);
    res.status(500).json({ error: 'Failed to post message', details: error.response ? error.response.data : error.message });
  }
});
 
 
// const axios = require('axios');
// const multer = require('multer');
// const FormData = require('form-data');
// const path = require('path');

 
// // Configure multer for file uploads
// const upload = multer();

// app.post('/api/postToFacebook', upload.array('images', 5), async (req, res) => {
//   const { message } = req.body;
//   const images = req.files; // Files uploaded by user
//   const pageAccessToken = 'EAAF1pWMJ19YBO8axx4evFZA3XywqF26xiYrsEYZCqWr4450qeZBNo6rw9xPXPWjuQMkcVwJCOADyOsHuv4SR9n4iLZCQ1MC8AjDAS30hudcmE6j5ZCELngvqo81de7nWFAjYCIldL10Cptg2uZC1sFOlaSjaFN3rZAuKeFB2hLyTyZCNGKz9QWZAakz0gWAZBN6MW0Hk1MXEnPmbF3GEvck2c6HE0ZD';
//   const pageId = '107493672373057';

//   try {
//     // Upload each image first
//     const uploadedImages = await Promise.all(images.map(async (image) => {
//       const formData = new FormData();
//       formData.append('source', image.buffer, {
//         filename: image.originalname,
//         contentType: image.mimetype,
//       });
//       formData.append('access_token', pageAccessToken);

//       const response = await axios.post(`https://graph.facebook.com/v14.0/${pageId}/photos`, formData, {
//         headers: {
//           ...formData.getHeaders()
//         }
//       });

//       return response.data.id; // Returns Facebook image ID
//     }));

//     // Create a post with uploaded images
//     const photoIds = uploadedImages.map(id => `fbid=${id}`).join('&');
//     const postMessage = `${message}\n\n${photoIds}`;

//     const postResponse = await axios.post(`https://graph.facebook.com/v14.0/${pageId}/feed`, {
//       message: message,
//       attached_media: uploadedImages.map(id => ({ media_fbid: id })),
//       access_token: pageAccessToken
//     });

//     res.status(200).json({ postId: postResponse.data.id });
//   } catch (error) {
//     console.error('Error posting to Facebook:', error.response ? error.response.data : error.message);
//     res.status(500).json({ error: 'Failed to post message', details: error.response ? error.response.data : error.message });
//   }
// });


// Configure multer for file uploads
// const upload = multer();

// app.post('/api/postToFacebook', upload.array('images', 5), async (req, res) => {
//   const { message } = req.body;
//   const images = req.files; // Images uploaded by user
//   const pageAccessToken = 'EAAF1pWMJ19YBO7axqg9PfQSFC69kSZA8eHHaFXBen4q4pibZB1DHEBi6pNYspCuZAVON1ZBv3joFXgwBTOwBsIl9ScDk9kHE4Coty3IpN7vFZCD6RQlMN0GmkqDcos2dFQY8YWEJZAt386BZCxY4bwvnkXvdDmg8z8j8CpwwlCQJ1t2a4vMA5XKx1sN1g5vu6AZD';
//   const pageId = '107493672373057';

//   try {
//     // Upload each image and get their media_fbid
//     const uploadedImages = await Promise.all(images.map(async (image) => {
//       const formData = new FormData();
//       formData.append('source', image.buffer, {
//         filename: image.originalname,
//         contentType: image.mimetype,
//       });
//       formData.append('published', 'false'); // Do not publish yet, only upload
//       formData.append('access_token', pageAccessToken);

//       const response = await axios.post(`https://graph.facebook.com/v14.0/${pageId}/photos`, formData, {
//         headers: formData.getHeaders()
//       });

//       return response.data.id; // Facebook image ID (media_fbid)
//     }));

//     // Now, create a single post with multiple images attached
//     const mediaAttachments = uploadedImages.map((id) => ({
//       media_fbid: id
//     }));

//     const postResponse = await axios.post(`https://graph.facebook.com/v14.0/${pageId}/feed`, {
//       message: message,
//       attached_media: mediaAttachments,
//       access_token: pageAccessToken
//     });

//     res.status(200).json({ postId: postResponse.data.id });
//   } catch (error) {
//     console.error('Error posting to Facebook:', error.response ? error.response.data : error.message);
//     res.status(500).json({ error: 'Failed to post message', details: error.response ? error.response.data : error.message });
//   }
// });
// {
//   "access_token": "EAAF1pWMJ19YBO7axqg9PfQSFC69kSZA8eHHaFXBen4q4pibZB1DHEBi6pNYspCuZAVON1ZBv3joFXgwBTOwBsIl9ScDk9kHE4Coty3IpN7vFZCD6RQlMN0GmkqDcos2dFQY8YWEJZAt386BZCxY4bwvnkXvdDmg8z8j8CpwwlCQJ1t2a4vMA5XKx1sN1g5vu6AZD",
//   "token_type": "bearer",
//   "expires_in": 5124293
// }

  //GET https://graph.facebook.com/v14.0/me/accounts?access_token=LONG_LIVED_USER_ACCESS_TOKEN
  // GET https://graph.facebook.com/v14.0/oauth/access_token?  
  // grant_type=fb_exchange_token&  
  // client_id=410828168353750&  
  // client_secret=f52c5613bdf9b3691316856bf1674926&  
  // fb_exchange_token=EAAF1pWMJ19YBO7WyRvNZA0k9J2h63ywS7X3j4sARZBZCu08xogsw9rE2PeDl8wl3CPpyKchjnnLrC585bgw50arShQu2Sx9VgExakLVBGZCH8RL16c4Uo1w00ZAy4O8DiMWQIUGM96gM1YK31ZApRd2KjiB7nYY0QIkja2GbnvuwDSQr5wm9ZCO0Irwt55tjfahHnZAK2scUXxSAEhP4Rq5MZApQZD
  
const getPageId = async () => {
  const pageAccessToken = 'EAAF1pWMJ19YBO8axx4evFZA3XywqF26xiYrsEYZCqWr4450qeZBNo6rw9xPXPWjuQMkcVwJCOADyOsHuv4SR9n4iLZCQ1MC8AjDAS30hudcmE6j5ZCELngvqo81de7nWFAjYCIldL10Cptg2uZC1sFOlaSjaFN3rZAuKeFB2hLyTyZCNGKz9QWZAakz0gWAZBN6MW0Hk1MXEnPmbF3GEvck2c6HE0ZD';
  const pageId = '107493672373057';
  const apiUrl = `https://graph.facebook.com/v14.0/${pageId}/feed`;
  
  const message = 'Hello, this is a post from Node.js to my Facebook page!';
  
  axios.post(apiUrl, {
    message: message,
    access_token: pageAccessToken
  })
    .then(response => {
      console.log('Post ID:', response.data.id);
    })
    .catch(error => {
      console.error('Error posting to Facebook:', error.response.data);
    });
};

// getPageId();
//get all tasks
// Define the API route
app.get('/api/tasks/:id', authenticate, async (req, res) => {
  // Assuming the userId is stored in the JWT and available in req.user
  const userId = req.params.id;

  console.log('Fetching tasks for user ID:', userId);
  try {
      // Fetch tasks using the userId from the JWT
      const results = await getAllTasks(userId); // This function should handle fetching tasks from the database

      console.log('Fetched tasks:', results);
      // Send results in the desired format: data.data
      res.status(200).json({
          success: true,
          data: results // Wrap results in a data object
      });
  } catch (err) {
      console.error('Error fetching tasks:', err.message);
      res.status(500).json({
          success: false,
          message: err.message
      });
  }
});
const jwt = require('jsonwebtoken');
const secretKey = process.env.JWT_SECRET; // Use the same secret key you used to sign the token

app.get('/api/completed/:id', authenticate, async (req, res) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // Decode the token to get the userId
    const decoded = jwt.verify(token, secretKey);
    const userId = decoded.userId; // Make sure userId is in the token payload

    console.log('Fetching tasks for userId:', userId);

    // Fetch tasks using the userId
    const results = await CompletedJobs(userId);

    console.log('Fetched tasks:', results);
    // Send results in the desired format
    res.status(200).json({
      success: true,
      data: results // Wrap results in a data object
    });
  } catch (err) {
    console.error('Error fetching tasks:', err.message);
    res.status(500).json({
      success: false,
      message: 'Failed to authenticate token'
    });
  }
});

// app.get('/api/completed/:id', authenticate, async (req, res) => {
//   // Assuming the userId is stored in the JWT and available in req.user
//   const userId = req.params.id;

//   console.log('Fetching :', req);
//   try {
//       // Fetch tasks using the userId from the JWT
//       const results = await CompletedJobs(userId); // This function should handle fetching tasks from the database

//       console.log('Fetched tasks:', results);
//       // Send results in the desired format: data.data
//       res.status(200).json({
//           success: true,
//           data: results // Wrap results in a data object
//       });
//   } catch (err) {
//       console.error('Error fetching tasks:', err.message);
//       res.status(500).json({
//           success: false,
//           message: err.message
//       });
//   }
// });

// app.put('/api/tasks/:taskId/status', async (req, res) => {
//   const { taskId } = req.params;
//   const { status ,userId} = req.body;

//   console.log(`Updating task ${taskId} to status ${status}`);
//   try{
//   const results = await  confirmJob(taskId, status,userId)
//       res.status(200).json({
//           success: true,
//           data: results // Wrap results in a data object
//       });
      
//   } catch (err) {
//       console.error('Error fetching tasks:', err.message);
//       res.status(500).json({
//           success: false,
//           message: err.message
//       });
//   }

// });
// GET /api/jobs/active - Get active jobs for the technician
// Route to get active jobs count
app.get('/api/jobs/activeCount/:id', authenticate, async (req, res) => {
  const userId = req.params.id;

  console.log('Fetching tasks for user ID:', userId);

  try {
    const results = await activeJobsCount(userId);
    
    res.status(200).json({
      success: true,
      data: results // Wrap results in a data object
    });
  } catch (err) {
    console.error('Error fetching active jobs:', err.message);
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

// GET /api/tasks/completed - Get percentage of tasks completed
// Route to get completed tasks percentage
app.get('/api/tasks/completed/:id', authenticate, async (req, res) => {
  const userId = req.params.id;

  console.log('Fetching completed tasks for user ID:', userId);

  try {
    const percentage = await completedPercentage(userId);
    
    res.status(200).json({percentage:percentage});
  } catch (err) {
    console.error('Error fetching completed tasks:', err.message);
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});
app.put('/api/tasks/:taskId/status', async (req, res) => {
  const { taskId } = req.params;
  const { status, userId, departureLocation, dispatchTime, eta, driver,chat_id } = req.body;

  console.log(`Updating task ${taskId} to status ${req.body}`);
  try {
    // Pass all values to confirmJob
    const results = await confirmJob(taskId, status, userId, departureLocation, dispatchTime, eta, driver,chat_id);
    
    res.status(200).json({data: results});
  } catch (err) {
    console.error('Error updating task:', err.message);
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});
app.put('/api/reject-tasks/:taskId/status', async (req, res) => {
  const { taskId } = req.params;
  const { status, userId, data,description } = req.body;

  console.log(`Updating task ${taskId} to status ${req.body}`);
  try {
    // Pass all values to confirmJob
    const results = await rejectJob(taskId, status, userId, data,description);
    
    res.status(200).json({data: results});
  } catch (err) {
    console.error('Error updating task:', err.message);
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});
app.get('/api/confirmed-tasks/:id', authenticate, async (req, res) => {
  // Assuming the userId is stored in the JWT and available in req.user
  const userId = req.params.id;

  console.log('Fetching tasks for user ID:', userId);
  try {
      // Fetch tasks using the userId from the JWT
      const results = await getAllConfirmedTasks(userId); // This function should handle fetching tasks from the database

      console.log('Fetched tasks:', results);
      // Send results in the desired format: data.data
      res.status(200).json({data: results});
  } catch (err) {
      console.error('Error fetching tasks:', err.message);
      res.status(500).json({
          success: false,
          message: err.message
      });
  }
});

app.get('/api/cancel-tasks/:id', authenticate, async (req, res) => {
  // Assuming the userId is stored in the JWT and available in req.user
  const userId = req.params.id;

  console.log('Fetching tasks for user ID:', userId);
  try {
      // Fetch tasks using the userId from the JWT
      const results = await getCancelJobs(userId); // This function should handle fetching tasks from the database

      console.log('Fetched tasks:', results);
      // Send results in the desired format: data.data
      res.status(200).json({data: results});
  } catch (err) {
      console.error('Error fetching tasks:', err.message);
      res.status(500).json({
          success: false,
          message: err.message
      });
  }
});
// app.get('/api/events/:userId', async (req, res) => {
//   const { userId } = req.params;

//   // Try fetching tasks initially to check for errors
//   try {
//     const initialResults = await getAllConfirmedTasks(1);

//     // Start the SSE connection headers if no error
//     res.setHeader('Content-Type', 'text/event-stream');
//     res.setHeader('Cache-Control', 'no-cache');
//     res.setHeader('Connection', 'keep-alive');
  
//     // Initial data push on successful connection
//     res.write(`data: ${JSON.stringify(initialResults)}\n\n`);
//   } catch (error) {
//     // Send initial error as JSON and end response if fetching fails
//     console.error("Initial error fetching tasks:", error);
//     return res.status(500).json({ error: "Error fetching tasks" });
//   }

//   // Function to send data periodically
//   const sendData = async () => {
//     try {
//       const results = await getAllConfirmedTasks(1);  
//       console.log('Fetched tasks:', results);
//       res.write(`data: ${JSON.stringify(results)}\n\n`);
//     } catch (error) {
//       console.error("Error fetching tasks:", error);
//       res.write(`data: ${JSON.stringify({ error: "Error fetching tasks" })}\n\n`);
//     }
//   };

//   // Interval to stream data
//   //const intervalId = setInterval(sendData, 30000);
//   const intervalId = setInterval(sendData, 86400000); // 24 hours in milliseconds

//   // Cleanup on client disconnect
//   req.on('close', () => {
//     clearInterval(intervalId);
//     res.end();
//     console.log(`Connection closed for user ${userId}`);
//   });
// });



app.put('/api/confirmed-tasks/:taskId/status', async (req, res) => {
  const { taskId } = req.params;
  const { status ,userId, description,data,salary} = req.body;

  console.log(`Updating task ${taskId} to status ${status}`);
  try{
  const results = await  CompleteJob(taskId, status,userId,description,data,salary)
  res.status(200).json({data: results});
      
  } catch (err) {
      console.error('Error fetching tasks:', err.message);
      res.status(500).json({
          success: false,
          message: err.message
      });
  }

});


app.put('/api/cancel-tasks/:taskId/status', async (req, res) => {
  const { taskId } = req.params;
  const { status ,userId, description,data} = req.body;

  console.log(`Updating task ${taskId} to status ${status}`);
  try{
  const results = await  CancelJob(taskId, status,userId,description,data)
      res.status(200).json({data: results});
      
  } catch (err) {
      console.error('Error fetching tasks:', err.message);
      res.status(500).json({
          success: false,
          message: err.message
      });
  }

});


app.get('/api/totalSalary/:userId', async (req, res) => {
  const { userId } = req.params;

 

  console.log(`Updating task ${userId}  `);
  try{
  const results = await  totalSalary(userId)
      res.status(200).json({totalSalary: results});
      
  } catch (err) {
      console.error('Error fetching tasks:', err.message);
      res.status(500).json({
          success: false,
          message: err.message
      });
  }

});



//reports

 

app.get('/api/reports/users', authenticate, authorizeRole("1"), async (req, res) => {
  
  try{
  const results = await  getAllTechniciansCount()
      res.status(200).json({totalUsersCount: results});
      console.log(results)
  } catch (err) {
      console.error('Error fetching tasks:', err.message);
      res.status(500).json({
          success: false,
          message: err.message
      });
  }

});

app.get('/api/reports/confirmed-tasks', authenticate, authorizeRole("1"), async (req, res) => {
  try {
      const results = await getConfirmedTasksCount(); // Implement this function
      res.status(200).json({ confirmedTasksCount: results });
  } catch (err) {
      console.error('Error fetching confirmed tasks:', err.message);
      res.status(500).json({ success: false, message: err.message });
  }
});

app.get('/api/reports/completed', authenticate, authorizeRole("1"), async (req, res) => {
  try {
      const results = await getCompletedTasksCount(); // Implement this function
      res.status(200).json({ completedTasksCount: results });
  } catch (err) {
      console.error('Error fetching completed tasks:', err.message);
      res.status(500).json({ success: false, message: err.message });
  }
});

app.get('/api/reports/cancel-tasks', authenticate, authorizeRole("1"), async (req, res) => {
  try {
      const results = await getCanceledTasksCount(); // Implement this function
      res.status(200).json({ canceledTasksCount: results });
  } catch (err) {
      console.error('Error fetching canceled tasks:', err.message);
      res.status(500).json({ success: false, message: err.message });
  }
});

app.get('/api/reports/tasks', authenticate, authorizeRole("1"), async (req, res) => {
  try {
      const results = await getAllTasksCount(); // Implement this function
      res.status(200).json({ totalTasksCount: results });
  } catch (err) {
      console.error('Error fetching all tasks:', err.message);
      res.status(500).json({ success: false, message: err.message });
  }
});

app.get('/api/reports/totalSalary', authenticate, authorizeRole("1"), async (req, res) => {
  try {
      const results = await getTotalSalary(); // Implement this function
      res.status(200).json({ totalSalary: results });
  } catch (err) {
      console.error('Error fetching total salary:', err.message);
      res.status(500).json({ success: false, message: err.message });
  }
});


app.get('/api/reports/percent', authenticate,authorizeRole("1"), async (req, res) => {
 
 

  try {
    const percentage = await allCompletedPercentage();
    
    res.status(200).json({percentage:percentage});
  } catch (err) {
    console.error('Error fetching completed tasks:', err.message);
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});
app.get('/api/reports/totalJobsCount', authenticate,authorizeRole("1"), async (req, res) => {
 
 

  try {
    const totalJobsCount = await allJobsCount();
    
    res.status(200).json({totalJobsCount:totalJobsCount});
  } catch (err) {
    console.error('Error fetching completed tasks:', err.message);
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});
app.get('/api/total-completed', authenticate, authorizeRole("1"), async (req, res) => {
  const { page = 1, pageSize = 10, search = '', filterByStatus = '', startDate = '', endDate = '' } = req.query;

  try {
      const { tasks, totalTasks } = await totalCompletedJobs(
          parseInt(page),
          parseInt(pageSize),
          search,
          filterByStatus,
          startDate,
          endDate
      );
      res.json({
          data: tasks,
          totalTasks,
          totalPages: Math.ceil(totalTasks / pageSize),
      });
  } catch (error) {
      console.error('Error fetching tasks:', error);
      res.status(500).json({ error: 'Server Error' });
  }
});

app.post('/api/upload-excel', async (req, res) => {
  const data = req.body;
  console.log(data); // Logging to see incoming data

  try {
    await  importExcel(data); // Call the importExcel method on Job

    res.status(200).json({ message: "Data imported successfully" });
  } catch (error) {
    console.error("Error processing data:", error);
    res.status(500).json({ message: 'Error processing data' });
  }
});

const PORT = process.env.PORT || 30000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
//7Z414ZXU5FMY5V6ENZ9ESQ7A recovery code