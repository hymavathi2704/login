// Backend/src/routes/clientProfile.js

const express = require('express');
const router = express.Router();
const cors = require('cors');

// VITAL CONTROLLERS
const clientProfileController = require('../controllers/clientProfileController'); 
// Removed coachProfileController import as it's no longer needed for client profile picture upload

// VITAL MIDDLEWARE
const { authenticate } = require('../middleware/authMiddleware');  
const uploadMiddleware = require('../middleware/upload'); // Needed for picture upload

// Allow preflight requests for CORS
router.options('*', cors());

// ==============================
// Client Profile Routes
// ===================================

// PUT: Endpoint for updating the client's non-file profile data
router.put(
    '/profile', 
    authenticate, 
    clientProfileController.updateClientProfile
);


// POST: DEDICATED PROFILE PICTURE UPLOAD ROUTE
router.post(
  '/profile/upload-picture', 
  // Keep the critical swapped order: upload first, then authenticate
  uploadMiddleware.single('profilePicture'), 
  authenticate, 
  clientProfileController.uploadProfilePicture // ✅ FIX: Use client-specific upload controller
);

// ✅ NEW: DELETE DEDICATED PROFILE PICTURE ROUTE
router.delete(
  '/profile/picture', 
  authenticate, 
  clientProfileController.deleteProfilePicture 
);


module.exports = router;