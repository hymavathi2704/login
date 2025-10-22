// Backend/src/routes/coachProfile.js

const express = require('express');
const router = express.Router();

const { authenticate } = require('../middleware/authMiddleware'); 
const upload = require('../middleware/upload'); 

// Import profile management functions (Profile Update, Picture Upload/Delete, Item Management)
const coachProfileController = require('../controllers/coachProfileController');

// ✅ Import client management functions
const { 
    getBookedClients,
    getFollowedClients
} = require('../controllers/clientManagementController');

// ✅ Import discovery/follow functions from the dedicated Explore Controller
const { 
    getPublicCoachProfile,
    getFollowStatus, 
    followCoach, 
    unfollowCoach,
} = require('../controllers/exploreCoachesController'); 

// 🔑 NEW: Import the testimonial controller functions
const {
    checkReviewEligibility,
    addTestimonial
} = require('../controllers/testimonialController');

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

router.get('/dashboard/overview', authenticate, coachProfileController.getCoachDashboardOverview);

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
// COACH CLIENT MANAGEMENT ROUTES (NEW/FIXED)
// ==============================

// Coach views clients who have booked sessions
router.get('/clients/booked', authenticate, getBookedClients); 

// Coach views clients who follow them
router.get('/clients/followed', authenticate, getFollowedClients); 


// ==============================
// BOOKING & FOLLOWER ROUTES (Internal/Protected)
// ==============================

// Coach views their session bookings
router.get('/my-bookings', authenticate, getCoachSessionBookings); 

// POST /public/:sessionId/book - Client books a session (protected route)
router.post('/public/:sessionId/book', skipAuthForOptions, authenticate, bookSession); 


// ==============================
// Public/Follow Routes (Accessible via /api/coach base path)
// ==============================

// GET Public Coach Profile 
router.get('/public/:id', authenticate, getPublicCoachProfile);

// Follow/Unfollow Routes 
router.get('/public/:coachId/follow-status', authenticate, getFollowStatus); 
router.post('/public/:coachId/follow', skipAuthForOptions, authenticate, followCoach);
router.delete('/public/:coachId/follow', skipAuthForOptions, authenticate, unfollowCoach);

// 🔑 NEW: Check if the logged-in client is eligible to write a review for this coach
router.get('/public/:coachId/review-eligibility', authenticate, checkReviewEligibility);

// 🔑 NEW: Submit a testimonial (Protected by authentication)
router.post('/public/:coachId/testimonials', skipAuthForOptions, authenticate, addTestimonial);

module.exports = router;