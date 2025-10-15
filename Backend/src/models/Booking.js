// Backend/src/models/Booking.js
const { DataTypes } = require('sequelize');
const db = require('../config/db');

const Booking = db.define('booking', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  clientId: {
    type: DataTypes.CHAR(36),
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  // REMOVED: eventId field entirely, as you are sessions-only.
  sessionId: { // <--- ADDED & REQUIRED
    type: DataTypes.CHAR(36),
    allowNull: false, // Booking MUST belong to a Session now
    references: {
      model: 'coach_sessions', // References the Session model's table name
      key: 'id',
    },
  },
  status: {
    type: DataTypes.ENUM('confirmed', 'pending', 'cancelled'),
    defaultValue: 'pending',
  },
  bookedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  timestamps: true,
});

module.exports = Booking;