// Backend/src/routes/fetchCoachProfiles.js

const express = require('express');
const router = express.Router();

// ✅ FIX 1: Import the new 'authenticateOptionally' middleware
const { authenticate, authenticateOptionally } = require('../middleware/authMiddleware'); 
const upload = require('../middleware/upload'); 

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
    checkReviewEligibility, 
    addTestimonial,
    getClientReviewEligibility, // 🔑 CRITICAL FIX: Must import the correct eligibility function
} = require('../controllers/testimonialController');

// Helper for CORS
const skipAuthForOptions = (req, res, next) => {
    if (req.method === 'OPTIONS') {
        return res.status(200).end(); 
    }
    next();
};

// ... (handleOptionalAuthError middleware remains the same) ...
const handleOptionalAuthError = (err, req, res, next) => {
    if (err.name === 'UnauthorizedError') {
        req.user = null; 
        next(); 
    } else {
        next(err);
    }
};


// ==============================
// Logged-in Coach Profile Management Routes (Protected)
// ==============================
router.get('/profile', authenticate, coachProfileController.getCoachProfile); 
router.put('/profile', skipAuthForOptions, authenticate, upload.single('profilePicture'), coachProfileController.updateCoachProfile);
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

router.get(
    '/coach/:id', 
    authenticateOptionally, 
    handleOptionalAuthError,  
    getPublicCoachProfile    
);

// Follow/Unfollow Routes (These correctly use strict 'authenticate')
router.get('/public/:coachId/follow-status', authenticate, getFollowStatus); 
router.post('/public/:coachId/follow', skipAuthForOptions, authenticate, followCoach);
router.delete('/public/:coachId/follow', skipAuthForOptions, authenticate, unfollowCoach);

// 🔑 CRITICAL FIX: Map the coachId route to the correct controller function
// This function expects the COACH ID, which the route provides.
router.get('/public/:coachId/review-eligibility', authenticate, getClientReviewEligibility); 
router.post('/public/:coachId/testimonials', skipAuthForOptions, authenticate, addTestimonial);

module.exports = router;