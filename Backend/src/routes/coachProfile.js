const express = require('express');
const router = express.Router();

const { authenticate } = require('../middleware/authMiddleware'); 
const upload = require('../middleware/upload'); 

const coachProfileController = require('../controllers/coachProfileController');
const sessionController = require('../controllers/sessionController'); 

const { 
    getFollowStatus,    
    followCoach,        
    unfollowCoach,
    // 🚨 FIX: Import getClientsWhoFollow to be defined
    getClientsWhoFollow 
} = coachProfileController;

// 🚨 FIX: Import all necessary functions from sessionController
const {
    createSession,
    updateSession,
    deleteSession,
    bookSession,
    getCoachSessionBookings // <--- NEW CRITICAL IMPORT // <--- CRITICAL FIX: Ensure this is imported
} = sessionController;


// 🚨 FIX: Middleware to skip the 'authenticate' middleware for OPTIONS requests
const skipAuthForOptions = (req, res, next) => {
    if (req.method === 'OPTIONS') {
        // Respond with 200/204 to allow the browser to proceed with the actual request
        // Since global CORS is handled in server.js, a simple end() is often sufficient.
        return res.status(200).end(); 
    }
    next();
};


// ==============================
// Logged-in coach profile routes
// ==============================
router.get('/profile', authenticate, coachProfileController.getCoachProfile);

// ✅ FIX 1: ADDED 'upload.single' to the main PUT /profile route
router.put(
    '/profile', 
    skipAuthForOptions, 
    authenticate, 
    upload.single('profilePicture'), // <--- ADDED: Handle file upload for profile picture
    coachProfileController.updateCoachProfile
);

router.post('/profile/add-item', skipAuthForOptions, authenticate, coachProfileController.addItem);
router.post('/profile/remove-item', skipAuthForOptions, authenticate, coachProfileController.removeItem);

// ✅ FIX 2: Corrected middleware order for dedicated upload route (if used)
router.post(
    '/profile/upload-picture', 
    skipAuthForOptions, 
    authenticate, 
    upload.single('profilePicture'), 
    coachProfileController.uploadProfilePicture
);


// ==============================
// SESSION MANAGEMENT ROUTES (Protected by 'authenticate')
// ==============================

// POST /api/coach/sessions - Create a new session
router.post('/sessions', skipAuthForOptions, authenticate, createSession); // uses createSession

// PUT /api/coach/sessions/:sessionId - Update an existing session
router.put('/sessions/:sessionId', skipAuthForOptions, authenticate, updateSession); // uses updateSession

// DELETE /api/coach/sessions/:sessionId - Delete a session
router.delete('/sessions/:sessionId', skipAuthForOptions, authenticate, deleteSession); // uses deleteSession


// ==============================
// SESSION BOOKING ROUTE (NEW)
// ==============================

// POST /api/coach/public/:sessionId/book - Client books a session (protected route)
router.post('/public/:sessionId/book', skipAuthForOptions, authenticate, bookSession); // <--- NOW DEFINED

// ==============================
// COACH SESSION BOOKING RETRIEVAL (NEW)
// ==============================

// GET /api/coach/my-bookings - Coach views their session bookings
router.get('/my-bookings', authenticate, getCoachSessionBookings); // <--- NEW ROUTE

// GET /api/coach/clients-who-follow - Get clients who have followed this coach (NEW)
router.get('/clients-who-follow', authenticate, getClientsWhoFollow); // <--- NOW DEFINED

// ==============================
// Public coach profile (No authentication required)
// ==============================
router.get('/public/:id', coachProfileController.getPublicCoachProfile);

// ==============================
// NEW: Follow/Unfollow Routes (Requires client authentication)
// The coachId is the :id parameter.
// ==============================
router.get('/public/:coachId/follow-status', authenticate, getFollowStatus); 
router.post('/public/:coachId/follow', skipAuthForOptions, authenticate, followCoach);
router.delete('/public/:coachId/follow', skipAuthForOptions, authenticate, unfollowCoach);

module.exports = router;