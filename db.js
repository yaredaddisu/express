const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'lomisttx_user', // Replace with your MySQL username
  password: 'Yared@1997', // Add a comma here
  database: 'lomisttx_technician_management' // Replace with your database name
});

async function testConnection() {
  try {
    // Get a connection from the pool and test it
    const connection = await pool.getConnection();
    console.log('Database connection successful');
    
    // Release the connection back to the pool
    connection.release();
  } catch (error) {
    console.error('Database connection failed:', error.message);
  }
}

// Test the connection
testConnection();

module.exports = pool;
