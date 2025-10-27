// Backend/src/routes/fetchCoachProfiles.js

const express = require('express');
const router = express.Router();

// ✅ FIX 1: Import the new 'authenticateOptionally' middleware
const { authenticate, authenticateOptionally } = require('../middleware/authMiddleware'); 
const upload = require('../middleware/upload'); 

// ... (your other controller imports) ...
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

const {
    checkReviewEligibility, // 🔑 ADDED
    addTestimonial,         // 🔑 ADDED
} = require('../controllers/testimonialController');

// Helper for CORS
const skipAuthForOptions = (req, res, next) => {
    if (req.method === 'OPTIONS') {
        return res.status(200).end(); 
    }
    next();
};

// ✅ FIX 2: Add this error-catching middleware
// This will catch 'invalid_token' or 'expired_token' errors from
// 'authenticateOptionally' and just let the request continue without a user.
const handleOptionalAuthError = (err, req, res, next) => {
    if (err.name === 'UnauthorizedError') {
        // The token was invalid/expired, but we don't care.
        // Proceed as a public user.
        req.user = null; // Ensure user is not set
        next(); // Go to getPublicCoachProfile
    } else {
        // It was a different error, so pass it along
        next(err);
    }
};


// ==============================
// Logged-in Coach Profile Management Routes (Protected)
// ==============================
// (These remain unchanged, using strict 'authenticate')
router.get('/profile', authenticate, coachProfileController.getCoachProfile); 
router.put('/profile', skipAuthForOptions, authenticate, upload.single('profilePicture'), coachProfileController.updateCoachProfile);
// ... (all other protected routes remain the same) ...
router.delete('/profile/picture', authenticate, coachProfileController.deleteProfilePicture); 
router.post('/profile/add-item', skipAuthForOptions, authenticate, coachProfileController.addProfileItem);
router.post('/profile/remove-item', skipAuthForOptions, authenticate, coachProfileController.removeProfileItem);
router.post('/sessions', skipAuthForOptions, authenticate, createSession); 
router.put('/sessions/:sessionId', skipAuthForOptions, authenticate, updateSession); 
router.delete('/sessions/:sessionId', skipAuthForOptions, authenticate, deleteSession); 
router.get('/my-bookings', authenticate, getCoachSessionBookings); 
router.post('/public/:sessionId/book', skipAuthForOptions, authenticate, bookSession); 


// ==============================
// Public/Discovery Routes 
// ==============================

router.get('/coaches', getAllCoachProfiles); 
router.get('/followed', authenticate, getFollowedCoaches);

// ---
// ✅ FIX 3: Apply the new logic to your public route
// ---
router.get(
    '/coach/:id', 
    authenticateOptionally, // 1. Tries to log in
    handleOptionalAuthError,  // 2. Catches errors if token is bad
    getPublicCoachProfile     // 3. Runs the controller (with req.user or null)
);

// Follow/Unfollow Routes (These correctly use strict 'authenticate')
router.get('/public/:coachId/follow-status', authenticate, getFollowStatus); 
router.post('/public/:coachId/follow', skipAuthForOptions, authenticate, followCoach);
router.delete('/public/:coachId/follow', skipAuthForOptions, authenticate, unfollowCoach);

// 🔑 NEW: Testimonial Routes (MUST be protected by 'authenticate')
router.get('/public/:coachId/review-eligibility', authenticate, checkReviewEligibility); // 🔑 ADDED
router.post('/public/:coachId/testimonials', skipAuthForOptions, authenticate, addTestimonial); // 🔑 ADDED

module.exports = router;