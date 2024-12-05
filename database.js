const { Sequelize } = require('sequelize');

// const sequelize = new Sequelize('technician_management', 'root',null, {
//     host: 'localhost',
//     dialect: 'mysql', // or 'postgres', 'sqlite', etc.
//     logging: false, // Turn off logging if you don't need it
// });

const sequelize = new Sequelize('lomisttx_technician_management', 'lomisttx_user','Yared@1997', {
    host: '91.204.209.17',
    dialect: 'mysql', // or 'postgres', 'sqlite', etc.
    logging: false, // Turn off logging if you don't need it
});
module.exports = sequelize;
