// Backend/models/Booking.js
'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Booking extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Associations are defined in server.js, so you can leave this empty
      // Or you can move the Booking associations here:
      // Booking.belongsTo(models.Session, { foreignKey: 'sessionId', as: 'Session' });
      // Booking.belongsTo(models.User, { foreignKey: 'clientId', as: 'client' });
    }
  }
  Booking.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    clientId: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'CASCADE', 
    },
    sessionId: { 
      type: DataTypes.CHAR(36),
      allowNull: false, 
      references: {
        model: 'coach_sessions', 
        key: 'id',
      },
      onDelete: 'CASCADE', 
    },
    status: {
      type: DataTypes.ENUM('confirmed', 'pending', 'cancelled', 'completed'), 
      defaultValue: 'pending',
    },
    isReviewed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
      comment: 'Flag to prevent multiple testimonials for the same booking.'
    },
    bookedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    }
  }, {
    sequelize,
    modelName: 'Booking',
    tableName: 'client_bookings',
    timestamps: true,
  });
  return Booking;
};