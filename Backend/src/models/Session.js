const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Session = sequelize.define('Session', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false,
    },
    coachProfileId: {
        type: DataTypes.CHAR(36),
        allowNull: false,
        references: {
            model: 'coach_profiles',
            key: 'id',
        },
    },
    title: DataTypes.STRING,
    description: DataTypes.TEXT,
    duration: DataTypes.INTEGER,
    price: DataTypes.DECIMAL(10, 2),
    format: DataTypes.STRING,
}, {
    tableName: 'coach_sessions',
    timestamps: true,
});

module.exports = Session;