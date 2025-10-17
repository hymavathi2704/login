const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const bcrypt = require('bcryptjs'); // <--- 1. Import bcryptjs

const User = sequelize.define('User', {
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
    // Database column for the hashed password
    password_hash: {
        type: DataTypes.STRING(255),
        allowNull: true,
    },
    // VIRTUAL FIELD: Used by the controller (e.g., user.password = newPassword)
    password: {
        type: DataTypes.VIRTUAL,
        // Getter for consistency. Controller is expected to query with include: ['password_hash']
        get() {
            return this.getDataValue('password_hash');
        },
        // Setter stores the plaintext password temporarily on the model instance
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
    tableName: 'users',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    // 2. Add beforeSave hook to hash the password
    hooks: {
        beforeSave: async (user, options) => {
            // Check if the virtual password field was set (i.e., a new password was provided)
            if (user.getDataValue('password')) {
                // Hash the plaintext password
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(user.getDataValue('password'), salt);
                
                // Store the hash in the actual database column
                user.setDataValue('password_hash', hashedPassword);
            }
        }
    }
});

// 3. Add the matchPassword prototype method using bcryptjs
User.prototype.matchPassword = async function (enteredPassword) {
    // Compare the entered plaintext password with the hash from the 'password_hash' column
    const hashToCompare = this.getDataValue('password_hash');
    if (!hashToCompare) {
        return false; // Cannot compare if no hash exists (e.g., social login)
    }
    return await bcrypt.compare(enteredPassword, hashToCompare);
};


module.exports = User;