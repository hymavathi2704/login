// src/models/user.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const User = sequelize.define('User', {
    // Primary Key and User Info
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
    },
    firstName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    lastName: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
    },
    phone: {
        type: DataTypes.STRING(50),
        allowNull: true,
    },

    // Authentication Fields
    password_hash: {
        type: DataTypes.STRING(255),
        allowNull: true,
    },
    provider: {
        type: DataTypes.STRING(50),
        allowNull: true,
    },
    oauth_id: {
        type: DataTypes.STRING(255),
        allowNull: true,
    },

    // Roles
    roles: {
      type: DataTypes.JSON,
      defaultValue: [],
      allowNull: false,
    },

    // Verification & Reset Tokens
    email_verified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    verification_token: {
        type: DataTypes.STRING(255),
        allowNull: true,
    },
    verification_token_expires: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    reset_token: {
        type: DataTypes.STRING(255),
        allowNull: true,
    },
    reset_token_expires: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    
    // ✅ FIX: Timestamps defined as top-level attributes
    created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    }
}, {
    // Model Options
    tableName: 'users',
    // Tell Sequelize to use the fields we defined above for timestamps
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
});

module.exports = User;