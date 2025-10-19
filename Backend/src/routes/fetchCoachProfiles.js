// Backend/src/routes/fetchCoachProfiles.js

const express = require('express');
const router = express.Router();

const { authenticate } = require('../middleware/authMiddleware'); 
const upload = require('../middleware/upload'); 

// Import profile management functions (Profile Update, Picture Upload/Delete, Item Management)
const coachProfileController = require('../controllers/coachProfileController');

// ✅ Import discovery/follow functions from the dedicated Explore Controller (Updated)
const { 
    getPublicCoachProfile,
    getFollowStatus, 
    followCoach, 
    unfollowCoach,
    getAllCoachProfiles,  // Re-added for ExploreCoaches list
    getFollowedCoaches,   // Re-added for Followed list
} = require('../controllers/exploreCoachesController'); 

// Import session management functions
const {
    createSession,
    updateSession,
    deleteSession,
    bookSession,
    getCoachSessionBookings
} = require('../controllers/sessionController');


// Helper for CORS preflight handling
const skipAuthForOptions = (req, res, next) => {
    if (req.method === 'OPTIONS') {
        return res.status(200).end(); 
    }
    next();
};


// ==============================
// Logged-in Coach Profile Management Routes (Protected)
// ==============================
router.get('/profile', authenticate, coachProfileController.getCoachProfile);

router.put(
    '/profile', 
    skipAuthForOptions, 
    authenticate, 
    upload.single('profilePicture'), 
    coachProfileController.updateCoachProfile
);

// Dedicated Picture management
router.post(
    '/profile/upload-picture', 
    skipAuthForOptions, 
    authenticate, 
    upload.single('profilePicture'), 
    coachProfileController.uploadProfilePicture
);
router.delete('/profile/picture', authenticate, coachProfileController.deleteProfilePicture); 

// JSON Array management
router.post('/profile/add-item', skipAuthForOptions, authenticate, coachProfileController.addProfileItem);
router.post('/profile/remove-item', skipAuthForOptions, authenticate, coachProfileController.removeProfileItem);


// ==============================
// SESSION MANAGEMENT ROUTES (Protected)
// ==============================
router.post('/sessions', skipAuthForOptions, authenticate, createSession); 
router.put('/sessions/:sessionId', skipAuthForOptions, authenticate, updateSession); 
router.delete('/sessions/:sessionId', skipAuthForOptions, authenticate, deleteSession); 


// ==============================
// BOOKING & FOLLOWER ROUTES (Internal/Protected)
// ==============================

// Coach views their session bookings
router.get('/my-bookings', authenticate, getCoachSessionBookings); 

// POST /public/:sessionId/book - Client books a session (protected route)
router.post('/public/:sessionId/book', skipAuthForOptions, authenticate, bookSession); 


// ==============================
// Public/Discovery Routes (The FIX is here: changing /public to /coach)
// ==============================

// Re-added routes for fetching coach lists
router.get('/coaches', getAllCoachProfiles); 
router.get('/followed', authenticate, getFollowedCoaches);

// GET Public Coach Profile 
// ✅ FIX: Changed '/public/:id' to '/coach/:id' to match frontend API call
router.get('/coach/:id', authenticate, getPublicCoachProfile);

// Follow/Unfollow Routes 
// NOTE: These routes use /public/ which is acceptable as they handle follow status
router.get('/public/:coachId/follow-status', authenticate, getFollowStatus); 
router.post('/public/:coachId/follow', skipAuthForOptions, authenticate, followCoach);
router.delete('/public/:coachId/follow', skipAuthForOptions, authenticate, unfollowCoach);


module.exports = router;