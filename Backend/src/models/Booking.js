const { DataTypes } = require('sequelize');
const db = require('../config/db');

const Booking = db.define('booking', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  clientId: {
    type: DataTypes.CHAR(36), // <-- CORRECTED
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  eventId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'events',
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