// Backend/src/routes/coachProfile.js
const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authMiddleware');
const coachProfileController = require('../controllers/coachProfileController');

// GET /api/coach/profile - Get the logged-in coach's profile
router.get('/profile', authenticate, coachProfileController.getCoachProfile);

// PUT /api/coach/profile - Update the logged-in coach's profile
router.put('/profile', authenticate, coachProfileController.updateCoachProfile);

// NEW: GET /api/coach/public/:coachId - Get any coach's public profile
router.get('/public/:coachId', coachProfileController.getPublicCoachProfile);

module.exports = router;