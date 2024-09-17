// regionService.js
const pool = require('../db');

const createRegion = async (region) => {
  const { acronym, isActive, name } = region;

  const query = 'INSERT INTO regions (acronym, isActive, name) VALUES (?, ?, ?)';

  try {
    const connection = await pool.getConnection();
    await connection.execute(query, [acronym, isActive, name]);
    connection.release(); // Release connection back to the pool

    return { success: true, message: 'Data inserted successfully' };
  } catch (err) {
    console.error('Error inserting data: ', err);
    return { success: false, message: 'Database error' };
  }
};
const getAllRegions = async (pageNumber, pageSize, searchTerm) => {
  const offset = (pageNumber - 1) * pageSize;
  const query = `
    SELECT * FROM regions
    WHERE name LIKE ?
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
const updateRegion = async (id, updateData) => {
  const { acronym, isActive, name } = updateData;
  const query = `
    UPDATE regions
    SET acronym = ?, isActive = ?, name = ?
    WHERE id = ?
  `;

  try {
    const [result] = await pool.execute(query, [acronym, isActive, name, id]);
    if (result.affectedRows === 0) {
      throw new Error('Region not found');
    }
    return result;
  } catch (err) {
    console.error('Error updating data: ', err);
    throw new Error('Database error');
  }
};

module.exports = {
  createRegion,
  getAllRegions,
  updateRegion
};
