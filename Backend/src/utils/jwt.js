const jwt = require('jsonwebtoken');
require('dotenv').config();

const signAccessToken = (user) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is missing. Check your .env file.");
  }

  // Include `id` and roles in the payload for authentication
  const payload = {
    id: user.id,
    email: user.email,
    roles: user.roles
  };

  return jwt.sign(
    payload,
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_ACCESS_EXPIRES || '15m' }
  );
};

const signEmailToken = (payload) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is missing. Check your .env file.");
  }

  return jwt.sign(
    payload,
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EMAIL_VERIFICATION_EXPIRES || '24h' }
  );
};

const verifyToken = (token) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is missing. Check your .env file.");
  }

  return jwt.verify(token, process.env.JWT_SECRET);
};

module.exports = {
  signAccessToken,
  signEmailToken,
  verifyToken
};
