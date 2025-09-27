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
    type: DataTypes.UUID,
    allowNull: false,
    unique: true,
    references: {
      model: 'users', // table name
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
  coachingGoals: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  // --- NEW DEMOGRAPHIC FIELDS START ---
  dateOfBirth: {
    type: DataTypes.DATEONLY, // Stores date without time
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
  // --- NEW DEMOGRAPHIC FIELDS END ---
}, {
  timestamps: true,
});

module.exports = ClientProfile;