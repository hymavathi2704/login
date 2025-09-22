const express = require('express');
const router = express.Router();
const cors = require('cors');
const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');
const path = require('path');
const multer = require('multer');

const auth = require('../controllers/authController');
const { authenticate } = require('../middleware/authMiddleware');
const { authLimiter } = require('../middleware/rateLimiter');

// Allow preflight requests for CORS
router.options('*', cors());

// ==============================
// Multer setup for profile photo uploads
// ==============================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `profile_${Date.now()}${ext}`);
  },
});

const upload = multer({ storage });

// ==============================
// Auth0 JWKS client for social login
// ==============================
const client = jwksClient({
  jwksUri: `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`,
});

const getKey = (header, callback) => {
  client.getSigningKey(header.kid, (err, key) => {
    if (err) {
      console.error('JWKS key fetch error:', err);
      return callback(err);
    }
    callback(null, key.getPublicKey());
  });
};

const verifyAuth0Token = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Missing Authorization token' });

  jwt.verify(
    token,
    getKey,
    {
      audience: process.env.AUTH0_AUDIENCE,
      issuer: `https://${process.env.AUTH0_DOMAIN}/`,
      algorithms: ['RS256'],
    },
    (err, decoded) => {
      if (err) {
        console.error('Auth0 token validation failed:', err.message);
        return res.status(401).json({ error: 'Invalid Auth0 token' });
      }
      req.auth = decoded;
      next();
    }
  );
};

// ==============================
// Auth Routes
// ==============================
router.post('/register', authLimiter, auth.register);
router.post('/login', authLimiter, auth.login);
router.post('/social-login', authLimiter, verifyAuth0Token, auth.socialLogin);

router.post('/send-verification', authLimiter, auth.resendVerification);
router.post('/verify-email', auth.verifyEmail);

router.post('/forgot-password', authLimiter, auth.forgotPassword);
router.post('/reset-password', authLimiter, auth.resetPassword);

router.post('/logout', auth.logout);

// ==============================
// Profile Routes (Requires JWT)
// ==============================
router.get('/me', authenticate, auth.me);
router.put('/me', authenticate, auth.updateProfile);
router.put('/me/photo', authenticate, upload.single('profilePhoto'), auth.uploadProfilePhoto);

// ==============================
// Export router
// ==============================
module.exports = router;
