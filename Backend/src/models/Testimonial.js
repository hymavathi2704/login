const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const CoachProfile = require('./CoachProfile'); 
const User = require('./user'); 

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
        onDelete: 'CASCADE',
    },
    clientId: { // NEW: Link to the client (User) who wrote the testimonial
        type: DataTypes.CHAR(36),
        allowNull: false,
        references: {
            model: 'users',
            key: 'id',
        },
        onDelete: 'CASCADE',
    },
    // NOTE: clientName and clientAvatar are removed and fetched from the associated clientUser
    clientTitle: DataTypes.STRING, // Kept clientTitle as it's non-User data
    rating: DataTypes.INTEGER,
    content: DataTypes.TEXT,
    date: DataTypes.DATEONLY,
    sessionType: DataTypes.STRING,
}, {
    tableName: 'coach_testimonials',
    timestamps: true,
});

// Associations
Testimonial.belongsTo(CoachProfile, { 
    foreignKey: 'coachProfileId', 
    as: 'coachProfile'
});

Testimonial.belongsTo(User, { // NEW ASSOCIATION: Testimonial belongs to a Client (User)
    foreignKey: 'clientId',
    as: 'clientUser'
});

module.exports = Testimonial;