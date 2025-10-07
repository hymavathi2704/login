const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
// NOTE: Imports for other models (User, CoachProfile) are removed to prevent circular dependency issues.

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
    // REMOVED: clientName, clientAvatar (This data is fetched from the User model via clientId)
    clientTitle: DataTypes.STRING, 
    rating: DataTypes.INTEGER,
    content: DataTypes.TEXT,
    date: DataTypes.DATEONLY,
    sessionType: DataTypes.STRING,
}, {
    tableName: 'coach_testimonials',
    timestamps: true,
});

// NOTE: Association definitions are removed from here. They are centralized in server.js.

module.exports = Testimonial;