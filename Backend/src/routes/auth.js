const express = require('express');
const router = express.Router();
const auth = require('../controllers/authController');
const { authenticate } = require('../middleware/authMiddleware');
const { authLimiter } = require('../middleware/rateLimiter');

router.post('/register', authLimiter, auth.register);
router.post('/login', authLimiter, auth.login);
router.post('/social-login', authLimiter, auth.socialLogin);
router.post('/send-verification', authLimiter, auth.resendVerification);
router.get('/verify-email/:token', auth.verifyEmail);
router.post('/forgot-password', authLimiter, auth.forgotPassword);
router.post('/reset-password', authLimiter, auth.resetPassword);
router.post('/logout', auth.logout);
router.get('/me', authenticate, auth.me);

module.exports = router;
