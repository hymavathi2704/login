const { expressjwt: jwt } = require('express-jwt');
const User = require('../models/user');

const REFRESH_COOKIE_NAME = process.env.REFRESH_COOKIE_NAME || 'refresh_token';

// Middleware to protect routes
const authenticate = jwt({
  secret: process.env.JWT_SECRET,
  algorithms: ['HS256'],
  requestProperty: 'user', // <- put decoded token on req.user (so controllers keep working)
  getToken: (req) => {
    // Authorization header: "Bearer <token>"
    if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
      return req.headers.authorization.split(' ')[1];
    }
    
    // CRITICAL FIX: Removed the fallback to the REFRESH_COOKIE_NAME to ensure
    // the middleware only tries to use the Access Token from the header.
    
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