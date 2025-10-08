const express = require('express');
const router = express.Router();

const { authenticate } = require('../middleware/authMiddleware'); 
const upload = require('../middleware/upload'); 

const coachProfileController = require('../controllers/coachProfileController');
const sessionController = require('../controllers/sessionController'); 

const { 
    getFollowStatus,    // <-- ADD THIS
    followCoach,        // <-- ADD THIS
    unfollowCoach       // <-- ADD THIS
} = coachProfileController;

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
// Apply skipAuthForOptions to POST/PUT/DELETE
router.put('/profile', skipAuthForOptions, authenticate, coachProfileController.updateCoachProfile);
router.post('/profile/add-item', skipAuthForOptions, authenticate, coachProfileController.addItem);
router.post('/profile/remove-item', skipAuthForOptions, authenticate, coachProfileController.removeItem);
router.post('/profile/upload-picture', skipAuthForOptions, authenticate, upload.single('profilePicture'), coachProfileController.uploadProfilePicture);


// ==============================
// SESSION MANAGEMENT ROUTES (Protected by 'authenticate')
// ==============================

// POST /api/coach/sessions - Create a new session
router.post('/sessions', skipAuthForOptions, authenticate, sessionController.createSession);

// PUT /api/coach/sessions/:sessionId - Update an existing session
router.put('/sessions/:sessionId', skipAuthForOptions, authenticate, sessionController.updateSession);

// DELETE /api/coach/sessions/:sessionId - Delete a session
router.delete('/sessions/:sessionId', skipAuthForOptions, authenticate, sessionController.deleteSession);


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