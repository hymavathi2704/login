// Backend/src/routes/testimonial.js

const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authMiddleware');
const {
    checkReviewEligibility,
    addTestimonial,
    getClientReviewEligibility,
    getCoachTestimonials,
    deleteTestimonial,
    updateTestimonial
} = require('../controllers/testimonialController');

// @desc    Get all testimonials for a specific coach (public)
// @route   GET /api/testimonials/coach/:coachId
// @access  Public
router.get(
    '/coach/:coachId',
    getCoachTestimonials
);

// @desc    Get Client's eligible sessions to review for a coach
// @route   GET /api/testimonials/eligibility/:coachId
// @access  Private (Client)
router.get(
    '/eligibility/:coachId',
    authenticate,
    getClientReviewEligibility
);

// @desc    Check if a client is eligible to review a *specific* booking
// @route   GET /api/testimonials/check-booking/:bookingId
// @access  Private (Client)
router.get(
    '/check-booking/:bookingId', 
    authenticate, 
    checkReviewEligibility
);

// @desc    Add a new testimonial (review) for a booking
// @route   POST /api/testimonials/coach/:coachId
// @access  Private (Client)
// Note: We use :coachId here to match the 'addTestimonial' controller
router.post(
    '/coach/:coachId', 
    authenticate, 
    addTestimonial
);

// @desc    Update a specific testimonial
// @route   PUT /api/testimonials/:testimonialId
// @access  Private (Client who owns it)
router.put(
    '/:testimonialId',
    authenticate,
    updateTestimonial
);

// @desc    Delete a specific testimonial
// @route   DELETE /api/testimonials/:testimonialId
// @access  Private (Client who owns it)
router.delete(
    '/:testimonialId',
    authenticate,
    deleteTestimonial
);

module.exports = router;