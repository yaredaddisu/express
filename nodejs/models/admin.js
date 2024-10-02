const pool = require('../db');

const createAdmin = async (admins) => {
  const { firstName,lastName, phone, email,role,status,chatId,username } = admins;
  const sql = `INSERT INTO users (firstName,lastName, phone, email, role ,status,chat_id,username) VALUES ( ?, ?, ?,?,? ,?,?,?)`;
  const [result] = await pool.query(sql, [firstName,lastName, phone, email,role, status,chatId,username]);
  return result.insertId;
};

const getAdminById = async (id) => {
  const sql = `SELECT * FROM users WHERE id = ?`;
  const [rows] = await pool.query(sql, [id]);
  return rows[0] || null;
};
const getAdminByChatId = async (chatId) => {
  const sql = `SELECT * FROM users WHERE chat_id = ?`;
  const [rows] = await pool.query(sql, [chatId]);
  return rows[0] || null;
};

const updateAdminAttribute = async (id, attribute, value) => {
    const validAttributes = ['firstName','lastName', 'phone', 'email', 'role', 'status'];
  
    if (!validAttributes.includes(attribute)) {
      throw new Error('Invalid attribute');
    }
  
    const sql = `UPDATE users SET ${attribute} = ? WHERE id = ?`;
    const [result] = await pool.query(sql, [value, id]);
    return result.affectedRows;
  };
  const updateAdminStatus = async (id , value) => {
   
 
    const sql = `UPDATE users SET status = ? WHERE id = ?`;
    const [result] = await pool.query(sql, [value, id]);
    return result.affectedRows;
  };
  const getAllAdmins = async () => {
  const sql = 'SELECT * FROM users WHERE role = ?';
  const [results] = await pool.query(sql,[1]);
  return results;
};

// Additional methods like updateTechnician, deleteTechnician, etc.

module.exports = {
  createAdmin,
  getAdminById,
  getAllAdmins,
  updateAdminAttribute,
  updateAdminStatus,
  getAdminByChatId
};
