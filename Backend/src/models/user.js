// src/models/user.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const User = sequelize.define('User', {
    id: {
        type: DataTypes.CHAR(36),
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
    // CRITICAL FIX: The profilePicture column, necessary for the database
    profilePicture: { 
        type: DataTypes.STRING(255),
        allowNull: true,
    },
    roles: {
        type: DataTypes.TEXT,
        allowNull: false,
        defaultValue: '[]',
        get() {
            const raw = this.getDataValue('roles');
            return raw ? JSON.parse(raw) : [];
        },
        set(value) {
            this.setDataValue('roles', JSON.stringify(value));
        }
    },
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
    created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
    },
    updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
    },
}, {
    tableName: 'users',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
});

module.exports = User;