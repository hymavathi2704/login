const { DataTypes } = require('sequelize');
const db = require('../config/db');

const Subscription = db.define('subscription', {
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
    onDelete: 'CASCADE', // Add this
  },
  coachId: {
    type: DataTypes.CHAR(36),
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
    onDelete: 'CASCADE', // Add this
  },
}, {
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['clientId', 'coachId'],
    },
  ],
});

module.exports = Subscription;