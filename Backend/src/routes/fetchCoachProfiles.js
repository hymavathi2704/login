// Backend/src/routes/fetchCoachProfiles.js
const express = require('express');
const router = express.Router();
const { getPublicCoachProfile } = require('../controllers/coachProfileController');

// Route to get a specific coach's public profile
router.get('/:id', getPublicCoachProfile);

// Route to get all coach profiles (for client discovery/search)
// router.get('/', getAllCoachProfiles); // Assuming this exists or will be added

module.exports = router;