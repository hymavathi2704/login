// Backend/src/models/Session.js
const { DataTypes, UUIDV4 } = require('sequelize');
const db = require('../config/db');
// NOTE: Imports for other models are removed to prevent circular dependency issues.

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
  title: { // Corresponds to frontend 'Session Name'
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  type: { // Corresponds to frontend 'Session Format' (e.g., 'individual', 'group')
    type: DataTypes.STRING,
    allowNull: false,
  },
  duration: { // Corresponds to frontend 'Duration (minutes)'
    type: DataTypes.INTEGER, // duration in minutes
    allowNull: false,
  },
  price: { // Corresponds to frontend 'Price'
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  
  // --- NEW FIELDS FROM FRONTEND FORM ---
  defaultDate: { // Corresponds to frontend 'Default Date'
    type: DataTypes.DATEONLY, // Stores only the date (e.g., YYYY-MM-DD)
    allowNull: true,
    comment: 'Default date for fixed-schedule sessions (e.g., workshops).'
  },
  defaultTime: { // Corresponds to frontend 'Default Time'
    type: DataTypes.STRING, // Store the time string (e.g., '14:30')
    allowNull: true,
    comment: 'Default time for fixed-schedule sessions (e.g., workshops).'
  },
  meetingLink: { // Corresponds to frontend 'Meeting Link'
    type: DataTypes.TEXT, // Use TEXT for potentially long URLs
    allowNull: true,
  },
  // --- END NEW FIELDS ---

  isActive: { 
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  }
}, {
  tableName: 'coach_sessions',
  timestamps: true,
});

// Associations are defined centrally in server.js.

module.exports = Session;