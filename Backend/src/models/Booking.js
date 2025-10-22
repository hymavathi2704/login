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
    // 🔑 FIX: Added onDelete: 'CASCADE'
    onDelete: 'CASCADE', 
  },
  sessionId: { // REQUIRED
    type: DataTypes.CHAR(36),
    allowNull: false, 
    references: {
      model: 'coach_sessions', 
      key: 'id',
    },
    // 🔑 CRITICAL FIX: Add onDelete: 'CASCADE' to resolve the DROP TABLE dependency issue
    onDelete: 'CASCADE', 
  },
  status: {
    type: DataTypes.ENUM('confirmed', 'pending', 'cancelled', 'completed'), 
    defaultValue: 'pending',
  },
  isReviewed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false,
    comment: 'Flag to prevent multiple testimonials for the same booking.'
  },
  bookedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'client_bookings',
  timestamps: true,
});

module.exports = Booking;