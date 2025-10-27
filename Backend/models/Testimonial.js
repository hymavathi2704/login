// Backend/models/Testimonial.js
'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Testimonial extends Model {
    static associate(models) {
      // Associations are in server.js
    }
  }
  Testimonial.init({
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
    clientId: { 
      type: DataTypes.CHAR(36),
      allowNull: false,
      references: {
          model: 'users',
          key: 'id',
      },
      onDelete: 'CASCADE',
    },
    clientTitle: DataTypes.STRING, 
    rating: DataTypes.INTEGER,
    content: DataTypes.TEXT,
    date: DataTypes.DATEONLY,
    sessionType: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'Testimonial',
    tableName: 'coach_testimonials',
    timestamps: true,
  });
  return Testimonial;
};