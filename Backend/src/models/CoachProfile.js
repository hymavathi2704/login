const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./user');

const CoachProfile = sequelize.define('CoachProfile', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {
    type: DataTypes.CHAR(36),
    references: {
      model: User,
      key: 'id',
    },
    unique: true,
    allowNull: false,
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  bio: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  location: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  timezone: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  website: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  specialties: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: '[]',
  },
  certifications: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: '[]',
  },
  languages: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: '[]',
  },
  sessionTypes: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: '[]',
  },
  availability: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: '{}',
  },
}, {
  tableName: 'coach_profiles',
  timestamps: true,
});

// Define the association
User.hasOne(CoachProfile, { foreignKey: 'userId', onDelete: 'CASCADE' });
CoachProfile.belongsTo(User, { foreignKey: 'userId' });

module.exports = CoachProfile;