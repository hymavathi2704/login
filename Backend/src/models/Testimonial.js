const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Testimonial = sequelize.define('Testimonial', {
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
    clientName: DataTypes.STRING,
    clientTitle: DataTypes.STRING,
    clientAvatar: DataTypes.STRING,
    rating: DataTypes.INTEGER,
    content: DataTypes.TEXT,
    date: DataTypes.DATEONLY,
    sessionType: DataTypes.STRING,
}, {
    tableName: 'coach_testimonials',
    timestamps: true,
});

module.exports = Testimonial;