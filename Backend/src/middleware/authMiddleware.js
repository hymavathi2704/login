const { expressjwt: jwt } = require('express-jwt');
const User = require('../../models/user');
const jsonwebtoken = require('jsonwebtoken'); // 👈 ADD THIS

const REFRESH_COOKIE_NAME = process.env.REFRESH_COOKIE_NAME || 'refresh_token';
const ACCESS_COOKIE_NAME = 'jwt'; // The name of the cookie where the Access Token is stored

// (Helper function to get token - copied from your existing middleware)
const getTokenFromRequest = (req) => {
  if (req.cookies && req.cookies[ACCESS_COOKIE_NAME]) {
    return req.cookies[ACCESS_COOKIE_NAME];
  }
  if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
    return req.headers.authorization.split(' ')[1];
  }
  return null;
};

// Middleware to protect routes (STRICT - requires login)
const authenticate = jwt({
  secret: process.env.JWT_SECRET,
  algorithms: ['HS256'],
  requestProperty: 'user', // <- put decoded token on req.user
  getToken: getTokenFromRequest,
});

// Middleware to OPTIONALLY check for a user
const authenticateOptionally = jwt({
  secret: process.env.JWT_SECRET,
  algorithms: ['HS256'],
  requestProperty: 'user',
  credentialsRequired: false, // <-- This allows requests WITHOUT a token
  getToken: getTokenFromRequest,
});

// ✅ NEW: Middleware to get user from token, but NOT fail on expiration
// This is specifically for testimonial submission and eligibility
const authenticateAllowExpired = (req, res, next) => {
  const token = getTokenFromRequest(req);

  if (!token) {
    // No token, just proceed.
    // The controller will then fail with a 401, which is correct.
    return next();
  }

  try {
    // 1. Try to verify the token normally
    const payload = jsonwebtoken.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });
    req.user = payload; // Attach valid user to request
    return next();
  } catch (error) {
    // 2. If it fails, check if it's an expiration error
    if (error.name === 'TokenExpiredError') {
      console.warn('Auth Middleware: Token expired, but proceeding for review check/submission.');
      // Token is expired, but we still want the user ID
      const decodedPayload = jsonwebtoken.decode(token);
      req.user = decodedPayload; // Attach EXPIRED user to request
      return next();
    }
    
    // 3. If it's another error (e.g., invalid signature), treat as unauthenticated
    console.error('Auth Middleware: Invalid token.', error.message);
    // Do not attach user. The controller will now fail with a 401.
    return next();
  }
};


const authorize = (roles = []) => {
  if (typeof roles === 'string') {
    roles = [roles];
  }

  return [
    authenticate,
    async (req, res, next) => {
      try {
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
  authenticateOptionally,
  authenticateAllowExpired, // 👈 Export the new function
};