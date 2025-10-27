// Backend/models/user.js
'use strict';
const { Model } = require('sequelize');
const bcrypt = require('bcryptjs');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // We are defining associations in server.js, so this is left empty.
    }

    // This prototype method is preserved
    async matchPassword(enteredPassword) {
      const hashToCompare = this.getDataValue('password_hash');
      if (!hashToCompare) {
        return false;
      }
      return await bcrypt.compare(enteredPassword, hashToCompare);
    }
  }
  User.init({
    id: {
      type: DataTypes.CHAR(36),
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },
    phone: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    password_hash: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    password: {
      type: DataTypes.VIRTUAL,
      get() {
        return this.getDataValue('password_hash');
      },
      set(val) {
        this.setDataValue('password', val); 
      }
    },
    provider: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    oauth_id: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    profilePicture: { 
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    roles: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: '[]',
      get() {
        const raw = this.getDataValue('roles');
        return raw ? JSON.parse(raw) : [];
      },
      set(value) {
        this.setDataValue('roles', JSON.stringify(value));
      }
    },
    email_verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    verification_token: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    verification_token_expires: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    reset_token: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    reset_token_expires: {
      type: DataTypes.DATE,
      allowNull: true,
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
    modelName: 'User',
    tableName: 'users',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    hooks: {
      beforeSave: async (user, options) => {
        if (user.getDataValue('password')) {
          const salt = await bcrypt.genSalt(10);
          const hashedPassword = await bcrypt.hash(user.getDataValue('password'), salt);
          user.setDataValue('password_hash', hashedPassword);
        }
      }
    }
  });
  return User;
};