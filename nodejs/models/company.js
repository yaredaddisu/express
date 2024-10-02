const pool = require('../db');

const createCompany = async (Companys) => {
  const { CompanyName,CompanyShortCode ,status,chatId } = Companys;
  const sql = `INSERT INTO companies ( CompanyName,CompanyShortCode ,status,chat_id ) VALUES ( ?, ?, ?,? )`;
  const [result] = await pool.query(sql, [ CompanyName,CompanyShortCode ,status,chatId ]);
  return result.insertId;
};

const getCompanyById = async (id) => {
  const sql = `SELECT * FROM companies WHERE id = ?`;
  const [rows] = await pool.query(sql, [id]);
  return rows[0] || null;
};
const getCompanyByChatId = async (chatId) => {
  const sql = `SELECT * FROM companies WHERE chat_id = ?`;
  const [rows] = await pool.query(sql, [chatId]);
  return rows[0] || null;
};

const updateCompanyAttribute = async (id, attribute, value) => {
    const validAttributes = ['CompanyName','CompanyShortCode' , 'status'];
  
    if (!validAttributes.includes(attribute)) {
      throw new Error('Invalid attribute');
    }
  
    const sql = `UPDATE companies SET ${attribute} = ? WHERE id = ?`;
    const [result] = await pool.query(sql, [value, id]);
    return result.affectedRows;
  };
  const updateCompanyStatus = async (id , value) => {
   
 
    const sql = `UPDATE companies SET status = ? WHERE id = ?`;
    const [result] = await pool.query(sql, [value, id]);
    return result.affectedRows;
  };
  const getAllCompanies = async () => {
  const sql = 'SELECT * FROM companies';
  const [results] = await pool.query(sql);
  return results;
};

const deleteCompanyById = async (id) => {
    const sql = 'DELETE FROM companies WHERE id = ?'; // Define the SQL DELETE statement with a placeholder for the ID.
    
    try {
      const [results] = await pool.query(sql, [id]); // Execute the query with the provided ID.
      return results; // Return the results of the query.
    } catch (error) {
      console.error('Error deleting Company by ID:', error); // Log the error for debugging.
      throw error; // Re-throw the error to be handled by the calling function.
    }
  };
  

// Additional methods like updateTechnician, deleteTechnician, etc.

module.exports = {
  createCompany,
  getCompanyById,
  getAllCompanies,
  updateCompanyAttribute,
  updateCompanyStatus,
  getCompanyByChatId,
  deleteCompanyById
};
