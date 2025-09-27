// Backend/src/models/CoachProfile.js
const { DataTypes } = require('sequelize');
const db = require('../config/db');

const CoachProfile = db.define('coach_profiles', {
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
      model: 'users',
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
  title: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  bio: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  website: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  // ... other existing fields
  
  // --- NEW DEMOGRAPHIC FIELDS START ---
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
  // --- NEW DEMOGRAPHIC FIELDS END ---

  // --- NEW TARGET AUDIENCE FIELD ---
  targetAudience: {
    type: DataTypes.JSON, // Using JSON to store an array of strings
    allowNull: true,
  },
  // --- END ---
}, {
  timestamps: true,
});

module.exports = CoachProfile;