const { expressjwt: jwt } = require('express-jwt');
const User = require('../models/user');

const REFRESH_COOKIE_NAME = process.env.REFRESH_COOKIE_NAME || 'refresh_token';

// Middleware to authenticate access token
const authenticate = jwt({
  secret: process.env.JWT_SECRET,
  algorithms: ['HS256'],
  requestProperty: 'user', // decoded token will be in req.user
  getToken: (req) => {
    // 1️⃣ Authorization header: Bearer <accessToken>
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      return req.headers.authorization.split(' ')[1];
    }

    // 2️⃣ Optional fallback (refresh cookie) — usually not used for access-protected routes
    if (req.cookies && req.cookies[REFRESH_COOKIE_NAME]) {
      return req.cookies[REFRESH_COOKIE_NAME];
    }

    return null;
  },
});

// Middleware to authorize by roles
const authorize = (roles = []) => {
  if (typeof roles === 'string') roles = [roles];

  return [
    authenticate,
    async (req, res, next) => {
      try {
        const user = await User.findByPk(req.user?.userId); // must match payload
        if (!user) return res.status(401).json({ error: 'Unauthorized: user not found' });
        if (roles.length && !roles.some(role => user.roles.includes(role))) {
          return res.status(403).json({ error: 'Forbidden: insufficient permissions' });
        }
        req.userDetails = user; // optional: attach full user to request
        next();
      } catch (err) {
        next(err);
      }
    },
  ];
};

module.exports = {
  authenticate,
  authorize,
};
