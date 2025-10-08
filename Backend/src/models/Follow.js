// Backend/src/models/Follow.js

const { DataTypes } = require('sequelize');
const sequelize = require('../config/db'); 

const Follow = sequelize.define('Follow', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    followerId: { 
        type: DataTypes.CHAR(36), 
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE',
    },
    followingId: { 
        type: DataTypes.CHAR(36), 
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE',
    },
    // Explicitly defined columns for MySQL to avoid schema errors
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
    tableName: 'follows', 
    timestamps: true,
    createdAt: 'created_at', 
    updatedAt: 'updated_at',
    indexes: [
        { unique: true, fields: ['followerId', 'followingId'] }
    ]
});

module.exports = Follow;