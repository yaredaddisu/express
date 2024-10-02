const pool = require('../db');

const createLocation = async (Locations) => {
  const { LocationName,LocationShortCode ,status,chatId } = Locations;
  const sql = `INSERT INTO locations ( LocationName,LocationShortCode ,status,chat_id ) VALUES ( ?, ?, ?,? )`;
  const [result] = await pool.query(sql, [ LocationName,LocationShortCode ,status,chatId ]);
  return result.insertId;
};

const getLocationById = async (id) => {
  const sql = `SELECT * FROM locations WHERE id = ?`;
  const [rows] = await pool.query(sql, [id]);
  return rows[0] || null;
};
const getLocationByChatId = async (chatId) => {
  const sql = `SELECT * FROM locations WHERE chat_id = ?`;
  const [rows] = await pool.query(sql, [chatId]);
  return rows[0] || null;
};

const updateLocationAttribute = async (id, attribute, value) => {
    const validAttributes = ['LocationName','LocationShortCode' , 'status'];
  
    if (!validAttributes.includes(attribute)) {
      throw new Error('Invalid attribute');
    }
  
    const sql = `UPDATE locations SET ${attribute} = ? WHERE id = ?`;
    const [result] = await pool.query(sql, [value, id]);
    return result.affectedRows;
  };
  const updateLocationStatus = async (id , value) => {
   
 
    const sql = `UPDATE locations SET status = ? WHERE id = ?`;
    const [result] = await pool.query(sql, [value, id]);
    return result.affectedRows;
  };
  const getAllLocations = async () => {
  const sql = 'SELECT * FROM locations';
  const [results] = await pool.query(sql);
  return results;
};

const deleteLocationById = async (id) => {
    const sql = 'DELETE FROM locations WHERE id = ?'; // Define the SQL DELETE statement with a placeholder for the ID.
    
    try {
      const [results] = await pool.query(sql, [id]); // Execute the query with the provided ID.
      return results; // Return the results of the query.
    } catch (error) {
      console.error('Error deleting Location by ID:', error); // Log the error for debugging.
      throw error; // Re-throw the error to be handled by the calling function.
    }
  };
  

// Additional methods like updateTechnician, deleteTechnician, etc.

module.exports = {
  createLocation,
  getLocationById,
  getAllLocations,
  updateLocationAttribute,
  updateLocationStatus,
  getLocationByChatId,
  deleteLocationById
};
