// Backend/models/Follow.js
'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Follow extends Model {
    static associate(models) {
      // Associations are in server.js
    }
  }
  Follow.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    followerId: { 
      type: DataTypes.CHAR(36), 
      allowNull: false,
      references: { model: 'users', key: 'id' },
      onDelete: 'CASCADE',
    },
    followingId: { 
      type: DataTypes.CHAR(36), 
      allowNull: false,
      references: { model: 'users', key: 'id' },
      onDelete: 'CASCADE',
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
    },
  }, {
    sequelize,
    modelName: 'Follow',
    tableName: 'follows', 
    timestamps: true,
    createdAt: 'created_at', 
    updatedAt: 'updated_at',
    indexes: [
      { unique: true, fields: ['followerId', 'followingId'] }
    ]
  });
  return Follow;
};