// Backend/src/models/ClientProfile.js
const { DataTypes } = require('sequelize');
const db = require('../config/db');

const ClientProfile = db.define('client_profiles', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {
    type: DataTypes.CHAR(36), // <-- CORRECTED
    allowNull: false,
    unique: true,
    references: {
      model: 'users',
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
  dateOfBirth: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  gender: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  ethnicity: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  country: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  timestamps: true,
});

module.exports = ClientProfile;