// Backend/src/models/CoachProfile.js
const { DataTypes, UUIDV4 } = require('sequelize');
const db = require('../config/db');

const CoachProfile = db.define('coach_profiles', {
  id: {
    type: DataTypes.CHAR(36),
    defaultValue: UUIDV4,
    primaryKey: true,
    allowNull: false,
  },
  userId: {
    type: DataTypes.CHAR(36),
    allowNull: false,
    unique: true,
    references: {
      model: 'users',
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
  // Personal Info
  professionalTitle: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  profilePicture: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  // Contact Info
  websiteUrl: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  // Professional Info
  bio: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  specialties: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  certifications: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  education: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  yearsOfExperience: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  // Services
  sessionTypes: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  pricing: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  availability: {
    type: DataTypes.JSON,
    allowNull: true,
  }
}, {
  timestamps: true,
});

module.exports = CoachProfile;