// regionService.js
const pool = require('../db');
const bcrypt = require('bcryptjs');

const createUser = async (users) => {
    const { firstName, lastName, email, phone, password, chat_id, username, role, status, availability, skills } = users;
    const skillsJson = JSON.stringify(skills); // Convert skills array to JSON string
    const hashedPassword = await bcrypt.hash(password, 10);
     
    const query = 'INSERT INTO users (firstName, lastName, email, phone, password, chat_id, username, role, status, availability, skills) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
   // Basic validation for required fields
    const errors = [];
 
    if (!firstName || firstName.trim() === "") {
      errors.push("First name is required.");
    }
    if (!lastName || lastName.trim() === "") {
      errors.push("Last name is required.");
    }
    if (!email || !validateEmail(email)) {
      errors.push("Valid email is required.");
    }
    if (!phone || !validatePhone(phone)) {
      errors.push("Valid phone number is required.");
    }
    if (!["1", "0"].includes(status)) {
      errors.push("Status must be either 'active' or 'inactive'.");
    }
    if (!["1", "2", "3"].includes(role)) {
      errors.push("Role must be either 'admin', 'user', or 'guest'.");
    }
  
    // If validation errors exist, return the errors
    if (errors.length > 0) {
      return { success: false, errors };
    }
    try {
      const connection = await pool.getConnection();
      await connection.execute(query, [firstName, lastName, email, phone, hashedPassword, chat_id, username, role, status, availability, skillsJson]);
      connection.release(); // Release connection back to the pool
  
      return { success: true, message: 'Data inserted successfully' };
    } catch (err) {
      console.error('Error inserting data: ', err); // Log the actual error
  
      // Return the exact error message for better debugging
      return { success: false, message: `Database error: ${err.message}` }; 
    }
  };
  
  const getAllUsers = async (pageNumber, pageSize, searchTerm) => {
    const offset = (pageNumber - 1) * pageSize;
    const query = `
      SELECT * FROM users
      WHERE firstName LIKE ?
      LIMIT ? OFFSET ?
    `;
  
    try {
      const [rows] = await pool.execute(query, [searchTerm, pageSize, offset]);
  
      // Process each row to parse the skills JSON string
      const users = rows.map(user => {
        // Parse skills JSON string into an array of objects
        user.skills = JSON.parse(user.skills);
        // Array.isArray(user.skills) ? JSON.parse(user.skills) : [];
        return user;
      });
  
      return users;
    } catch (err) {
      console.error('Error retrieving data: ', err);
      throw new Error('Database error');
    }
  };
  
async function updateUser(userId, updatedData) {
    // Basic validation for required fields
    const errors = [];
    const skillsJson = JSON.stringify(updatedData.skills); // Convert skills array to JSON string
    const hashedPassword = await bcrypt.hash(updatedData.password, 10);

    if (!updatedData.firstName || updatedData.firstName.trim() === "") {
      errors.push("First name is required.");
    }
    if (!updatedData.lastName || updatedData.lastName.trim() === "") {
      errors.push("Last name is required.");
    }
    if (!updatedData.email || !validateEmail(updatedData.email)) {
      errors.push("Valid email is required.");
    }
    if (!updatedData.phone || !validatePhone(updatedData.phone)) {
      errors.push("Valid phone number is required.");
    }
    if (!["1", "0"].includes(updatedData.status)) {
      errors.push("Status must be either 'active' or 'inactive'.");
    }
    if (!["1", "2", "3"].includes(updatedData.role)) {
      errors.push("Role must be either 'admin', 'user', or 'guest'.");
    }
  
    // If validation errors exist, return the errors
    if (errors.length > 0) {
      return { success: false, errors };
    }
  
    // Proceed with the update if validation passes
    try {
      const [result] = await pool.execute(
        'UPDATE users SET firstName = ?, lastName = ?, email = ?, phone = ?, status = ?, role = ?,availability = ?, skills = ?, password = ? WHERE id = ?',
        [
          updatedData.firstName,
          updatedData.lastName,
          updatedData.email,
          updatedData.phone,
          updatedData.status,
          updatedData.role,
          updatedData.availability,
          skillsJson,
          hashedPassword,
          userId
        ]
      );
  
      // If the update was successful, fetch the updated record
      if (result.affectedRows > 0) {
        const [updatedUser] = await pool.execute('SELECT * FROM users WHERE id = ?', [userId]);
        return { success: true, user: updatedUser[0],message: 'Updated successfully.'  }; // Return the first user in the result
      }
  
      return { success: false, message: 'User not found or no changes made.' };
    } catch (err) {
      console.error('Error updating user:', err);
      return { success: false, message: `Database error: ${err.message}` }; 
    }
  }
  
  // Email validation helper function
  function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  }
  
  // Phone validation helper function (simple example)
  function validatePhone(phone) {
    const re = /^[0-9]{10,15}$/; // Adjust for your desired phone format
    return re.test(String(phone));
  }
  
  
//   async function getUserById(userId) {
//     // Assuming you're using MySQL with promise-based queries
//     const [rows] = await pool.execute('SELECT * FROM users WHERE id = ?', [userId]);
  
//     if (rows.length > 0) {
//       return rows[0]; // Return the user record if found
//     }
  
//     return null; // Return null if no user is found
//   }
async function getUserById(userId) {
  try {
    // SQL query with joins
    const [rows] = await pool.execute(`
      SELECT 
        u.id, 
        u.firstName, 
        u.lastName, 
        u.email, 
        u.phone, 
        u.username, 
        u.latitude,
        u.longitude,
        u.skills,
        u.experience,
        u.status,
        u.role,
        u.availability,
        u.email_verified_at,
        u.created_at,
        u.updated_at,
        j.id AS job_id, 
        j.title AS job_title, 
        j.company AS job_company,
        j.location AS job_location,
        j.status AS job_status,
        j.user_id AS job_user_id,
        j.Reference AS job_reference,
        j.salary AS job_salary,
        j.chat_id AS job_chat_id,
        j.description AS job_description,
        j.latitude AS job_latitude,
        j.longitude AS job_longitude,
        jt.technician_id,
        jt.departureLocation,
        jt.dispatchTime,
        jt.eta,
        jt.driver,
        jt.status AS jt_status,
        jt.messageId,
        jt.description AS jt_description
      FROM users u
      LEFT JOIN jobs j ON u.id = j.technician_id
      LEFT JOIN job_technicians jt ON j.id = jt.job_id
      WHERE u.id = ?
    `, [userId]);

    console.log('Raw query result:', rows); // Debugging output

    if (rows.length > 0) {
      // Initialize user object
      const user = {
        id: rows[0].id,
        firstName: rows[0].firstName,
        lastName: rows[0].lastName,
        email: rows[0].email,
        phone: rows[0].phone,
        username: rows[0].username,
        latitude: rows[0].latitude,
        longitude: rows[0].longitude,
        skills:  rows[0].skills || '[]', // Parse JSON string to object
        // skills: JSON.parse(rows[0].skills || '[]'), // Parse JSON string to object
        experience: rows[0].experience,
        status: rows[0].status,
        role: rows[0].role,
        availability: rows[0].availability,
        email_verified_at: rows[0].email_verified_at,
        created_at: rows[0].created_at,
        updated_at: rows[0].updated_at,
        jobs: []
      };

      // Aggregate job information and job_technicians
      rows.forEach(row => {
        if (row.job_id) {
          const existingJob = user.jobs.find(job => job.id === row.job_id);

          if (existingJob) {
            // If job exists, add to job_technicians if not already added
            if (row.technician_id && !existingJob.job_technicians.find(jt => jt.technician_id === row.technician_id)) {
              existingJob.job_technicians.push({
                id: row.jt_id,                   // Job technician ID
                job_id: row.job_id,               // Job ID
                technician_id: row.technician_id, // Technician ID
                chat_id: row.chat_id,             // Chat ID
                departureLocation: row.departureLocation,
                dispatchTime: row.dispatchTime,
                eta: row.eta,
                driver: row.driver,
                status: row.jt_status,            // Technician job status
                messageId: row.messageId,
                description: row.jt_description,  // Technician job description
                created_at: row.jt_created_at,    // Record creation time
                updated_at: row.jt_updated_at     // Last record update time
              });
            }
            
          } else {
            // Add new job along with job_technicians
            user.jobs.push({
              id: row.job_id,
              title: row.job_title,
              company: row.job_company,
              location: row.job_location,
              status: row.job_status,
              user_id: row.job_user_id,
              Reference: row.job_reference,
              salary: row.job_salary,
              chat_id: row.job_chat_id,
              description: row.job_description,
              latitude: row.job_latitude,
              longitude: row.job_longitude,
              job_technicians: row.technician_id ? [{
                technician_id: row.technician_id,
                departureLocation: row.departureLocation,
                dispatchTime: row.dispatchTime,
                eta: row.eta,
                driver: row.driver,
                status: row.jt_status,
                messageId: row.messageId,
                description: row.jt_description
              }] : []
            });
          }
        }
      });

      return user; // Return the user record with job details if found
    }

    return null; // Return null if no user is found
  } catch (error) {
    console.error('Error fetching user by ID:', error);
    throw error; // Optionally re-throw the error to be handled by the caller
  }
}

  
  const deleteUserById = async (userId) => {
    const query = 'DELETE FROM users WHERE id = ?';
    
    try {
      const connection = await pool.getConnection();
      const [result] = await connection.execute(query, [userId]);
      connection.release();
  
      if (result.affectedRows === 0) {
        return { success: false, message: 'User not found' };
      }
      
      return { success: true, message: 'User deleted successfully' };
    } catch (err) {
      console.error('Error deleting user:', err);
      throw err; // Rethrow the error to be caught by the route handler
    }
  };
module.exports = {
    createUser,
    getAllUsers,
    updateUser,
    getUserById,
    deleteUserById
};
