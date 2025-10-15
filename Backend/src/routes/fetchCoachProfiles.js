// Backend/src/routes/fetchCoachProfiles.js
const express = require('express');
const router = express.Router();
// Assuming authenticate is the correct export from your auth middleware
const { authenticate } = require('../middleware/authMiddleware'); // <-- Import middleware

// Assuming your controller exports are fixed to include all necessary functions
const { 
    // REMOVED: getPublicCoachProfile, as it's now accessed via /api/coach/public/:id
    getAllCoachProfiles,
    getFollowedCoaches // <-- NEW FUNCTION FOR FOLLOWED TAB
} = require('../controllers/coachProfileController'); 

// 1. Route to get all coach profiles (Discovery/Search)
// GET /api/profiles/coaches
router.get('/coaches', getAllCoachProfiles);

// 2. Route to get the client's followed coaches (Protected Route)
// GET /api/profiles/followed
router.get('/followed', authenticate, getFollowedCoaches); // <-- NEW ROUTE ADDED

// 🚨 REMOVED: The problematic /api/profiles/:id route. This prevents conflicts
// with /api/profiles/coaches and /api/profiles/followed. The coach profile
// is served under the /api/coach/public/:id route.

module.exports = router;