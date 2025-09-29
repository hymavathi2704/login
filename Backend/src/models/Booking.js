// Backend/src/models/Booking.js
const { DataTypes } = require('sequelize');
const db = require('../config/db');
const User = require('./user');
const Event = require('./Event');

const Booking = db.define('booking', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  clientId: {
        type: DataTypes.UUID, // This MUST match the User's id type
        allowNull: false,
        references: {
            model: 'users', // Reference the table name as a string
            key: 'id',
        },
    },
    eventId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'events', // Reference the table name as a string
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