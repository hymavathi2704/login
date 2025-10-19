// Backend/src/routes/coachProfile.js

const express = require('express');
const router = express.Router();

const { authenticate } = require('../middleware/authMiddleware'); 
const upload = require('../middleware/upload'); 

// Import profile management functions (Profile Update, Picture Upload/Delete, Item Management)
const coachProfileController = require('../controllers/coachProfileController');

// ✅ Import discovery/follow functions from the dedicated Explore Controller
// ✅ Import discovery/follow functions from the dedicated Explore Controller
const { 
    getPublicCoachProfile,
    getFollowStatus, 
    followCoach, 
    unfollowCoach,
    getAllCoachProfiles, // <-- ADDED THIS
    getFollowedCoaches,  // <-- ADDED THIS
} = require('../controllers/exploreCoachesController');

// ==============================
// Coach Discovery Routes (Missing from original, adding them now)
// These routes are what the frontend ExploreCoaches.jsx is trying to hit.
// ==============================

// 1. GET /api/profiles/coaches (All Coaches) - Public or optionally authenticated
router.get('/coaches', getAllCoachProfiles); 

// 2. GET /api/profiles/followed (Followed Coaches) - Must be authenticated
router.get('/followed', authenticate, getFollowedCoaches);

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
// ✅ FIX: Renamed controller functions to match the exports in coachProfileController.js
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

// ❌ REMOVED ROUTE: Coach views clients who follow them (Route moved to fetchCoachProfiles.js)
// router.get('/clients-who-follow', authenticate, getClientsWhoFollow); 

// POST /public/:sessionId/book - Client books a session (protected route)
router.post('/public/:sessionId/book', skipAuthForOptions, authenticate, bookSession); 


// ==============================
// Public/Follow Routes (Accessible via /api/coach base path)
// ==============================

// GET Public Coach Profile 
// FIX: Add 'authenticate' middleware here. This populates req.user.userId, which is 
// used by getPublicCoachProfile to check if the viewing client has already booked a session.
router.get('/public/:id', authenticate, getPublicCoachProfile);

// Follow/Unfollow Routes 
router.get('/public/:coachId/follow-status', authenticate, getFollowStatus); 
router.post('/public/:coachId/follow', skipAuthForOptions, authenticate, followCoach);
router.delete('/public/:coachId/follow', skipAuthForOptions, authenticate, unfollowCoach);


module.exports = router;