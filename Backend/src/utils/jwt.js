const jwt = require('jsonwebtoken');
require('dotenv').config();

const signAccessToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_ACCESS_EXPIRES || '15m' });
};

const signEmailToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EMAIL_VERification_EXPIRES || '24h' });
};

const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

module.exports = {
  signAccessToken,
  signEmailToken,
  verifyToken
};
