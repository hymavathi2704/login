// Backend/src/controllers/testimonialController.js
const { Op } = require('sequelize');
const asyncHandler = require('express-async-handler'); // <-- ADDED

// 🔑 THE FIX: Import all models from the central 'models/index.js'
// This ensures all model associations (like 'as: Session') are loaded.
const { User, Testimonial, Session, Booking, CoachProfile } = require('../../models');


// ==============================
// Check Review Eligibility (MODIFIED FOR EDITING)
// Now returns existing testimonial data if found
// ==============================
const checkReviewEligibility = asyncHandler(async (req, res) => {
    const { bookingId } = req.params;
    const userId = req.user.userId;

    // 1. Find the booking by its ID and the client ID (to ensure ownership)
    const booking = await Booking.findOne({
        where: { id: bookingId, clientId: userId }
    });

    // 2. Check if booking exists
    if (!booking) {
        // Use 404 for not found
        return res.status(404).json({ error: 'Booking not found or you are not authorized to access it.' });
    }

    // 3. Check if the booking status is 'completed'
    if (booking.status !== 'completed') {
        // Use 403 for forbidden action (reviewing non-completed session)
        return res.status(403).json({ error: 'You can only review completed sessions.', eligible: false });
    }

    // 4. Check if reviewed and fetch existing data if it is
    let existingTestimonial = null;
    if (booking.isReviewed) {
        existingTestimonial = await Testimonial.findOne({
            where: { bookingId: booking.id },
            // Select only the fields needed by the frontend modal
            attributes: ['id', 'rating', 'content', 'clientTitle']
        });
        // Note: It's possible isReviewed is true but the testimonial was somehow deleted.
        // The frontend modal should handle existingTestimonial being null even if isReviewed was true.
    }

    // 5. If booking is completed, always return eligible: true (to allow opening modal)
    // Include existing testimonial data if found.
    res.status(200).json({
        eligible: true, // Eligible to *open the modal*
        isReviewed: booking.isReviewed, // Let frontend know if it's an edit
        existingTestimonial: existingTestimonial, // Send existing data or null
        message: booking.isReviewed ? 'Review exists, ready for edit.' : 'Eligible to submit new review.'
    });
});

// ===================================
// Get Client's Review Eligibility for a Coach (MOVED & FIXED)
// ===================================
const getClientReviewEligibility = asyncHandler(async (req, res) => {
    const clientId = req.user.userId;
    const { coachId } = req.params; // This is the coach's USER ID

    // 1. Find the coach's profile ID from their USER ID
    const coachProfile = await CoachProfile.findOne({ where: { userId: coachId } });
    if (!coachProfile) {
        res.status(404);
        throw new Error('Coach profile not found.');
    }
    const coachProfileId = coachProfile.id;

    // 2. Find all 'completed' bookings this client had with this coach
    const eligibleBookings = await Booking.findAll({
        where: {
            clientId: clientId,
            status: 'completed',
        },
        include: [
            {
                model: Session,
                as: 'Session',
                required: true,
                where: { coachProfileId: coachProfileId }, // Filter by coach's PROFILE ID
                attributes: ['title']
            }
        ],
        // 🔑 FIX: Just get the attributes we need.
        attributes: ['id', 'isReviewed'] 
    });

    // 3. Format the response for the frontend modal
    const formattedSessions = eligibleBookings.map(booking => ({
        id: booking.id,
        title: booking.Session.title,
        isReviewed: booking.isReviewed,
        coachId: coachId, // Pass back the coach's USER ID
    }));

    res.status(200).json({ eligibleSessions: formattedSessions });
});

// ==============================
// Get All Testimonials for a Coach
// ==============================
const getCoachTestimonials = asyncHandler(async (req, res) => {
    const { coachId } = req.params; // This is the coach's USER ID

    // 1. Find the coach's profile ID from their USER ID
    const coachProfile = await CoachProfile.findOne({ where: { userId: coachId } });
    if (!coachProfile) {
        return res.status(404).json({ error: 'Coach profile not found.' });
    }

    // 2. Find all testimonials linked to that CoachProfile ID
    const testimonials = await Testimonial.findAll({
        where: {
            coachProfileId: coachProfile.id,
            isApproved: true, // Only show approved testimonials
        },
        order: [['date', 'DESC']],
    });

    res.status(200).json(testimonials);
});

// ==============================
// Delete a Testimonial
// ==============================
const deleteTestimonial = asyncHandler(async (req, res) => {
    const { testimonialId } = req.params;
    const clientId = req.user.userId;

    const testimonial = await Testimonial.findByPk(testimonialId);

    if (!testimonial) {
        return res.status(404).json({ error: 'Testimonial not found.' });
    }

    // Check if the logged-in user is the one who wrote it
    if (testimonial.clientId !== clientId) {
        return res.status(403).json({ error: 'You are not authorized to delete this testimonial.' });
    }

    // Also, un-mark the booking as reviewed
    const booking = await Booking.findByPk(testimonial.bookingId);
    if (booking) {
        booking.isReviewed = false;
        await booking.save();
    }

    await testimonial.destroy();

    res.status(200).json({ message: 'Testimonial deleted successfully.' });
});

// ==============================
// Update a Testimonial (Admin/Owner)
// ==============================
const updateTestimonial = asyncHandler(async (req, res) => {
    const { testimonialId } = req.params;
    const { rating, content, clientTitle } = req.body;
    const clientId = req.user.userId;

    const testimonial = await Testimonial.findByPk(testimonialId);

    if (!testimonial) {
        return res.status(404).json({ error: 'Testimonial not found.' });
    }

    // Check if the logged-in user is the one who wrote it
    if (testimonial.clientId !== clientId) {
        return res.status(403).json({ error: 'You are not authorized to update this testimonial.' });
    }

    // Update fields
    testimonial.rating = rating ?? testimonial.rating;
    testimonial.content = content ?? testimonial.content;
    testimonial.clientTitle = clientTitle ?? testimonial.clientTitle;
    testimonial.date = new Date(); // Update the date to reflect the edit

    const updatedTestimonial = await testimonial.save();

    res.status(200).json(updatedTestimonial);
});


module.exports = {
    checkReviewEligibility,
    addTestimonial,
    getClientReviewEligibility, // <-- ADDED
    getCoachTestimonials,       // <-- ADDED BACK
    deleteTestimonial,          // <-- ADDED BACK
    updateTestimonial           // <-- ADDED BACK
};