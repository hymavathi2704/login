// Backend/models/Session.js
'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Session extends Model {
    static associate(models) {
      // Associations are in server.js
    }
  }
  Session.init({
    id: {
      type: DataTypes.CHAR(36),
      defaultValue: DataTypes.UUIDV4,
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
    title: { 
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    type: { 
      type: DataTypes.STRING,
      allowNull: false,
    },
    duration: { 
      type: DataTypes.INTEGER, 
      allowNull: false,
    },
    price: { 
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    defaultDate: { 
      type: DataTypes.DATEONLY, 
      allowNull: true,
      comment: 'Default date for fixed-schedule sessions (e.g., workshops).'
    },
    defaultTime: { 
      type: DataTypes.STRING, 
      allowNull: true,
      comment: 'Default time for fixed-schedule sessions (e.g., workshops).'
    },
    meetingLink: { 
      type: DataTypes.TEXT, 
      allowNull: true,
    },
    isActive: { 
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    }
  }, {
    sequelize,
    modelName: 'Session',
    tableName: 'coach_sessions',
    timestamps: true,
  });
  return Session;
};