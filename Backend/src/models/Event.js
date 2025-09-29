// Backend/src/models/Event.js
const { DataTypes } = require('sequelize');
const db = require('../config/db');
const User = require('./user');

const Event = db.define('event', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    coachId: {
    type: DataTypes.UUID, // This MUST match the User's id type
    allowNull: false,
    references: {
      model: 'users', // Reference the table name as a string
      key: 'id',
    },
  },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
    },
    type: {
        type: DataTypes.ENUM('webinar', 'workshop', 'consultation'),
        allowNull: false,
    },
    date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
    },
    time: {
        type: DataTypes.TIME,
        allowNull: false,
    },
    duration: {
        type: DataTypes.INTEGER, // Duration in minutes
        allowNull: false,
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00,
    },
    status: {
        type: DataTypes.ENUM('draft', 'published', 'cancelled'),
        defaultValue: 'draft',
    }
}, {
    timestamps: true,
});



module.exports = Event;