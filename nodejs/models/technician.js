const pool = require('../db');
const createTechnician = async (technician) => {
  const skills = technician.skills.length ? JSON.stringify(technician.skills) : null;
  const experience = technician.experience || null;

  const sql = `
    INSERT INTO users (firstName, lastName, phone, email, skills, experience, status, chat_id, username, latitude, longitude) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  try {
    const [rows] = await pool.query(sql, [
      technician.firstName,
      technician.lastName,
      technician.phone,
      technician.email,
      skills,
      experience,
      technician.status,
      technician.chatId,
      technician.username,
      technician.latitude,
      technician.longitude
    ]);
    console.log("Technician created successfully");
    return rows;
  } catch (error) {
    console.error("Error creating technician:", error);
    throw error;
  }
};
const getTechnicianById = async (id) => {
  const sql = `SELECT * FROM users WHERE id = ?`;
  const [rows] = await pool.query(sql, [id]);
  return rows[0] || null;
};
const getTechnicianByChatId = async (chatId) => {
  const sql = `SELECT * FROM users WHERE chat_id = ?`;
  const [rows] = await pool.query(sql, [chatId]);
  return rows[0] || null;
};

const updateTechnicianAttribute = async (id, attribute, value) => {
    const validAttributes = ['firstName','lastName', 'phone', 'email', 'skills', 'experience','status'];
  
    if (!validAttributes.includes(attribute)) {
      throw new Error('Invalid attribute');
    }
  
    const sql = `UPDATE users SET ${attribute} = ? WHERE id = ?`;
    const [result] = await pool.query(sql, [value, id]);
    return result.affectedRows;
  };
  const updateTechnicianStatus = async (id , value) => {
   
 
    const sql = `UPDATE users SET status = ? WHERE id = ?`;
    const [result] = await pool.query(sql, [value, id]);
    return result.affectedRows;
  };
  const getAllTechnicians = async () => {
  const sql = 'SELECT * FROM users WHERE role = ?';
  const [results] = await pool.query(sql,[3]);
  return results;
};

// Function to update user's location in the database
const updateTechniciansLocation = async (chatId, latitude, longitude) => {
 
  try {
    const sql = 'UPDATE users SET latitude = ?, longitude = ? WHERE chat_id = ?';
    const [results] = await pool.query(sql, [latitude, longitude, chatId]);
    return results;
  } catch (err) {
    console.error('Error updating location:', err);
  }
};
// Additional methods like updateTechnician, deleteTechnician, etc.

module.exports = {
  createTechnician,
  getTechnicianById,
  getAllTechnicians,
  updateTechnicianAttribute,
  updateTechnicianStatus,
  getTechnicianByChatId,
  updateTechniciansLocation
};
