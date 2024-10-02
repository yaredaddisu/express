const pool = require('../db');

const createMachine = async (Machines) => {
  const { machineName,machineShortCode ,status,chatId } = Machines;
  const sql = `INSERT INTO machines ( machineName,machineShortCode ,status,chat_id ) VALUES ( ?, ?, ?,? )`;
  const [result] = await pool.query(sql, [ machineName,machineShortCode ,status,chatId ]);
  return result.insertId;
};

const getMachineById = async (id) => {
  const sql = `SELECT * FROM machines WHERE id = ?`;
  const [rows] = await pool.query(sql, [id]);
  return rows[0] || null;
};
const getMachineByChatId = async (chatId) => {
  const sql = `SELECT * FROM machines WHERE chat_id = ?`;
  const [rows] = await pool.query(sql, [chatId]);
  return rows[0] || null;
};

const updateMachineAttribute = async (id, attribute, value) => {
    const validAttributes = ['machineName','machineShortCode' , 'status'];
  
    if (!validAttributes.includes(attribute)) {
      throw new Error('Invalid attribute');
    }
  
    const sql = `UPDATE machines SET ${attribute} = ? WHERE id = ?`;
    const [result] = await pool.query(sql, [value, id]);
    return result.affectedRows;
  };
  const updateMachineStatus = async (id , value) => {
   
 
    const sql = `UPDATE machines SET status = ? WHERE id = ?`;
    const [result] = await pool.query(sql, [value, id]);
    return result.affectedRows;
  };
  const getAllMachines = async () => {
  const sql = 'SELECT * FROM machines';
  const [results] = await pool.query(sql);
  return results;
};

const deleteMachineById = async (id) => {
    const sql = 'DELETE FROM machines WHERE id = ?'; // Define the SQL DELETE statement with a placeholder for the ID.
    
    try {
      const [results] = await pool.query(sql, [id]); // Execute the query with the provided ID.
      return results; // Return the results of the query.
    } catch (error) {
      console.error('Error deleting machine by ID:', error); // Log the error for debugging.
      throw error; // Re-throw the error to be handled by the calling function.
    }
  };
  

// Additional methods like updateTechnician, deleteTechnician, etc.

module.exports = {
  createMachine,
  getMachineById,
  getAllMachines,
  updateMachineAttribute,
  updateMachineStatus,
  getMachineByChatId,
  deleteMachineById
};
