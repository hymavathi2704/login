// Backend/src/models/Session.js
const { DataTypes, UUIDV4 } = require('sequelize');
const db = require('../config/db');
// REMOVED: const CoachProfile = require('./CoachProfile'); 

const Session = db.define('Session', {
  id: {
    type: DataTypes.CHAR(36),
    defaultValue: UUIDV4,
    primaryKey: true,
    allowNull: false,
  },
  coachProfileId: { // Link to the coach offering the session
    type: DataTypes.CHAR(36),
    allowNull: false,
    references: {
      model: 'coach_profiles',
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  type: { // e.g., '1-on-1', 'Group', 'Digital Product'
    type: DataTypes.STRING,
    allowNull: false,
  },
  duration: {
    type: DataTypes.INTEGER, // duration in minutes
    allowNull: false,
  },
  price: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  }
}, {
  tableName: 'coach_sessions',
  timestamps: true,
});

// REMOVED: Association definition is now centralized in server.js
// Session.belongsTo(CoachProfile, { foreignKey: 'coachProfileId', as: 'coachProfile' });

module.exports = Session;