const { expressjwt: jwt } = require('express-jwt');
const User = require('../models/user');

const REFRESH_COOKIE_NAME = process.env.REFRESH_COOKIE_NAME || 'refresh_token';
const ACCESS_COOKIE_NAME = 'jwt'; // The name of the cookie where the Access Token is stored

// Middleware to protect routes (STRICT - requires login)
const authenticate = jwt({
  secret: process.env.JWT_SECRET,
  algorithms: ['HS256'],
  requestProperty: 'user', // <- put decoded token on req.user
  getToken: (req) => {
    // 1. CHECK COOKIE FIRST
    if (req.cookies && req.cookies[ACCESS_COOKIE_NAME]) {
        return req.cookies[ACCESS_COOKIE_NAME];
    }
    
    // 2. FALLBACK to Authorization header
    if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
      return req.headers.authorization.split(' ')[1];
    }
    
    return null;
  },
});

// ✅ NEW: Middleware to OPTIONALLY check for a user
// This will add req.user if a valid token is found,
// but will NOT fail if no token is present.
const authenticateOptionally = jwt({
  secret: process.env.JWT_SECRET,
  algorithms: ['HS256'],
  requestProperty: 'user',
  credentialsRequired: false, // <-- This allows requests without a token
  getToken: (req) => {
    // (Same token logic as 'authenticate')
    if (req.cookies && req.cookies[ACCESS_COOKIE_NAME]) {
        return req.cookies[ACCESS_COOKIE_NAME];
    }
    if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
      return req.headers.authorization.split(' ')[1];
    }
    return null;
  },
});


const authorize = (roles = []) => {
  if (typeof roles === 'string') {
    roles = [roles];
  }

  return [
    authenticate,
    async (req, res, next) => {
      try {
        // The token payload is stored in req.user...
        const user = await User.findByPk(req.user.userId);
        if (!user || !roles.some(role => user.roles.includes(role))) {
          return res.status(403).json({ error: 'Forbidden: You do not have the required permissions.' });
        }
        next();
      } catch (error) {
        next(error);
      }
    }
  ];
};

module.exports = {
  authenticate,
  authorize,
  authenticateOptionally, // 👈 Export the new function
};