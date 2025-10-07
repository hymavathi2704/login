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
  // Personal & Professional Info
  professionalTitle: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  // REMOVED: profilePicture (moved to User model)
  // REMOVED: websiteUrl (consolidated or removed)
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
  
  // === Social Links and Demographics (UNCHANGED) ===
  linkedinUrl: { type: DataTypes.STRING, allowNull: true, },
  twitterUrl: { type: DataTypes.STRING, allowNull: true, },
  instagramUrl: { type: DataTypes.STRING, allowNull: true, },
  facebookUrl: { type: DataTypes.STRING, allowNull: true, },
  dateOfBirth: { type: DataTypes.DATEONLY, allowNull: true, },
  gender: { type: DataTypes.STRING, allowNull: true, },
  ethnicity: { type: DataTypes.STRING, allowNull: true, },
  country: { type: DataTypes.STRING, allowNull: true, },
  
  // REMOVED: Services Info (Now managed via Session and Event models)
  // pricing: { type: DataTypes.JSON, allowNull: true, },
  // availability: { type: DataTypes.JSON, allowNull: true, }

  // Status/Metrics fields (unchanged)
  rating: {
      type: DataTypes.DECIMAL(2, 1),
      allowNull: false,
      defaultValue: 0.0,
  },
  totalReviews: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
  },
  totalClients: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
  },
  
}, {
  tableName: 'coach_profiles',
  timestamps: true,
});

module.exports = CoachProfile;