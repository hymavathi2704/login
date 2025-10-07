const express = require('express');
const router = express.Router();

// 1. IMPORT THE CORRECT AUTHENTICATION MIDDLEWARE
const { authenticate } = require('../middleware/authMiddleware'); 

// 🚨 FIX: Import the upload middleware DIRECTLY, not destructured.
// It is assumed that '../middleware/upload' exports the Multer instance itself.
const upload = require('../middleware/upload'); 

// 2. IMPORT THE NECESSARY CONTROLLERS
const coachProfileController = require('../controllers/coachProfileController');
const sessionController = require('../controllers/sessionController'); 

// ==============================
// Logged-in coach profile routes
// ==============================
router.get('/profile', authenticate, coachProfileController.getCoachProfile);
router.put('/profile', authenticate, coachProfileController.updateCoachProfile);
router.post('/profile/add-item', authenticate, coachProfileController.addItem);
router.post('/profile/remove-item', authenticate, coachProfileController.removeItem);
// This line now correctly uses the imported 'upload' instance:
router.post('/profile/upload-picture', authenticate, upload.single('profilePicture'), coachProfileController.uploadProfilePicture);


// ==============================
// SESSION MANAGEMENT ROUTES (Protected by 'authenticate')
// ==============================

// POST /api/coach/sessions - Create a new session
router.post('/sessions', authenticate, sessionController.createSession);

// PUT /api/coach/sessions/:sessionId - Update an existing session
router.put('/sessions/:sessionId', authenticate, sessionController.updateSession);

// DELETE /api/coach/sessions/:sessionId - Delete a session
router.delete('/sessions/:sessionId', authenticate, sessionController.deleteSession);


// ==============================
// Public coach profile (No authentication required)
// ==============================
router.get('/public/:id', coachProfileController.getPublicCoachProfile);

module.exports = router;