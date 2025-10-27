// Backend/src/controllers/testimonialController.js
const { Op } = require('sequelize');
const asyncHandler = require('express-async-handler'); // <-- ADDED

// 🔑 THE FIX: Import all models from the central 'models/index.js'
// This ensures all model associations (like 'as: Session') are loaded.
const { User, Testimonial, Session, Booking, CoachProfile } = require('../../models');


/**
 * Checks if the logged-in client is eligible to leave a review for a coach.
 * Returns ALL completed bookings for the client/coach pair, including any existing testimonial.
 */
// ==============================
// Check Review Eligibility (FIXED)
// ==============================
// 🔑 WRAPPED WITH ASYNC HANDLER
const checkReviewEligibility = asyncHandler(async (req, res) => {
    const { bookingId } = req.params;
    const userId = req.user.userId;

    // 1. Find the booking by its ID and the client ID (to ensure ownership)
    const booking = await Booking.findOne({
        where: { id: bookingId, clientId: userId }
    });

    // 2. Check if booking exists
    if (!booking) {
        return res.status(404).json({ error: 'Booking not found or you are not authorized to review it.' });
    }

    // 3. Check if the booking status is 'completed'
    if (booking.status !== 'completed') {
        return res.status(403).json({ error: 'You can only review completed sessions.' });
    }

    // 4. Check the 'isReviewed' flag (This is the correct logic)
    if (booking.isReviewed) {
        return res.status(403).json({ error: 'A review has already been submitted for this booking.' });
    }

    // 5. If all checks pass, the client is eligible
    res.status(200).json({ eligible: true, message: 'You are eligible to review this booking.' });
});

/**
 * Submits a new testimonial OR UPDATES an existing one and marks the associated booking as reviewed (if new).
 */
// 🔑 WRAPPED WITH ASYNC HANDLER
const addTestimonial = asyncHandler(async (req, res) => {
    const { coachId } = req.params; // This is Coach User ID
    const { rating, content, clientTitle, sessionId } = req.body; // sessionId is Booking ID

    if (!req.user) {
        return res.status(401).json({ error: 'Authentication required.' });
    }
    const clientId = req.user.userId;

    // 🔑 PROACTIVE FIX: We need the CoachProfile ID from the Coach User ID
    const coachProfile = await CoachProfile.findOne({
        where: { userId: coachId },
        attributes: ['id']
    });

    if (!coachProfile) {
        return res.status(404).json({ error: 'Coach not found.' });
    }
    const coachProfileId = coachProfile.id; // This is the correct CoachProfile ID

    // 2. Find the specific booking (session) to link the review to
    const booking = await Booking.findOne({
        where: {
            id: sessionId,
            clientId: clientId,
            status: 'completed',
        },
        include: [{
            model: Session,
            as: 'Session',
            required: true, 
            // 🔑 FIX: Compare Session.coachProfileId with the correct coachProfileId
            where: { coachProfileId: coachProfileId } 
        }]
    });

    if (!booking) {
        return res.status(403).json({ error: 'You are not eligible to review this session. It must be a completed session with this coach.' });
    }

    // 3. Find the client's user details
    const clientUser = await User.findByPk(clientId, { attributes: ['firstName', 'lastName'] });
    const clientName = clientUser ? `${clientUser.firstName} ${clientUser.lastName}` : 'Anonymous';


    // 4. Create or Update the Testimonial
    // 🔑 FIX: Changed upsert to findOrCreate/update to handle associations better
    // We search for an existing testimonial linked to THIS booking
    let testimonial = await Testimonial.findOne({
        where: { bookingId: sessionId }
    });

    const testimonialData = {
        coachProfileId: coachProfileId, // This is the CoachProfile ID
        clientId: clientId, // Client User ID
        bookingId: sessionId, // Link to the booking
        clientName: clientName, // Add the client's name
        rating: parseInt(rating, 10),
        content: content,
        clientTitle: clientTitle || null,
        isApproved: true, // Auto-approve for now
        date: new Date(),
    };
    
    let created = false;
    if (testimonial) {
        // Update existing
        await testimonial.update(testimonialData);
    } else {
        // Create new
        testimonial = await Testimonial.create(testimonialData);
        created = true;
    }


    // 5. Mark the booking as reviewed
    if (booking) {
        booking.isReviewed = true;
        await booking.save();
    }

    res.status(created ? 201 : 200).json(testimonial);
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