const pool = require('../db');

const checkTechnicianExists = async (technician_id) => {
    const query = 'SELECT * FROM users WHERE id = ?';
    const [rows] = await pool.execute(query, [technician_id]);
    return rows.length > 0;
  };
  const createJob = async (jobData) => {
    const {
      Reference,
      chat_id,
      company,
      description,
      latitude,
      location,
      longitude,
      salary,
      user_id,
      status,
      technician_id,
      title
    } = jobData;
  
    // Validation
    if (!Reference || !chat_id || !user_id || !status || !title) {
      return { success: false, message: 'Missing required fields' };
    }
  
    // Validate that all string fields are non-empty
    const stringFields = [company, description, location, salary];
    if (stringFields.some(field => typeof field !== 'string' || field.trim() === '')) {
      return { success: false, message: 'String fields must be non-empty' };
    }
  
    // Validate that status is either '1' or '2'
    if (!['1', '2'].includes(status)) {
      return { success: false, message: 'Invalid status' };
    }
  
    // Optionally, validate latitude and longitude if provided
    if (latitude && isNaN(parseFloat(latitude))) {
      return { success: false, message: 'Invalid latitude' };
    }
  
    if (longitude && isNaN(parseFloat(longitude))) {
      return { success: false, message: 'Invalid longitude' };
    }
  
    // Check if technician exists if technician_id is provided
    if (technician_id && !(await checkTechnicianExists(technician_id))) {
      return { success: false, message: 'Technician does not exist' };
    }
  
    const insertQuery = `
      INSERT INTO jobs (
        reference, 
        chat_id, 
        company, 
        description, 
        latitude, 
        location, 
        longitude, 
        salary, 
        user_id, 
        status, 
        technician_id, 
        title
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
  
    try {
      const connection = await pool.getConnection();
      
      // Perform the insert operation
      const [result] = await connection.execute(insertQuery, [
        Reference,
        chat_id,
        company,
        description,
        latitude,
        location,
        longitude,
        salary,
        user_id,
        status,
        technician_id,
        title
      ]);
  
      const jobId = result.insertId;
  
      // Fetch the newly created job data
      const [newJob] = await connection.execute('SELECT * FROM jobs WHERE id = ?', [jobId]);
      connection.release();
  
      if (newJob.length === 0) {
        return { success: false, message: 'Job not found after creation' };
      }
  
      return { success: true, data: newJob[0], message: 'Job created successfully' };
    } catch (err) {
      console.error('Error inserting job: ', err);
      return { success: false, message: 'Database error', error: err.message };
    }
  };
  
  const getAllJobs = async (pageNumber, pageSize, searchTerm) => {
    const offset = (pageNumber - 1) * pageSize;
    const query = `
      SELECT * FROM jobs
      WHERE title  LIKE ?
      LIMIT ? OFFSET ?
    `;
  
    try {
      const [rows] = await pool.execute(query, [searchTerm, pageSize, offset]);
      return rows;
    } catch (err) {
      console.error('Error retrieving data: ', err);
      throw new Error('Database error');
    }
  };
  const getJobById = async (jobId) => {
    const query = `
      SELECT 
        jobs.*, 
        job_orders.id AS job_order_id, 
        job_technicians.status AS job_technician_status, 
        jobs.status AS jobs_status,
        job_technicians.*,
        users.*
      FROM jobs
      LEFT JOIN job_orders ON jobs.id = job_orders.job_id
      LEFT JOIN job_technicians ON jobs.id = job_technicians.job_id
      LEFT JOIN users ON jobs.technician_id = users.id
      WHERE jobs.id = ?;
    `;
  
    try {
      const connection = await pool.getConnection();
      const [rows] = await connection.execute(query, [jobId]);
      connection.release();
  
      if (rows.length === 0) {
        return { success: false, message: 'Job not found' };
      }
  
      const data = rows[0];
      return data ;
    } catch (err) {
      console.error('Error fetching job:', err);
      return { success: false, message: 'Database error' };
    }
  };
  
  const updateJob = async (jobId, jobData) => {
    const {
      chat_id = null,
      company = null,
      description = null,
      latitude = null,
      location = null,
      longitude = null,
      salary = null,
      user_id = null,
      status = null,
      technician_id = null,
      title = null
    } = jobData;
  
    // Check if technician exists
    const technicianExists = await checkTechnicianExists(technician_id);
    if (!technicianExists) {
      return { success: false, message: 'Technician does not exist' };
    }
  
    const updateQuery = `
      UPDATE jobs SET
        chat_id = ?,
        company = ?,
        description = ?,
        latitude = ?,
        location = ?,
        longitude = ?,
        salary = ?,
        user_id = ?,
        status = ?,
        technician_id = ?,
        title = ?
      WHERE id = ?
    `;
  
    try {
      const connection = await pool.getConnection();
      
      // Perform the update operation
      const [result] = await connection.execute(updateQuery, [
        chat_id,
        company,
        description,
        latitude,
        location,
        longitude,
        salary,
        user_id,
        status,
        technician_id,
        title,
        jobId
      ]);
  
      // Fetch the updated job data
      if (result.affectedRows > 0) {
        const [updatedJob] = await connection.execute(
          'SELECT * FROM jobs WHERE id = ?',
          [jobId]
        );
        connection.release();
       
        // Return the updated job data in the specified format
        return { success: true, data: updatedJob[0] };
      } else {
        connection.release();
        return { success: false, message: 'Job not found or no changes made' };
      }
    } catch (err) {
      console.error('Error updating job:', err);
      return { success: false, message: 'Database error' };
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
    createJob,
    getAllJobs,
    getJobById,
    updateJob,
    deleteJobById
  };
  

