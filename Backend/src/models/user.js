// Backend/src/models/User.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.CHAR(36),
    primaryKey: true
  },
  firstName: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  lastName: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true
  },
  password_hash: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  email_verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  provider: {
    type: DataTypes.ENUM('email', 'google', 'github'),
    defaultValue: 'email'
  },
  oauth_id: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  verification_token: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  reset_token: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  reset_token_expires: {
    type: DataTypes.DATE,
    allowNull: true
  },
  profilePhoto: {
  type: DataTypes.STRING,
  allowNull: true,
  field: 'profile_photo' // maps profileImage to profile_photo column in DB
}

}, {
  tableName: 'users'
});

module.exports = User;
