// Backend/src/routes/coachProfile.js

const express = require('express');
const router = express.Router();

// 🔑 MODIFIED: Import the new middleware
const { authenticate, authenticateAllowExpired } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');

// Import profile management functions
const coachProfileController = require('../controllers/coachProfileController');

// Import client management functions
const {
    getBookedClients,
    getFollowedClients
} = require('../controllers/clientManagementController');

// Import discovery/follow functions
const {
    getPublicCoachProfile,
    getFollowStatus,
    followCoach,
    unfollowCoach
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
// (These all use 'authenticate' and remain unchanged)
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


// ==============================
// SESSION MANAGEMENT ROUTES (Protected)
// ==============================
// (These all use 'authenticate' and remain unchanged)
router.post('/sessions', skipAuthForOptions, authenticate, createSession);
router.put('/sessions/:sessionId', skipAuthForOptions, authenticate, updateSession);
router.delete('/sessions/:sessionId', skipAuthForOptions, authenticate, deleteSession);


// ==============================
// COACH CLIENT MANAGEMENT ROUTES (NEW/FIXED)
// ==============================
// (These all use 'authenticate' and remain unchanged)
router.get('/clients/booked', authenticate, getBookedClients);
router.get('/clients/followed', authenticate, getFollowedClients);


// ==============================
// BOOKING & FOLLOWER ROUTES (Internal/Protected)
// ==============================
// (These all use 'authenticate' and remain unchanged)
router.get('/my-bookings', authenticate, getCoachSessionBookings);
router.post('/public/:sessionId/book', skipAuthForOptions, authenticate, bookSession);


// ==============================
// Public/Follow Routes (Accessible via /api/coach base path)
// ==============================
// (These all use 'authenticate' and remain unchanged)
router.get('/public/:id', authenticate, getPublicCoachProfile);
router.get('/public/:coachId/follow-status', authenticate, getFollowStatus);
router.post('/public/:coachId/follow', skipAuthForOptions, authenticate, followCoach);
router.delete('/public/:coachId/follow', skipAuthForOptions, authenticate, unfollowCoach);




module.exports = router;