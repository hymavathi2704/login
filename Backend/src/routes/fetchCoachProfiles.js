// Backend/src/routes/fetchCoachProfiles.js
const express = require('express');
const router = express.Router();
const { 
    getPublicCoachProfile, 
    getAllCoachProfiles 
} = require('../controllers/coachProfileController'); // Assuming the controller imports are fixed and correct

// FIX: Place the specific '/coaches' route FIRST.
// 1. Route to get all coach profiles (for client discovery/search)
router.get('/coaches', getAllCoachProfiles);

// 2. Route to get a specific coach's public profile (Must be after specific routes)
router.get('/:id', getPublicCoachProfile);

module.exports = router;