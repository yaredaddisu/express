const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('technician_management', 'root',null, {
    host: 'localhost',
    dialect: 'mysql', // or 'postgres', 'sqlite', etc.
    logging: false, // Turn off logging if you don't need it
});

module.exports = sequelize;
