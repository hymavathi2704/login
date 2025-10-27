// Backend/models/CoachProfile.js
'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class CoachProfile extends Model {
    static associate(models) {
      // Associations are in server.js
    }
  }
  CoachProfile.init({
    id: {
      type: DataTypes.CHAR(36),
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    userId: {
      type: DataTypes.CHAR(36),
      allowNull: false,
      unique: true,
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    professionalTitle: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    bio: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    specialties: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    certifications: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    education: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    yearsOfExperience: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    linkedinUrl: { type: DataTypes.STRING, allowNull: true },
    twitterUrl: { type: DataTypes.STRING, allowNull: true },
    instagramUrl: { type: DataTypes.STRING, allowNull: true },
    facebookUrl: { type: DataTypes.STRING, allowNull: true },
    dateOfBirth: { type: DataTypes.DATEONLY, allowNull: true },
    gender: { type: DataTypes.STRING, allowNull: true },
    ethnicity: { type: DataTypes.STRING, allowNull: true },
    country: { type: DataTypes.STRING, allowNull: true },
    totalClients: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
  }, {
    sequelize,
    modelName: 'CoachProfile',
    tableName: 'coach_profiles',
    timestamps: true,
  });
  return CoachProfile;
};