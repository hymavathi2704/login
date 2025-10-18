// Backend/src/routes/fetchCoachProfiles.js

const express = require('express');
const router = express.Router();

const { authenticate } = require('../middleware/authMiddleware'); 

// ✅ Import functions from the dedicated Explore/Discovery Controller
const { 
    getAllCoachProfiles,
    getPublicCoachProfile,
    getFollowedCoaches,
    getFollowStatus,
    followCoach,
    unfollowCoach
} = require('../controllers/exploreCoachesController'); 

// ==============================
// Public Discovery Routes (No Auth Required)
// ==============================

// GET /api/profiles/coaches - Get all coaches for discovery
router.get('/coaches', getAllCoachProfiles);

// GET /api/profiles/coach/:id - Get a single public coach profile
router.get('/coach/:id', getPublicCoachProfile);


// ==============================
// Client Follow Routes (Protected by Auth)
// ==============================

// GET /api/profiles/followed - Get the client's list of followed coaches
router.get('/followed', authenticate, getFollowedCoaches);

// Follow/Unfollow specific coach
router.get('/coach/:coachId/follow-status', authenticate, getFollowStatus);
router.post('/coach/:coachId/follow', authenticate, followCoach);
router.delete('/coach/:coachId/follow', authenticate, unfollowCoach);


module.exports = router;