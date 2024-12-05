const mysql = require('mysql2/promise');

// const pool = mysql.createPool({
//   host: 'localhost',
//   user: 'root', // Replace with your MySQL username
//   database: 'technician_management'
// });


const pool = mysql.createPool({
  host: '91.204.209.17',
  user: 'lomisttx_user',
  password: 'Yared@1997', // Replace with your actual password
  database: 'lomisttx_technician_management'
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
