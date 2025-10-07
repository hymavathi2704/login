const { expressjwt: jwt } = require('express-jwt');
const User = require('../models/user');

const REFRESH_COOKIE_NAME = process.env.REFRESH_COOKIE_NAME || 'refresh_token';
const ACCESS_COOKIE_NAME = 'jwt'; // The name of the cookie where the Access Token is stored

// Middleware to protect routes
const authenticate = jwt({
  secret: process.env.JWT_SECRET,
  algorithms: ['HS256'],
  requestProperty: 'user', // <- put decoded token on req.user (so controllers keep working)
  getToken: (req) => {
    // 1. CHECK COOKIE FIRST (since login sets it this way for cross-origin security)
    if (req.cookies && req.cookies[ACCESS_COOKIE_NAME]) {
        return req.cookies[ACCESS_COOKIE_NAME];
    }
    
    // 2. FALLBACK to Authorization header: "Bearer <token>"
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
        // The token payload is stored in req.user, so req.user.userId must exist here.
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
};