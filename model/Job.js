// models/Job.js
module.exports = (sequelize, DataTypes) => {
    const Job = sequelize.define('Job', {
      title: DataTypes.STRING,
      description: DataTypes.TEXT,
    });
  
    // Define associations
    Job.associate = (models) => {
      Job.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
      Job.belongsTo(models.Technician, { foreignKey: 'technicianId', as: 'technician' });
    };
  
    return Job;
  };
  