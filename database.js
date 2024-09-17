const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('lomisttx_technician_management', 'lomisttx_user','Yared@1997', {
    host: 'localhost',
    dialect: 'mysql', // or 'postgres', 'sqlite', etc.
    logging: false, // Turn off logging if you don't need it
});

module.exports = sequelize;
// user: 'lomisttx_user', // Replace with your MySQL username
// password: 'Yared@1997', // Add a comma here
// database: 'lomisttx_technician_management' // Replace with your database name