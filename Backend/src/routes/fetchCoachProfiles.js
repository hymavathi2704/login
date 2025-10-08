// Backend/src/routes/fetchCoachProfiles.js
const express = require('express');
const router = express.Router();
// Assuming authenticate is the correct export from your auth middleware
const { authenticate } = require('../middleware/authMiddleware'); // <-- Import middleware

// Assuming your controller exports are fixed to include all necessary functions
const { 
    getPublicCoachProfile, 
    getAllCoachProfiles,
    getFollowedCoaches // <-- NEW FUNCTION FOR FOLLOWED TAB
} = require('../controllers/coachProfileController'); 

// 1. Route to get all coach profiles (Discovery/Search)
// GET /api/profiles/coaches
router.get('/coaches', getAllCoachProfiles);

// 2. Route to get the client's followed coaches (Protected Route)
// GET /api/profiles/followed
router.get('/followed', authenticate, getFollowedCoaches); // <-- NEW ROUTE ADDED

// 3. Route to get a specific coach's public profile (Must be last)
// GET /api/profiles/:id
router.get('/:id', getPublicCoachProfile);

module.exports = router;