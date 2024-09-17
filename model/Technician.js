// models/Technician.js
module.exports = (sequelize, DataTypes) => {
    const Technician = sequelize.define('Technician', {
      firstName: DataTypes.STRING,
      lastName: DataTypes.STRING,
      skills: DataTypes.STRING,
    });
  
    // Define association
    Technician.associate = (models) => {
      Technician.hasMany(models.Job, { foreignKey: 'technicianId', as: 'jobs' });
    };
  
    return Technician;
  };
  