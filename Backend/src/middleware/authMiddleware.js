const { expressjwt } = require('express-jwt');
const User = require('../models/user');

// Middleware to verify JWT token from cookie
const authenticate = expressjwt({
  secret: process.env.JWT_SECRET,
  algorithms: ['HS256'],
  getToken: (req) => {
    if (req.cookies.token) {
      return req.cookies.token;
    }
    return null;
  },
  requestProperty: 'auth' // Decoded token is attached to req.auth
});

// Middleware to check if the user has the 'coach' role
const isCoach = async (req, res, next) => {
  try {
    // We use req.auth.userId because that's what the JWT payload contains
    const user = await User.findByPk(req.auth.userId);
    if (user && user.role === 'coach') {
      next();
    } else {
      res.status(403).json({ error: 'Forbidden: Access denied. User is not a coach.' });
    }
  } catch (error) {
    console.error("isCoach middleware error:", error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Middleware to check if the user has the 'client' role
const isClient = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.auth.userId);
    if (user && user.role === 'client') {
      next();
    } else {
      res.status(403).json({ error: 'Forbidden: Access denied. User is not a client.' });
    }
  } catch (error) {
    console.error("isClient middleware error:", error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = {
  authenticate,
  isCoach,
  isClient
};