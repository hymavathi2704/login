const { expressjwt: jwt } = require('express-jwt');
const User = require('../models/user');

// Middleware to protect routes
const authenticate = jwt({
  secret: process.env.JWT_SECRET,
  algorithms: ['HS256'],
  getToken: (req) => {
    // Attempt to get token from 'Authorization' header
    if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
      return req.headers.authorization.split(' ')[1];
    }
    
    // Fallback to getting token from cookies (optional)
    if (req.cookies && req.cookies.token) {
      return req.cookies.token;
    }

    return null;
  },
});

// Middleware to check user role
const authorize = (roles = []) => {
    if (typeof roles === 'string') {
        roles = [roles];
    }

    return [
        authenticate,
        async (req, res, next) => {
            try {
                const user = await User.findByPk(req.auth.userId);
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

