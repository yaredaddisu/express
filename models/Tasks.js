const pool = require('../db');
const jwt = require('jsonwebtoken');
const axios = require('axios');

const checkTechnicianExists = async (technician_id) => {
    const query = 'SELECT * FROM users WHERE id = ?';
    const [rows] = await pool.execute(query, [technician_id]);
    return rows.length > 0;
  };
  const telegramToken = "6685274704:AAFR-NXKCnfe7RZy9tGq5Swn2A0tDkTsrBU";
  const telegramChatId = "-1002342344184";  // Use provided chat_id

   // Helper function to calculate completed tasks percentage
const completedPercentage = async (userId) => { 
  try {
    const [[{ totalJobs }]] = await pool.query(
      'SELECT COUNT(*) AS totalJobs FROM jobs WHERE technician_id = ?',
      [userId]
    );

    const [[{ completedJobs }]] = await pool.query(
      'SELECT COUNT(*) AS completedJobs FROM jobs WHERE technician_id = ? AND status = "2"', // "2" should correspond to "Completed" in your database
      [userId]
    );

    const percentageCompleted = totalJobs ? (completedJobs / totalJobs) * 100 : 0;
    return Math.round(percentageCompleted); // Return the rounded percentage
  } catch (error) {
    console.error('Error fetching tasks completed:', error);
    throw new Error('Failed to fetch tasks completed');
  }
};

  const getCancelJobs = async (userId) => {
    const query = `
      SELECT * FROM jobs
      WHERE status = "0" AND technician_id = ?  
    `;
  
    try {
        const [rows] = await pool.execute(query, [userId]); // Use userId instead of id
        return rows;
    } catch (err) {
        console.error('Error retrieving data: ', err);
        throw new Error('Database error');
    }
};
  const getAllTasks = async (userId) => {
    const query = `
      SELECT * FROM jobs
      WHERE status = "1" AND technician_id = ?  
    `;
  
    try {
        const [rows] = await pool.execute(query, [userId]); // Use userId instead of id
        return rows;
    } catch (err) {
        console.error('Error retrieving data: ', err);
        throw new Error('Database error');
    }
};
 
//   const getAllConfirmedTasks = async (userId) => {
//     const query = `
//       SELECT * FROM jobs
//       WHERE status = "3" AND user_id = ?  
//     `;
  
//     try {
//         const [rows] = await pool.execute(query, [userId]); // Use userId instead of id
//         return rows;
//     } catch (err) {
//         console.error('Error retrieving data: ', err);
//         throw new Error('Database error');
//     }
// };
const getAllConfirmedTasks = async (userId) => {
  const query = `
    SELECT 
      jobs.id AS jobId,
      jobs.title,
      jobs.description,
      jobs.location,
      jobs.status,
      jobs.created_at AS jobCreatedAt,
      jobs.updated_at AS jobUpdatedAt,
      jobs.company,
      jobs.Reference,
      jobs.salary,
      jobs.phone,

      job_technicians.technician_id,
      job_technicians.departureLocation,
      job_technicians.dispatchTime,
      job_technicians.eta,
      job_technicians.driver,
      job_technicians.status AS technicianStatus,
      job_technicians.created_at AS technicianCreatedAt,
      job_technicians.updated_at AS technicianUpdatedAt,
      job_technicians.chat_id,
      job_technicians.messageId,
      job_technicians.description AS technicianDescription

    FROM jobs
    INNER JOIN job_technicians ON jobs.id = job_technicians.job_id
    WHERE jobs.status = "3" AND jobs.technician_id = ?
  `;

  try {
      const [rows] = await pool.execute(query, [userId]);
      return rows;
  } catch (err) {
      console.error('Error retrieving data:', err);
      throw new Error('Database error');
  }
};

   const CompletedJobs = async (userId) => {
    const query = `
    SELECT 
      jobs.id AS jobId,
      jobs.title,
      jobs.description,
      jobs.location,
        jobs.company,
         jobs.Reference,
      jobs.salary,
         jobs.phone,
      jobs.status,
      jobs.created_at AS jobCreatedAt,
      jobs.updated_at AS jobUpdatedAt,
      
      job_technicians.technician_id,
      job_technicians.departureLocation,
      job_technicians.dispatchTime,
      job_technicians.eta,
      job_technicians.driver,
      job_technicians.status AS technicianStatus,
      job_technicians.created_at AS technicianCreatedAt,
      job_technicians.updated_at AS technicianUpdatedAt,
      job_technicians.chat_id,
      job_technicians.messageId,
      job_technicians.description AS technicianDescription

    FROM jobs
    INNER JOIN job_technicians ON jobs.id = job_technicians.job_id
    WHERE jobs.status = "2" AND jobs.technician_id = ?
  `;
  
    try {
        const [rows] = await pool.execute(query, [userId]); // Use userId instead of id
        return rows;
    } catch (err) {
        console.error('Error retrieving data: ', err);
        throw new Error('Database error');
    }
};
// const confirmJob = async (taskId, status, userId) => {
    
//   console.log(status)
//     // Proceed with the update if validation passes
//     try {
//         const [result] = await pool.execute(
//             'UPDATE jobs SET status =  ?  WHERE id = ? ' ,[status, taskId]
              
          
//           );
//           const [result2] = await pool.execute(
//             'UPDATE users SET availability =  ?  WHERE id = ? ' ,["0", userId]
              
          
//           );
//       // If the update was successful, fetch the updated record
//       if (result.affectedRows > 0 &&  result2.affectedRows > 0 ) {
//         const [updatedUser] = await pool.execute('SELECT * FROM jobs WHERE id = ?', [taskId]);
//         const [users] = await pool.execute('SELECT * FROM users WHERE id = ?', [userId]);

//         const user = users[0]

//         console.log(user)

//         const token = jwt.sign({ userId: user.id, chatId: user.chat_id, user:user }, process.env.JWT_SECRET, { expiresIn: '1h' });

//         return { success: true, data: updatedUser[0], token:token,message: 'Updated successfully.'  }; // Return the first user in the result
//       }
  
//       return { success: false, message: 'User not found or no changes made.' };
//     } catch (err) {
//       console.error('Error updating user:', err);
//       return { success: false, message: `Database error: ${err.message}` }; 
//     }
//   }
const confirmJob = async (taskId, status, userId, departureLocation, dispatchTime, eta, driver, chat_id) => {
  try {
    // Step 0: Check if the job has already been assigned to the technician
    const [existingAssignment] = await pool.execute(
      'SELECT id FROM job_technicians WHERE job_id = ? AND technician_id = ?',
      [taskId, userId]
    );

    // If an assignment already exists, return a message indicating that
    if (existingAssignment.length > 0) {
      return { success: false, message: 'Job has already been assigned to this technician.' };
    }

    // Step 1: Update the job and user status
    const [result] = await pool.execute('UPDATE jobs SET status = ? WHERE id = ?', [status, taskId]);
    const [result2] = await pool.execute('UPDATE users SET availability = ? WHERE id = ?', ["0", userId]);

    // Step 2: If the above updates were successful, insert into job_technicians table
    if (result.affectedRows > 0 && result2.affectedRows > 0) {
      const [result3] = await pool.execute(
        'INSERT INTO job_technicians (technician_id, job_id, departureLocation, dispatchTime, eta, driver, status, chat_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [userId, taskId, departureLocation, dispatchTime, eta, driver, status, chat_id]
      );

      const jobTechnicianId = result3.insertId; // Capture the inserted record's ID

      // Step 3: Join users, jobs, and job_technicians tables to fetch comprehensive details
      const [jobTechnicianDetails] = await pool.execute(
        `SELECT jt.id, jt.technician_id, jt.job_id, jt.departureLocation, jt.dispatchTime, jt.eta, jt.driver, jt.status, jt.chat_id, jt.created_at, jt.updated_at,
                u.firstName AS technicianName, u.lastName AS technicianLastName, u.phone AS technicianPhone, 
                j.title AS jobTitle, j.description AS jobDescription, j.location AS jobLocation, j.Reference AS jobReference
         FROM job_technicians jt
         JOIN users u ON jt.technician_id = u.id
         JOIN jobs j ON jt.job_id = j.id
         WHERE jt.id = ?`,
        [jobTechnicianId]
      );

      const jobTechDetail = jobTechnicianDetails[0];
     // console.log(jobTechDetail);
      function formatTime(timeString) {
        if (!timeString) return 'Pending';
        const today = new Date().toISOString().split('T')[0]; // Get today's date in 'YYYY-MM-DD' format
        const fullDateTime = `${today}T${timeString}`; // Combine date with time string
        return new Date(fullDateTime).toLocaleString(); // Convert to localized date-time format
      }
      
     
    
      
      // Step 4: Construct the detailed message text
      const messageText = `
      🚀 <b>Job Confirmation</b>\n
      <b>Job ID:</b> #${jobTechDetail.job_id || 'N/A'}\n
      <b>Technician:</b> ${jobTechDetail.technicianName || 'N/A'} ${jobTechDetail.technicianLastName || ''} (#${jobTechDetail.technician_id || 'N/A'})\n
      
      📋 <b>Job Details</b>\n
      <b>Reference:</b> ${jobTechDetail.jobReference || 'Not provided'}\n
      <b>Title:</b> ${jobTechDetail.jobTitle || 'Not specified'}\n
      <b>Description:</b> ${jobTechDetail.jobDescription || 'No description available'}\n
      <b>Location:</b> ${jobTechDetail.jobLocation || 'Location not specified'}\n
      <b>Status:</b> ${jobTechDetail.status   ? 'In Progress 🟢' : ' '}\n
      
      📍 <b>Dispatch Information</b>\n
      <b>Departure:</b> ${jobTechDetail.departureLocation || 'Not specified'}\n
      <b>Dispatch Time:</b> ${formatTime(jobTechDetail.dispatchTime)}\n
      <b>ETA:</b> ${formatTime(jobTechDetail.eta)}\n  
      <b>Driver:</b> ${jobTechDetail.driver || 'Driver not assigned'}\n
      
      📞 <b>Technician Contact</b>\n
      <b>Phone:</b> ${jobTechDetail.technicianPhone || 'No phone available'}\n
      <b>Email:</b> ${jobTechDetail.email || 'N/A'}\n
      <b>Username:</b> @${jobTechDetail.username || 'N/A'}\n
      
      📅 <b>Audit Information</b>\n
      <b>Created At:</b> ${jobTechDetail.created_at ? new Date(jobTechDetail.created_at).toLocaleString() : 'N/A'}\n
      <b>Updated At:</b> ${jobTechDetail.updated_at ? new Date(jobTechDetail.updated_at).toLocaleString() : 'N/A'}
      `;

      // Step 5: Send message to Telegram channel
      let telegramResponse;
      try {
        telegramResponse = await axios.post(
          `https://api.telegram.org/bot${telegramToken}/sendMessage`,
          {
            chat_id: telegramChatId,
            text: messageText,
            parse_mode: 'HTML',
          }
        );
      } catch (error) {
        console.error('Telegram API error:', error);
        return { success: false, message: 'Failed to send message to Telegram.' };
      }

      if (!telegramResponse || !telegramResponse.data.ok) {
        return { success: false, message: 'Telegram message failed to send.' };
      }

      // Capture the message_id from the Telegram response
      const messageId = telegramResponse.data.result.message_id;

      // Step 6: Update job_technicians table with the messageId from Telegram
      await pool.execute(
        'UPDATE job_technicians SET messageId = ? WHERE id = ?',
        [messageId, jobTechnicianId]
      );

      // Fetch the updated job details
      const [updatedUser] = await pool.execute('SELECT * FROM jobs WHERE id = ?', [taskId]);
      const [users] = await pool.execute('SELECT * FROM users WHERE id = ?', [userId]);

      const user = users[0];
      const token = jwt.sign(
        { userId: user.id, chatId: user.chat_id, user: user },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      return { success: true, data: updatedUser[0], token: token, message: 'Updated successfully.' };
    } else {
      const [users] = await pool.execute('SELECT * FROM users WHERE id = ?', [userId]);

      const user = users[0];
      console.log(user);
      const token = jwt.sign({ userId: user.id, chatId: user.chat_id, user: user }, process.env.JWT_SECRET, { expiresIn: '1h' });

      return { success: false, token: token, message: 'User not found or no changes made.' };
    }
  } catch (err) {
    console.error('Error updating job:', err);
    return { success: false, message: `Database error: ${err.message}` };
  }
};


  

// const CompleteJob = async (taskId, status, userId, description,data) => {
    
//     console.log(data)
//       // Proceed with the update if validation passes
//       try {
//           const [result] = await pool.execute(
//               'UPDATE jobs SET status =  ?  WHERE id = ? ' ,[status, taskId]
                
            
//             );
//             const [result3] = await pool.execute(
//               'UPDATE job_technicians SET status = ?, description = ? WHERE job_id = ?', 
//               [2, description, taskId]
//           );
          


//             const [result2] = await pool.execute(
//               'UPDATE users SET availability =  ?  WHERE id = ? ' ,["1", userId]
                
            
//             );

//             const messageText = `
//             🚀 <b>Job Confirmation</b>\n
//             <b>Job ID:</b> #${data.job_id || 'N/A'}\n
//             <b>Technician:</b> ${data.technicianName || 'N/A'} ${data.technicianLastName || ''} (#${data.technician_id || 'N/A'})\n
            
//             📋 <b>Job Details</b>\n
//             <b>Reference:</b> ${data.jobReference || 'Not provided'}\n
//             <b>Title:</b> ${data.jobTitle || 'Not specified'}\n
//             <b>Description:</b> ${data.jobDescription || 'No description available'}\n
//             <b>Location:</b> ${data.jobLocation || 'Location not specified'}\n
//             <b>Status:</b> ${data.status   ? 'In Progress 🟢' : ' '}\n
            
//             📍 <b>Dispatch Information</b>\n
//             <b>Departure:</b> ${data.departureLocation || 'Not specified'}\n
//             <b>Dispatch Time:</b> ${data.dispatchTime ? new Date(data.dispatchTime).toLocaleString() : 'Pending'}\n
//             <b>ETA:</b> ${data.eta ? new Date(data.eta).toLocaleString() : 'Pending'}\n
//             <b>Driver:</b> ${data.driver || 'Driver not assigned'}\n
            
//             📞 <b>Technician Contact</b>\n
//             <b>Phone:</b> ${data.technicianPhone || 'No phone available'}\n
//             <b>Email:</b> ${data.email || 'N/A'}\n
//             <b>Username:</b> @${data.username || 'N/A'}\n
            
//             📅 <b>Audit Information</b>\n
//             <b>Created At:</b> ${data.created_at ? new Date(data.created_at).toLocaleString() : 'N/A'}\n
//             <b>Updated At:</b> ${data.updated_at ? new Date(data.updated_at).toLocaleString() : 'N/A'}
//             `;
            
             
//                   // Step 5: Send message to Telegram channel
//                   const telegramToken = "7510338289:AAEbfxSOjN-1ZC9CLTaSbmOju_814rbyr8g";
//                   const telegramChatId = "@lomiworks";
                  
//                   let telegramResponse;
//                   try {
//                     telegramResponse = await axios.post(
//                       `https://api.telegram.org/bot${telegramToken}/sendMessage`,
//                       {
//                         chat_id: telegramChatId,
//                         text: messageText,  
//                         parse_mode: 'HTML', parse_mode: 'HTML',
//                       }
//                     );
//                   } catch (error) {
//                     console.error('Telegram API error:', error);
//                     return { success: false, message: 'Failed to send message to Telegram.' };
//                   }
            
//                   if (!telegramResponse || !telegramResponse.data.ok) {
//                     return { success: false, message: 'Telegram message failed to send.' };
//                   }
//         // If the update was successful, fetch the updated record
//         if (result.affectedRows > 0 &&  result2.affectedRows > 0 &&  result3.affectedRows > 0 ) {
//           const [updatedUser] = await pool.execute('SELECT * FROM jobs WHERE id = ?', [taskId]);
//           const [users] = await pool.execute('SELECT * FROM users WHERE id = ?', [userId]);
  
//           const user = users[0]
  
     
  
//           const token = jwt.sign({ userId: user.id, chatId: user.chat_id, user:user }, process.env.JWT_SECRET, { expiresIn: '1h' });
  
//           return { success: true, data: updatedUser[0], token:token,message: 'Updated successfully.'  }; // Return the first user in the result
//         }
    
//         return { success: false, message: 'User not found or no changes made.' };
//       } catch (err) {
//         console.error('Error updating user:', err);
//         return { success: false, message: `Database error: ${err.message}` }; 
//       }
//     }

const rejectJob = async (taskId, status, userId, data, description) => {
  try {
    // Fetch the technician details by ID
    const [technicianResult] = await pool.execute(
      'SELECT * FROM users WHERE id = ?',
      [data.technician_id]
    );
    const technician = technicianResult[0] || {};
  
    // Build the message text
    const messageText = `
      🚀 <b>Job Rejection</b>\n
      <b>Job ID:</b> #${data.id || 'N/A'}\n
      <b>Technician:</b> ${technician.firstName || 'N/A'} ${technician.lastName || ''} (#${technician.id || 'N/A'})\n
      📋 <b>Job Details</b>\n
      <b>Reference:</b> ${data.Reference || 'Not provided'}\n
      <b>Title:</b> ${data.title || 'Not specified'}\n
      <b>Description:</b> ${data.description || 'No description available'}\n
      <b>Location:</b> ${data.location || 'Location not specified'}\n
      <b>Status:</b> ${data.status === '1' ? 'Rejected 🔴' : 'In Progress 🔵'}\n
      📞 <b>Technician Contact</b>\n
      <b>Phone:</b> ${technician.phone || 'No phone available'}\n
      📅 <b>Audit Information</b>\n
      <b>Created At:</b> ${data.jobCreatedAt ? new Date(data.jobCreatedAt).toLocaleString() : 'N/A'}\n
      <b>Updated At:</b> ${data.jobUpdatedAt ? new Date(data.jobUpdatedAt).toLocaleString() : 'N/A'}
      📅 <b>Work Description</b>\n
      <b>Description:</b> ${description || 'No description available'}\n
    `;
  
    // Attempt to update the message on Telegram
    let telegramResponse;
    try {
      telegramResponse = await axios.post(
        `https://api.telegram.org/bot${telegramToken}/sendMessage`,
        {
          chat_id: telegramChatId,
          text: messageText,
          parse_mode: 'HTML'
        }
      );
    } catch (error) {
      console.error('Telegram API error:', error);
      return { success: false, message: 'Failed to send message to Telegram.' };
    }

    // Check if the Telegram message update was successful
    if (!telegramResponse || !telegramResponse.data.ok) {
      return { success: false, message: 'Telegram message failed to update.' };
    }

    // Proceed with database updates if Telegram update was successful
    const [result] = await pool.execute(
      'UPDATE jobs SET status = ? WHERE id = ?',
      [status, taskId]
    );

    const [result2] = await pool.execute(
      'UPDATE users SET availability = ? WHERE id = ?',
      ["1", userId]
    );

    // Check if all updates were successful
    if (result.affectedRows > 0 && result2.affectedRows > 0) {
      const [updatedUser] = await pool.execute('SELECT * FROM jobs WHERE id = ?', [taskId]);
      const [users] = await pool.execute('SELECT * FROM users WHERE id = ?', [userId]);

      const user = users[0];
      const token = jwt.sign({ userId: user.id, chatId: user.chat_id, user: user }, process.env.JWT_SECRET, { expiresIn: '1h' });

      return { success: true, data: updatedUser[0], token: token, message: 'Updated successfully.' };
    } else {
      const [users] = await pool.execute('SELECT * FROM users WHERE id = ?', [userId]);

      const user = users[0];
      const token = jwt.sign({ userId: user.id, chatId: user.chat_id, user: user }, process.env.JWT_SECRET, { expiresIn: '1h' });
      
      return { success: false, token: token, message: 'User not found or no changes made.' };
    }
  } catch (err) {
    console.error('Error updating user:', err);
    return { success: false, message: `Database error: ${err.message}` };
  }
};


const CompleteJob = async (taskId, status, userId, description, data) => {
  try {
       // Fetch the technician details by ID
       const [technicianResult] = await pool.execute(
        'SELECT * FROM users WHERE id = ?',
        [data.technician_id]
    );
    const technician = technicianResult[0] || {};
  
    // Build the message text
    const messageText = `
        🚀 <b>Job Confirmation</b>\n
        <b>Job ID:</b> #${data.jobId || 'N/A'}\n
        <b>Technician:</b> ${technician.firstName || 'N/A'} ${technician.lastName || ''} (#${technician.id || 'N/A'})\n
        📋 <b>Job Details</b>\n
        <b>Reference:</b> ${data.Reference || 'Not provided'}\n
        <b>Title:</b> ${data.title || 'Not specified'}\n
        <b>Description:</b> ${data.description || 'No description available'}\n
        <b>Location:</b> ${data.location || 'Location not specified'}\n
        <b>Status:</b> ${data.status === '3' ? 'Completed 🔵' : 'In Progress 🟢'}\n
        📍 <b>Dispatch Information</b>\n
        <b>Departure:</b> ${data.departureLocation || 'Not specified'}\n
        <b>Dispatch Time:</b> ${data.dispatchTime ? new Date(data.dispatchTime).toLocaleString() : 'Pending'}\n
        <b>ETA:</b> ${data.eta ? new Date(data.eta).toLocaleString() : 'Pending'}\n
        <b>Driver:</b> ${data.driver || 'Driver not assigned'}\n
        📞 <b>Technician Contact</b>\n
        <b>Phone:</b> ${technician.phone || 'No phone available'}\n
        📅 <b>Audit Information</b>\n
        <b>Created At:</b> ${data.jobCreatedAt ? new Date(data.jobCreatedAt).toLocaleString() : 'N/A'}\n
        <b>Updated At:</b> ${data.jobUpdatedAt ? new Date(data.jobUpdatedAt).toLocaleString() : 'N/A'}
  
        📅 <b>Work Description</b>\n
        <b>Description:</b> ${description || 'No description available'}\n
    `;
            

      const messageId = data.messageId; // Use provided messageId

      // Attempt to update the message on Telegram
      let telegramResponse;
      try {
          telegramResponse = await axios.post(
              `https://api.telegram.org/bot${telegramToken}/editMessageText`,
              {
                  chat_id: telegramChatId,
                  message_id: messageId,
                  text: messageText,
                  parse_mode: 'HTML'
              }
          );
      } catch (error) {
          console.error('Telegram API error:', error);
          return { success: false, message: 'Failed to update message on Telegram.' };
      }

      if (!telegramResponse || !telegramResponse.data.ok) {
          return { success: false, message: 'Telegram message failed to update.' };
      }

      // Proceed with database updates if Telegram update was successful
      const [result] = await pool.execute(
          'UPDATE jobs SET status = ? WHERE id = ?',
          [status, taskId]
      );
      const [result3] = await pool.execute(
          'UPDATE job_technicians SET status = ?, description = ? WHERE job_id = ?',
          ["2", description, taskId]
      );
      const [result2] = await pool.execute(
          'UPDATE users SET availability = ? WHERE id = ?',
          ["1", userId]
      );

      // Check if all updates were successful
      if (result.affectedRows > 0 && result2.affectedRows > 0 && result3.affectedRows > 0) {
          const [updatedUser] = await pool.execute('SELECT * FROM jobs WHERE id = ?', [taskId]);
          const [users] = await pool.execute('SELECT * FROM users WHERE id = ?', [userId]);

          const user = users[0];
          const token = jwt.sign({ userId: user.id, chatId: user.chat_id, user: user }, process.env.JWT_SECRET, { expiresIn: '1h' });

          return { success: true, data: updatedUser[0], token: token, message: 'Updated successfully.' };
      } else {
          const [users] = await pool.execute('SELECT * FROM users WHERE id = ?', [userId]);

          const user = users[0];
          const token = jwt.sign({ userId: user.id, chatId: user.chat_id, user: user }, process.env.JWT_SECRET, { expiresIn: '1h' });
          
          return { success: false, token: token, message: 'User not found or no changes made.' };
      }
      
  } catch (err) {
      console.error('Error updating user:', err);
      return { success: false, message: `Database error: ${err.message}` };
  }
};

const CancelJob = async (taskId, status, userId, description, data) => {
  try {

     // Fetch the technician details by ID
     const [technicianResult] = await pool.execute(
      'SELECT * FROM users WHERE id = ?',
      [data.technician_id]
  );
  const technician = technicianResult[0] || {};

  // Build the message text
  const messageText = `
      🚀 <b>Job Confirmation</b>\n
      <b>Job ID:</b> #${data.jobId || 'N/A'}\n
      <b>Technician:</b> ${technician.firstName || 'N/A'} ${technician.lastName || ''} (#${technician.id || 'N/A'})\n
      📋 <b>Job Details</b>\n
      <b>Reference:</b> ${data.Reference || 'Not provided'}\n
      <b>Title:</b> ${data.title || 'Not specified'}\n
      <b>Description:</b> ${data.description || 'No description available'}\n
      <b>Location:</b> ${data.location || 'Location not specified'}\n
      <b>Status:</b> ${data.status === '3' ? 'Completed 🔴' : 'In Progress 🟢'}\n
      📍 <b>Dispatch Information</b>\n
      <b>Departure:</b> ${data.departureLocation || 'Not specified'}\n
      <b>Dispatch Time:</b> ${data.dispatchTime ? new Date(data.dispatchTime).toLocaleString() : 'Pending'}\n
      <b>ETA:</b> ${data.eta ? new Date(data.eta).toLocaleString() : 'Pending'}\n
      <b>Driver:</b> ${data.driver || 'Driver not assigned'}\n
      📞 <b>Technician Contact</b>\n
      <b>Phone:</b> ${technician.phone || 'No phone available'}\n
      📅 <b>Audit Information</b>\n
      <b>Created At:</b> ${data.jobCreatedAt ? new Date(data.jobCreatedAt).toLocaleString() : 'N/A'}\n
      <b>Updated At:</b> ${data.jobUpdatedAt ? new Date(data.jobUpdatedAt).toLocaleString() : 'N/A'}

      📅 <b>Work Description</b>\n
      <b>Description:</b> ${description || 'No description available'}\n
  `;
          
 

      const messageId = data.messageId; // Use provided messageId

      // Attempt to update the message on Telegram
      let telegramResponse;
      try {
          telegramResponse = await axios.post(
              `https://api.telegram.org/bot${telegramToken}/editMessageText`,
              {
                  chat_id: telegramChatId,
                  message_id: messageId,
                  text: messageText,
                  parse_mode: 'HTML'
              }
          );
      } catch (error) {
          console.error('Telegram API error:', error);
          return { success: false, message: 'Failed to update message on Telegram.' };
      }

      if (!telegramResponse || !telegramResponse.data.ok) {
          return { success: false, message: 'Telegram message failed to update.' };
      }

      // Proceed with database updates if Telegram update was successful
      const [result] = await pool.execute(
          'UPDATE jobs SET status = ? WHERE id = ?',
          [status, taskId]
      );
      const [result3] = await pool.execute(
          'UPDATE job_technicians SET status = ?, description = ? WHERE job_id = ?',
          ["2", description, taskId]
      );
      const [result2] = await pool.execute(
          'UPDATE users SET availability = ? WHERE id = ?',
          ["1", userId]
      );

      // Check if all updates were successful
      if (result.affectedRows > 0 && result2.affectedRows > 0 && result3.affectedRows > 0) {
          const [updatedUser] = await pool.execute('SELECT * FROM jobs WHERE id = ?', [taskId]);
          const [users] = await pool.execute('SELECT * FROM users WHERE id = ?', [userId]);

          const user = users[0];
          const token = jwt.sign({ userId: user.id, chatId: user.chat_id, user: user }, process.env.JWT_SECRET, { expiresIn: '1h' });

          return { success: true, data: updatedUser[0], token: token, message: 'Updated successfully.' };
      } else {
          const [users] = await pool.execute('SELECT * FROM users WHERE id = ?', [userId]);

          const user = users[0];
          const token = jwt.sign({ userId: user.id, chatId: user.chat_id, user: user }, process.env.JWT_SECRET, { expiresIn: '1h' });
          
          return { success: false, token: token, message: 'User not found or no changes made.' };
      }
      
  } catch (err) {
      console.error('Error updating user:', err);
      return { success: false, message: `Database error: ${err.message}` };
  }
};

// const Cancelob = async (taskId, status, userId) => {
//   console.log(taskId);

//   try {
//     // Update the job status
//     const [result] = await pool.execute(
//       'UPDATE jobs SET status = ? WHERE id = ?', [status, taskId]
//     );

//     // Update the user availability
//     const [result2] = await pool.execute(
//       'UPDATE users SET availability = ? WHERE id = ?', ["1", userId]
//     );

//     // Check if both updates were successful
//     if (result.affectedRows > 0 && result2.affectedRows > 0) {
//       // Fetch the updated job and user records
//       const [updatedUser] = await pool.execute('SELECT * FROM jobs WHERE id = ?', [taskId]);
//       const [users] = await pool.execute('SELECT * FROM users WHERE id = ?', [userId]);

//       // Ensure both records are found
//       if (updatedUser.length > 0 && users.length > 0) {
//         const user = users[0];

//         // Generate the token with user details
//         const token = jwt.sign({ userId: user.id, chatId: user.chat_id, user: user }, process.env.JWT_SECRET, { expiresIn: '1h' });

//         return { success: true, data: updatedUser[0], token: token, message: 'Updated successfully.' };
//       } else {
//         return { success: false, message: 'User or job record not found after update.' };
//       }
//     }

//     // If any update failed
//     return { success: false, message: 'Update failed or no changes made.' };
//   } catch (err) {
//     console.error('Error updating user:', err);
//     return { success: false, message: `Database error: ${err.message}` };
//   }
// };


    const activeJobsCount = async (userId) => {
      try {
        const [activeJobs] = await pool.query(
          'SELECT * FROM jobs WHERE technician_id = ? AND status = "1"', // "1" should correspond to "In Progress" in your database
          [userId]
        );
        return activeJobs; // Return the jobs directly without sending the response
      } catch (error) {
        console.error('Error fetching active jobs:', error);
        throw new Error('Failed to fetch active jobs');
      }
    };


    const totalSalary = async (userId) => {
      try {
        const [result] = await pool.query(
          'SELECT SUM(salary) AS totalSalary FROM jobs WHERE technician_id = ? AND status = "2"', // Assuming "2" corresponds to "Completed" in your database
          [userId]
        );
        return result[0].totalSalary; // Access the calculated sum from the result
      } catch (error) {
        console.error('Error fetching total salary:', error);
        throw new Error('Failed to fetch total salary');
      }
    };
    

   
  const deleteJobById = async (jobId) => {
    const query = 'DELETE FROM jobs WHERE id = ?';
    
    try {
      const connection = await pool.getConnection();
      const [result] = await connection.execute(query, [jobId]);
      connection.release();
  
      if (result.affectedRows === 0) {
        return { success: false, message: 'Job not found' };
      }
      
      return { success: true, message: 'Job deleted successfully' };
    } catch (err) {
      console.error('Error deleting job:', err);
      throw err; // Rethrow the error to be caught by the route handler
    }
  };
  
  module.exports = {
 
    getAllTasks,
    confirmJob,
    getAllConfirmedTasks,
    CompleteJob,
    CompletedJobs,
    CancelJob,
    getCancelJobs,
    activeJobsCount,
    completedPercentage,
    totalSalary,
    rejectJob
 
  };
  

