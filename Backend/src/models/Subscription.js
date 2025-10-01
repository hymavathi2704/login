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
  },
  coachId: {
    type: DataTypes.CHAR(36),
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
  },
}, {
  timestamps: true,
  indexes: [
    // Create a unique index to prevent a client from subscribing to the same coach multiple times
    {
      unique: true,
      fields: ['clientId', 'coachId'],
    },
  ],
});

module.exports = Subscription;