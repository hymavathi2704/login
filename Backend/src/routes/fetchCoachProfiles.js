// Backend/src/routes/fetchCoachProfiles.js

const express = require('express');
const router = express.Router();

// ✅ FIX: Import the new 'authenticateOptionally' middleware
const { authenticate, authenticateOptionally } = require('../middleware/authMiddleware'); 
const upload = require('../middleware/upload'); 

// ... (imports for coachProfileController, exploreCoachesController, sessionController) ...
const coachProfileController = require('../controllers/coachProfileController');
const { 
    getPublicCoachProfile,
    getFollowStatus, 
    followCoach, 
    unfollowCoach,
    getAllCoachProfiles,
    getFollowedCoaches,   
} = require('../controllers/exploreCoachesController'); 
const {
    createSession,
    updateSession,
    deleteSession,
    bookSession,
    getCoachSessionBookings
} = require('../controllers/sessionController');


// Helper for CORS
const skipAuthForOptions = (req, res, next) => {
    if (req.method === 'OPTIONS') {
        return res.status(200).end(); 
    }
    next();
};


// ==============================
// Logged-in Coach Profile Management Routes (Protected)
// ==============================
// (These all correctly use the strict 'authenticate')
router.get('/profile', authenticate, coachProfileController.getCoachProfile); 
router.put('/profile', skipAuthForOptions, authenticate, upload.single('profilePicture'), coachProfileController.updateCoachProfile);
router.post('/profile/upload-picture', skipAuthForOptions, authenticate, upload.single('profilePicture'), coachProfileController.uploadProfilePicture);
router.delete('/profile/picture', authenticate, coachProfileController.deleteProfilePicture); 
router.post('/profile/add-item', skipAuthForOptions, authenticate, coachProfileController.addProfileItem);
router.post('/profile/remove-item', skipAuthForOptions, authenticate, coachProfileController.removeProfileItem);


// ==============================
// SESSION MANAGEMENT ROUTES (Protected)
// ==============================
// (These all correctly use the strict 'authenticate')
router.post('/sessions', skipAuthForOptions, authenticate, createSession); 
router.put('/sessions/:sessionId', skipAuthForOptions, authenticate, updateSession); 
router.delete('/sessions/:sessionId', skipAuthForOptions, authenticate, deleteSession); 


// ==============================
// BOOKING & FOLLOWER ROUTES (Internal/Protected)
// ==============================
// (These all correctly use the strict 'authenticate')
router.get('/my-bookings', authenticate, getCoachSessionBookings); 
router.post('/public/:sessionId/book', skipAuthForOptions, authenticate, bookSession); 


// ==============================
// Public/Discovery Routes 
// ==============================

// For 'Explore Coaches' list - public, no auth needed
router.get('/coaches', getAllCoachProfiles); 
// For 'My Followed Coaches' list - needs auth
router.get('/followed', authenticate, getFollowedCoaches);

// GET Public Coach Profile 
// ✅ THE MAIN FIX: 
// Use 'authenticateOptionally' instead of 'authenticate'.
// This will work for all 3 of your scenarios.
router.get('/coach/:id', authenticateOptionally, getPublicCoachProfile);

// Follow/Unfollow Routes (These require a user to be logged in)
// (These all correctly use the strict 'authenticate')
router.get('/public/:coachId/follow-status', authenticate, getFollowStatus); 
router.post('/public/:coachId/follow', skipAuthForOptions, authenticate, followCoach);
router.delete('/public/:coachId/follow', skipAuthForOptions, authenticate, unfollowCoach);


module.exports = router;