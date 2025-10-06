const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authMiddleware');
const coachProfileController = require('../controllers/coachProfileController');

// ==============================
// Logged-in coach routes
// ==============================
router.get('/profile', authenticate, coachProfileController.getCoachProfile);
router.put('/profile', authenticate, coachProfileController.updateCoachProfile);
router.post('/profile/add-item', authenticate, coachProfileController.addItem);
router.post('/profile/remove-item', authenticate, coachProfileController.removeItem);
router.post('/profile/upload-picture', authenticate, coachProfileController.uploadProfilePicture);

// ==============================
// Public coach profile
// ==============================
router.get('/public/:id', coachProfileController.getPublicCoachProfile);

module.exports = router;
