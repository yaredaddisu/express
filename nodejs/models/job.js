const pool = require('../db');
 
const createJob = async (job) => {
  const { customerId, serviceType, location, description, technicianId } = job;
  const sql = `INSERT INTO jobs (customer_id, service_type, location, description, technician_id, status) VALUES (?, ?, ?, ?, ?, 'pending')`;
  const [result] = await pool.query(sql, [customerId, serviceType, location, description, technicianId]);
  return result.insertId;
};

const getJobById = async (id) => {
 
  const sql = `SELECT * FROM jobs WHERE id = ?`;
  const [rows] = await pool.query(sql, [id]);
 
  return rows[0];
};
 
const getJobConfirmationById = async (id) => {
  const sql = `SELECT * FROM job_technicians WHERE job_id = ?`;
  const [rows] = await pool.query(sql, [id]);
  return rows[0];
};
const getMyJob = async (chatId, status) => {
  const sql = `
  SELECT jobs.description AS job_description, jobs.status AS jobs_status,jobs.id AS job_id, jobs.*, users.*
  FROM jobs
  JOIN users ON jobs.technician_id = users.id
  WHERE jobs.chat_id = ? AND jobs.status = ?
  `;
  
  const [rows] = await pool.query(sql, [chatId, status]);

  // console.log(rows)
  return rows;
};
const getWorkDone = async (chatId, status) => {

  const sql = `
  SELECT jobs.description AS job_description, jobs.status AS jobs_status, job_technicians.id AS jobId,job_technicians.status AS tech_status ,jobs.id AS job_id, jobs.*, job_technicians.*, users.*
  FROM job_technicians
  JOIN jobs ON jobs.id = job_technicians.job_id
  JOIN users ON job_technicians.technician_id = users.id
  WHERE job_technicians.chat_id = ? AND job_technicians.status = ?;
  `;
  
  const [rows] = await pool.query(sql, [chatId, status]);
 return rows;
 

};
//  JOIN job_technicians ON jobs.id = job_technicians.job_id

const getActiveTechnicianJobs = async (chatId,status) => {

  const sql = `
    
  SELECT jobs.description AS job_description ,job_technicians.id AS jobId,job_technicians.status AS tech_status ,jobs.id AS job_id, jobs.*, job_technicians.*, users.*
  FROM job_technicians
  JOIN jobs ON jobs.id = job_technicians.job_id
  JOIN users ON job_technicians.technician_id = users.id
  WHERE job_technicians.chat_id = ? AND job_technicians.status = ?;
`;
 
  const [rows] = await pool.query(sql, [chatId,status]);

  return rows; // Return all rows matching the chatId
  // console.log(rows);
};


const getJobs = async (chatId,job_id,jobId) => {
  const sql = `
  SELECT jobs.id AS job_id,jobs.description AS job_description,
    jobs.*, 
    job_technicians.*, 
    users.*
    
  FROM jobs
  JOIN job_technicians ON jobs.id = job_technicians.job_id
  JOIN users ON job_technicians.technician_id = users.id
  WHERE jobs.id = ? AND users.chat_id = ?
`;

const [rows] = await pool.query(sql, [job_id, chatId,jobId]);

if (!rows.length) throw new Error('No job or technician details found');

const jobDetails = rows[0]; // Assuming the first row contains the desired data
// console.log("this is job details", jobDetails);
return jobDetails;
 
};

const createJobConfirmation = async (job, messageId) => {
  const { job_id, technician_id, chatId, departureLocation, dispatchTime, eta,description } = job;

  const sql = `INSERT INTO job_technicians (job_id, technician_id, chat_id, messageId, departureLocation, dispatchTime, eta,status, description) VALUES ( ?, ?, ?, ?, ?, ?, ?, '1', ?)`;
  try {
    const [result] = await pool.query(sql, [job_id, technician_id, chatId, messageId, departureLocation, dispatchTime, eta,description]);
    return result.insertId;
  } catch (error) {
    console.error('Error confirming job:', error);
    throw error; // Rethrow the error to be handled by the caller
  }
};


 
// Additional methods like updateJob, assignTechnician, updateJobStatus, etc.
const updateJobStatus = async (id , value) => {
  console.log(value, id)
  const sql = `UPDATE job_technicians SET status = ? WHERE id = ?`;
  const [result] = await pool.query(sql, [value, id]);
  return result.affectedRows;
};

const updateJobConfirmStatus = async (id , value) => {
 
  const sql = `UPDATE jobs SET status = ? WHERE id = ?`;
  const [result] = await pool.query(sql, [value, id]);
  return result.affectedRows;
};

const simpleConfirm = async (description , id) => {
  console.log(description, id)
  const sql = `UPDATE job_technicians SET description = ? WHERE id = ?`;
  const [result] = await pool.query(sql, [description, id]);
  return result.affectedRows;
};

const updateAvailability = async (id , value) => {
  
  const sql = `UPDATE users SET availability = ? WHERE chat_id = ?`;
  const [result] = await pool.query(sql, [value, id]);
  return result.affectedRows;
};

const getWeekReport = async (status) => {
  const sql = `
SELECT DISTINCT jobs.status AS jobs_status, jobs.*, users.*
FROM jobs
JOIN job_technicians ON jobs.id = job_technicians.job_id
JOIN users ON job_technicians.technician_id = users.id
WHERE jobs.status = ?
AND jobs.created_at >= DATE_SUB(CURDATE(), INTERVAL WEEKDAY(CURDATE()) DAY)
AND jobs.created_at < DATE_ADD(DATE_SUB(CURDATE(), INTERVAL WEEKDAY(CURDATE()) DAY), INTERVAL 7 DAY);

  `;
  const [rows] = await pool.query(sql, [status]);
//  console.log(rows);

  return rows; // Return all rows matching the status for the current weekdsf54
};

   

module.exports = {
  createJob,
  getJobById,
  createJobConfirmation,
  getActiveTechnicianJobs,
  updateJobStatus,
   getJobConfirmationById,
   updateAvailability,
   getMyJob,
   simpleConfirm,
   getWeekReport,
   getJobs,
   updateJobConfirmStatus,
   getWorkDone
};
