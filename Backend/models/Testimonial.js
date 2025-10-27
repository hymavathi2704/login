// Backend/models/Testimonial.js
'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Testimonial extends Model {
    static associate(models) {
      // Association with CoachProfile
      Testimonial.belongsTo(models.CoachProfile, {
        foreignKey: 'coachProfileId',
        as: 'coachProfile'
      });
      // Association with Client (User)
      Testimonial.belongsTo(models.User, {
        foreignKey: 'clientId',
        as: 'client'
      });
      // Association with Booking <-- ADDED
      Testimonial.belongsTo(models.Booking, {
        foreignKey: 'bookingId',
        as: 'booking'
      });
    }
  }
  Testimonial.init({
    // Keep existing ID if needed, or remove if you want Sequelize default
    // id: {
    //   type: DataTypes.STRING, // Or INTEGER if you changed Booking ID type
    //   primaryKey: true,
    //   allowNull: false,
    // },
    coachProfileId: {
      type: DataTypes.CHAR(36), // Assuming CoachProfile ID is UUID
      allowNull: false,
      references: {
        model: 'coach_profiles', // Ensure this matches the table name
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    clientId: {
      type: DataTypes.CHAR(36), // Assuming User ID is UUID
      allowNull: false,
      references: {
        model: 'users', // Ensure this matches the table name
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    // bookingId field <-- ADDED
    bookingId: {
        type: DataTypes.INTEGER, // Match the Booking model's ID type
        allowNull: false,
        references: {
            model: 'client_bookings', // Name of the bookings table
            key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE', // Or 'SET NULL' if testimonials should remain
        unique: true // Ensure only one testimonial per booking
    },
    clientName: { // Added clientName field
        type: DataTypes.STRING,
        allowNull: true, // Or false if you always want a name
    },
    clientTitle: DataTypes.STRING,
    rating: DataTypes.INTEGER,
    content: DataTypes.TEXT,
    date: DataTypes.DATEONLY, // Consider DATE if you need time too
    // sessionType might be redundant if linked to Booking -> Session
    // sessionType: DataTypes.STRING,
    isApproved: { // Added approval flag
        type: DataTypes.BOOLEAN,
        defaultValue: false, // Default to not approved? Or true?
        allowNull: false,
    },
  }, {
    sequelize,
    modelName: 'Testimonial',
    tableName: 'coach_testimonials', // Ensure this table name is correct
    timestamps: true, // Adds createdAt and updatedAt automatically
    // paranoid: true, // Uncomment if you want soft deletes (adds deletedAt)
  });
  return Testimonial;
};