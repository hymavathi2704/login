// Backend/src/routes/clientProfile.js

const express = require('express');
const router = express.Router();
const cors = require('cors');

// VITAL CONTROLLERS
const clientProfileController = require('../controllers/clientProfileController'); 
// Assuming coachProfileController has a generic upload function we can reuse
const coachProfileController = require('../controllers/coachProfileController'); 

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
  authenticate, 
  uploadMiddleware.single('profilePicture'), 
  coachProfileController.uploadProfilePicture // Reuses the logic that saves to 'uploads' and updates User.profilePicture
);
// ...

module.exports = router;