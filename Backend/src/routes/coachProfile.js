// Backend/src/routes/coachProfile.js

const express = require('express');
const router = express.Router();

// 🔑 MODIFIED: Import all three middleware functions
const { 
    authenticate, 
    authenticateAllowExpired, 
    authenticateOptionally // Keep this in case you need it elsewhere
} = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');

// Import controllers...
const coachProfileController = require('../controllers/coachProfileController');
const {
    getBookedClients,
    getFollowedClients
} = require('../controllers/clientManagementController');
const {
    getPublicCoachProfile,
    getFollowStatus,
    followCoach,
    unfollowCoach
} = require('../controllers/exploreCoachesController');
const {
    checkReviewEligibility,
    addTestimonial
} = require('../controllers/testimonialController');
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
// All other routes (unchanged)
// ==============================

// ... (routes for /profile, /dashboard/overview, /sessions, etc. remain the same) ...

router.get('/profile', authenticate, coachProfileController.getCoachProfile);
router.get('/dashboard/overview', authenticate, coachProfileController.getCoachDashboardOverview);
router.put(
    '/profile',
    skipAuthForOptions,
    authenticate,
    upload.single('profilePicture'),
    coachProfileController.updateCoachProfile
);
router.post(
    '/profile/upload-picture',
    skipAuthForOptions,
    authenticate,
    upload.single('profilePicture'),
    coachProfileController.uploadProfilePicture
);
router.delete('/profile/picture', authenticate, coachProfileController.deleteProfilePicture);
router.post('/profile/add-item', skipAuthForOptions, authenticate, coachProfileController.addProfileItem);
router.post('/profile/remove-item', skipAuthForOptions, authenticate, coachProfileController.removeProfileItem);
router.post('/sessions', skipAuthForOptions, authenticate, createSession);
router.put('/sessions/:sessionId', skipAuthForOptions, authenticate, updateSession);
router.delete('/sessions/:sessionId', skipAuthForOptions, authenticate, deleteSession);
router.get('/clients/booked', authenticate, getBookedClients);
router.get('/clients/followed', authenticate, getFollowedClients);
router.get('/my-bookings', authenticate, getCoachSessionBookings);
router.post('/public/:sessionId/book', skipAuthForOptions, authenticate, bookSession);
router.get('/public/:id', authenticate, getPublicCoachProfile);
router.get('/public/:coachId/follow-status', authenticate, getFollowStatus);
router.post('/public/:coachId/follow', skipAuthForOptions, authenticate, followCoach);
router.delete('/public/:coachId/follow', skipAuthForOptions, authenticate, unfollowCoach);


// ==============================
// Public Review Routes (FIXED)
// ==============================

// 🔑 FIX: Use new middleware here too
// This allows the eligibility check to pass with an expired token
router.get(
    '/public/:coachId/review-eligibility', 
    authenticateAllowExpired, // 👈 APPLY THE FIX HERE
    checkReviewEligibility
);

// 🔑 This route is already correct
// This allows the submission to pass with an expired token
router.post(
    '/public/:coachId/testimonials', 
    skipAuthForOptions, 
    authenticateAllowExpired, 
    addTestimonial
);

module.exports = router;