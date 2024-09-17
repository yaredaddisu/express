const { Model, DataTypes } = require('sequelize');
const sequelize = require('../database'); // Adjust the path to your Sequelize instance

class User extends Model {}

User.init({
  firstName: DataTypes.STRING,
  lastName: DataTypes.STRING,
  email: DataTypes.STRING,
  phone: DataTypes.STRING,
  username: DataTypes.STRING,
  latitude: DataTypes.FLOAT,
  longitude: DataTypes.FLOAT,
  skills: DataTypes.JSON,
  role: DataTypes.INTEGER,
  status: DataTypes.INTEGER,
  availability: DataTypes.INTEGER,
  chat_id: DataTypes.INTEGER,

}, {
  sequelize,
  modelName: 'User',
  tableName: 'users',
  timestamps: true,
});

module.exports = User;
