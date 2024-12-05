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
      title,
      phone
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
        title,
        phone
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?)
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
        title,
        phone
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
    const searchValue = `%${searchTerm}%`; // Use % for partial matching
  
    const query = `
      SELECT *
      FROM jobs
      WHERE title LIKE ? OR Reference LIKE ? OR phone LIKE ?
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `;
    
    const countQuery = `
      SELECT COUNT(*) as totalCount
      FROM jobs
      WHERE title LIKE ? OR Reference LIKE ? OR phone LIKE ?
    `;
  
    try {
      // Execute both queries
      const [rows] = await pool.execute(query, [searchValue, searchValue, searchValue, pageSize, offset]);
      const [[{ totalCount }]] = await pool.execute(countQuery, [searchValue, searchValue, searchValue]); // Get total count
  
      return { jobs: rows, totalCount };
    } catch (err) {
      console.error('Error retrieving data:', err);
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
  const getOrderById = async (jobId) => {
    const query = `
      SELECT * from job_orders
      WHERE id = ?;
    `;
  console.log(jobId)
    try {
      const connection = await pool.getConnection();
      const [rows] = await connection.execute(query, [jobId]);
      connection.release();
  
      if (rows.length === 0) {
        return { success: false, message: 'Job not found' };
      }
  
      const data = rows[0];
      data.materials = JSON.parse(data.materials);

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
      title = null,
      phone,
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
      title = ?,
      phone = ?
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
        phone,
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
  const saveOrderDetails = async ({
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
  }) => {
    const checkJobIdQuery = `
      SELECT COUNT(*) AS count FROM jobs WHERE id = ?
    `;
    const checkJobOrderQuery = `
      SELECT COUNT(*) AS count FROM job_orders WHERE job_id = ?
    `;
    const insertOrderQuery = `
      INSERT INTO job_orders (
        jobAssessmentNo, typeOfService, clientName, startDate, branch, startTime, endTime,
        telephone, supervisorName, typesOfWork, typesOfMachine, temperature, natureOfProblem,
        detailProblemReported, serviceRendered, performanceAssurance, customerComment,
        executedBy, executedByPosition, executedByDate, checkedBy, checkedByPosition,
        checkedByDate, approvedBy, approvedByPosition, approvedByDate, user_id, reference,
        job_id, materials, signatureFile1, signatureFile2, signatureFile3, signatureFile4
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
  
    try {
      const connection = await pool.getConnection();
  
      // Step 1: Check if job_id exists in the jobs table
      const [jobIdCheckResult] = await connection.execute(checkJobIdQuery, [job_id]);
      const jobIdExists = jobIdCheckResult[0].count > 0;
  
      if (!jobIdExists) {
        connection.release();
        return { success: false, message: `job_id ${job_id} does not exist` };
      }
  
      // Step 2: Check if job_id already exists in the job_orders table
      const [jobOrderCheckResult] = await connection.execute(checkJobOrderQuery, [job_id]);
      const jobOrderExists = jobOrderCheckResult[0].count > 0;
  
      if (jobOrderExists) {
        connection.release();
        return { success: false, message: `Job Order Validation already existed!` };
      }
  
      // Step 3: Insert the new order if validations pass
      const [result] = await connection.execute(insertOrderQuery, [
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
        materialsData, // JSON string
        signatureFile1, // Base64 string
        signatureFile2, // Base64 string
        signatureFile3, // Base64 string
        signatureFile4, // Base64 string
      ]);
  
      connection.release();
  
      if (result.affectedRows === 0) {
        return { success: false, message: 'Failed to save order details' };
      }
     console.log(result.insertId)
      return { success: true, message: 'Order saved successfully', insertId: result.insertId };
    } catch (err) {
      console.error('Error saving order details:', err);
      throw err;  
    }
  };
  
  
  
  // const saveOrderDetails = async ({
  //   jobAssessmentNo,
  //   typeOfService,
  //   clientName,
  //   startDate,
  //   branch,
  //   startTime,
  //   endTime,
  //   telephone,
  //   supervisorName,
  //   typesOfWork,
  //   typesOfMachine,
  //   temperature,
  //   natureOfProblem,
  //   detailProblemReported,
  //   serviceRendered,
  //   performanceAssurance,
  //   customerComment,
  //   executedBy,
  //   executedByPosition,
  //   executedByDate,
  //   checkedBy,
  //   checkedByPosition,
  //   checkedByDate,
  //   approvedBy,
  //   approvedByPosition,
  //   approvedByDate,
  //   user_id,
  //   reference,
  //   job_id,
  //   materialsData,
  //   signatureFile1,
  //   signatureFile2,
  //   signatureFile3,
  //   signatureFile4,
  // }) => {
  //   const query = `
  //     INSERT INTO job_orders (
  //       jobAssessmentNo, typeOfService, clientName, startDate, branch, startTime, endTime,
  //       telephone, supervisorName, typesOfWork, typesOfMachine, temperature, natureOfProblem,
  //       detailProblemReported, serviceRendered, performanceAssurance, customerComment,
  //       executedBy, executedByPosition, executedByDate, checkedBy, checkedByPosition,
  //       checkedByDate, approvedBy, approvedByPosition, approvedByDate, user_id, reference,
  //       job_id, materials, signatureFile1, signatureFile2, signatureFile3, signatureFile4
  //     ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  //   `;
  
  //   try {
  //     const connection = await pool.getConnection();
  //     const [result] = await connection.execute(query, [
  //       jobAssessmentNo,
  //       typeOfService,
  //       clientName,
  //       startDate,
  //       branch,
  //       startTime,
  //       endTime,
  //       telephone,
  //       supervisorName,
  //       typesOfWork,
  //       typesOfMachine,
  //       temperature,
  //       natureOfProblem,
  //       detailProblemReported,
  //       serviceRendered,
  //       performanceAssurance,
  //       customerComment,
  //       executedBy,
  //       executedByPosition,
  //       executedByDate,
  //       checkedBy,
  //       checkedByPosition,
  //       checkedByDate,
  //       approvedBy,
  //       approvedByPosition,
  //       approvedByDate,
  //       user_id,
  //       reference,
  //       job_id,
  //       materialsData, // JSON string
  //       signatureFile1, // Base64 string
  //       signatureFile2, // Base64 string
  //       signatureFile3, // Base64 string
  //       signatureFile4, // Base64 string
  //     ]);
  //     connection.release();
  
  //     if (result.affectedRows === 0) {
  //       return { success: false, message: 'Failed to save order details' };
  //     }
  
  //     return { success: true, message: 'Order saved successfully' };
  //   } catch (err) {
  //     console.error('Error saving order details:', err);
  //     throw err; // Rethrow the error to be caught by the route handler
  //   }
  // };
  const updateOrderDetails = async ({
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
  }) => {
    try {
      const fields = [];
      const values = [];
  
      // Dynamically add fields only if they are not null
      if (jobAssessmentNo) {
        fields.push("jobAssessmentNo = ?");
        values.push(jobAssessmentNo);
      }
      if (typeOfService) {
        fields.push("typeOfService = ?");
        values.push(typeOfService);
      }
      if (clientName) {
        fields.push("clientName = ?");
        values.push(clientName);
      }
      if (startDate) {
        fields.push("startDate = ?");
        values.push(startDate);
      }
      if (branch) {
        fields.push("branch = ?");
        values.push(branch);
      }
      if (startTime) {
        fields.push("startTime = ?");
        values.push(startTime);
      }
      if (endTime) {
        fields.push("endTime = ?");
        values.push(endTime);
      }
      if (telephone) {
        fields.push("telephone = ?");
        values.push(telephone);
      }
      if (supervisorName) {
        fields.push("supervisorName = ?");
        values.push(supervisorName);
      }
      if (typesOfWork) {
        fields.push("typesOfWork = ?");
        values.push(typesOfWork);
      }
      if (typesOfMachine) {
        fields.push("typesOfMachine = ?");
        values.push(typesOfMachine);
      }
      if (temperature) {
        fields.push("temperature = ?");
        values.push(temperature);
      }
      if (natureOfProblem) {
        fields.push("natureOfProblem = ?");
        values.push(natureOfProblem);
      }
      if (detailProblemReported) {
        fields.push("detailProblemReported = ?");
        values.push(detailProblemReported);
      }
      if (serviceRendered) {
        fields.push("serviceRendered = ?");
        values.push(serviceRendered);
      }
      if (performanceAssurance) {
        fields.push("performanceAssurance = ?");
        values.push(performanceAssurance);
      }
      if (customerComment) {
        fields.push("customerComment = ?");
        values.push(customerComment);
      }
      if (executedBy) {
        fields.push("executedBy = ?");
        values.push(executedBy);
      }
      if (executedByPosition) {
        fields.push("executedByPosition = ?");
        values.push(executedByPosition);
      }
      if (executedByDate) {
        fields.push("executedByDate = ?");
        values.push(executedByDate);
      }
      if (checkedBy) {
        fields.push("checkedBy = ?");
        values.push(checkedBy);
      }
      if (checkedByPosition) {
        fields.push("checkedByPosition = ?");
        values.push(checkedByPosition);
      }
      if (checkedByDate) {
        fields.push("checkedByDate = ?");
        values.push(checkedByDate);
      }
      if (approvedBy) {
        fields.push("approvedBy = ?");
        values.push(approvedBy);
      }
      if (approvedByPosition) {
        fields.push("approvedByPosition = ?");
        values.push(approvedByPosition);
      }
      if (approvedByDate) {
        fields.push("approvedByDate = ?");
        values.push(approvedByDate);
      }
      if (materialsData) {
        fields.push("materials = ?");
        values.push(materialsData);
      }
      if (signatureFile1) { // Check explicitly for `undefined`
        fields.push("signatureFile1 = ?");
        values.push(signatureFile1);
      }
      if (signatureFile2) {
        fields.push("signatureFile2 = ?");
        values.push(signatureFile2);
      }
      if (signatureFile3) {
        fields.push("signatureFile3 = ?");
        values.push(signatureFile3);
      }
      if (signatureFile4) {
        fields.push("signatureFile4 = ?");
        values.push(signatureFile4);
      }
      
  
      // Ensure there's something to update
      if (fields.length === 0) {
        return { success: false, message: "No fields to update" };
      }
  
      // Add the `id` for the WHERE clause
      values.push(id);
  
      const query = `
        UPDATE job_orders
        SET ${fields.join(", ")}
        WHERE id = ?
      `;
  
      const connection = await pool.getConnection();
      const [result] = await connection.execute(query, values);
      connection.release();
  
      if (result.affectedRows === 0) {
        return { success: false, message: "Failed to update order details" };
      }
  
      return { success: true, message: "Order updated successfully" };
    } catch (err) {
      console.error("Error updating order details:", err);
      throw err;
    }
  };
  // Function to fetch all job orders
  const fetchAllOrders = async () => {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.query(`
        SELECT 
          job_orders.*,
          jobs.title,         -- Example field from the jobs table
          jobs.description,   -- Example field from the jobs table
          jobs.company,
           jobs.Reference,
          jobs.status         -- Example field from the jobs table
        FROM job_orders
        LEFT JOIN jobs ON job_orders.job_id = jobs.id -- Assuming job_id in job_orders relates to id in jobs
        ORDER BY job_orders.created_at DESC
      `);
      return rows;
    } finally {
      connection.release();
    }
  };
  
  // Function to approve an order by ID
const approveOrderById = async (id,approved) => {
  const connection = await pool.getConnection();
  try {
    const [result] = await connection.query(
      `UPDATE job_orders SET approved = '1' WHERE id = ?`,
      [id,approved]
    );
    return result;
  } finally {
    connection.release();
  }
};
  module.exports = {
    createJob,
    getAllJobs,
    getJobById,
    updateJob,
    deleteJobById,
    saveOrderDetails,
    getOrderById,
    updateOrderDetails,
    fetchAllOrders,
    approveOrderById
  };
  

