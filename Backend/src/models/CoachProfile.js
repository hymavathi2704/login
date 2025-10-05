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
  headline: { // Renamed from 'title' to match mock data
    type: DataTypes.STRING,
    allowNull: true,
  },
  bio: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  phone: { // Added from mock data
    type: DataTypes.STRING,
    allowNull: true,
  },
  website: {
    type: DataTypes.STRING,
    allowNull: true,
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
  targetAudience: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  specializations: { // Added from mock data
    type: DataTypes.JSON,
    allowNull: true,
  },
  languages: { // Added from mock data
    type: DataTypes.JSON,
    allowNull: true,
  },
  coachingApproach: { // Added from mock data
    type: DataTypes.TEXT,
    allowNull: true,
  },
  certifications: { // Added from mock data
    type: DataTypes.JSON,
    allowNull: true,
  },
  rating: { // Added from mock data
    type: DataTypes.DECIMAL(3, 2),
    allowNull: true,
  },
  totalReviews: { // Added from mock data
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  totalClients: { // Added from mock data
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  yearsExperience: { // Added from mock data
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  isAvailable: { // Added from mock data
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  avgResponseTime: { // Added from mock data
    type: DataTypes.STRING,
    allowNull: true,
  },
  startingPrice: { // Added from mock data
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
}, {
  timestamps: true,
});

module.exports = CoachProfile;