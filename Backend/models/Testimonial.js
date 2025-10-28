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
      // Association with Booking
      Testimonial.belongsTo(models.Booking, {
        foreignKey: 'bookingId',
        as: 'booking'
      });
    }
  }
  Testimonial.init({
    id: {
      type: DataTypes.INTEGER, // Using INTEGER for primary key if auto-incremented
      primaryKey: true,
      autoIncrement: true, // Assuming you want auto-incrementing ID
      allowNull: false,
    },
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
    // bookingId field
    bookingId: {
        type: DataTypes.INTEGER, // Match the Booking model's ID type
        allowNull: false,
        references: {
            model: 'client_bookings', // Name of the bookings table
            key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE', 
        unique: true // Ensure only one testimonial per booking
    },
    clientName: { 
        type: DataTypes.STRING,
        allowNull: true, 
    },
    clientTitle: DataTypes.STRING,
    rating: DataTypes.INTEGER,
    content: DataTypes.TEXT,
    date: DataTypes.DATEONLY, 
    isApproved: { // Approval flag
        type: DataTypes.BOOLEAN,
        defaultValue: false, 
        allowNull: false,
    },
  }, {
    sequelize,
    modelName: 'Testimonial',
    tableName: 'coach_testimonials', // Ensure this table name is correct
    timestamps: true, // Adds createdAt and updatedAt automatically
  });
  return Testimonial;
};