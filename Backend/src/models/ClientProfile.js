const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./user');

const ClientProfile = sequelize.define('ClientProfile', {
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
  coachingGoals: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  // You can add more client-specific fields here
}, {
  tableName: 'client_profiles',
  timestamps: true,
});

// Define the association
User.hasOne(ClientProfile, { foreignKey: 'userId', onDelete: 'CASCADE' });
ClientProfile.belongsTo(User, { foreignKey: 'userId' });

module.exports = ClientProfile;