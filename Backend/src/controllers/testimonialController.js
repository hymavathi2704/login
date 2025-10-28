// Backend/src/controllers/testimonialController.js
const { Op } = require('sequelize');
const asyncHandler = require('express-async-handler');

const { User, Testimonial, Session, Booking, CoachProfile } = require('../../models');

// ==============================
// Check Review Eligibility (mapped to checkBookingReviewEligibility)
// ==============================
const checkReviewEligibility = asyncHandler(async (req, res) => {
    const { bookingId } = req.params;
    const userId = req.user.userId;

    if (!bookingId) {
        return res.status(400).json({ error: 'Booking ID is missing.' });
    }

    const booking = await Booking.findOne({
        where: { id: bookingId, clientId: userId }
    });

    if (!booking) {
        return res.status(404).json({ error: 'Booking not found or you are not authorized to access it.' });
    }

    if (booking.status !== 'completed') {
        return res.status(403).json({ error: 'You can only review completed sessions.', eligible: false });
    }

    let existingTestimonial = null;
    if (booking.isReviewed) {
        existingTestimonial = await Testimonial.findOne({
            where: { bookingId: booking.id },
            attributes: ['id', 'rating', 'content', 'clientTitle']
        });
    }

    res.status(200).json({
        eligible: true,
        isReviewed: booking.isReviewed,
        existingTestimonial: existingTestimonial,
        message: booking.isReviewed ? 'Review exists, ready for edit.' : 'Eligible to submit new review.'
    });
});

// ==============================
// Add or Update Testimonial 
// ==============================
const addTestimonial = asyncHandler(async (req, res) => {
    const { coachId } = req.params; 
    const { rating, content, clientTitle, sessionId } = req.body;
    const clientId = req.user.userId; 

    if (!coachId || !rating || !content || !sessionId) { // 🛑 GUARD: Check coachId
        res.status(400); 
        throw new Error('Missing required fields (coachId, rating, content, bookingId).');
    }

    const coachProfile = await CoachProfile.findOne({
        where: { userId: coachId },
        attributes: ['id'] 
    });

    if (!coachProfile) {
        res.status(404);
        throw new Error('Coach profile not found.');
    }
    const coachProfileId = coachProfile.id; 

    // 2. Verify the booking exists, belongs to the client, is completed, and matches the coach profile
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
            where: { coachProfileId: coachProfileId } 
        }]
    });

    if (!booking) {
        res.status(403); 
        throw new Error('Booking not found, not completed, or does not match the specified coach.');
    }

    const clientUser = await User.findByPk(clientId, { attributes: ['firstName', 'lastName'] });
    const clientName = clientUser ? `${clientUser.firstName} ${clientUser.lastName}`.trim() : 'Anonymous';

    const [testimonial, created] = await Testimonial.findOrCreate({
        where: { bookingId: sessionId }, 
        defaults: {
            coachProfileId: coachProfileId, 
            clientId: clientId, 
            bookingId: sessionId, 
            clientName: clientName,
            rating: parseInt(rating, 10),
            content: content,
            clientTitle: clientTitle || null,
            isApproved: true, 
            date: new Date(),
        }
    });

    if (!created) {
        testimonial.rating = parseInt(rating, 10);
        testimonial.content = content;
        testimonial.clientTitle = clientTitle || null;
        testimonial.clientName = clientName; 
        testimonial.date = new Date(); 
        await testimonial.save();
    }

    if (!booking.isReviewed) {
        booking.isReviewed = true;
        await booking.save();
    }

    res.status(created ? 201 : 200).json(testimonial);
});


// ===================================
// Get Client's Review Eligibility for ALL sessions with a Coach (CRASHING FUNCTION)
// ===================================
const getClientReviewEligibility = asyncHandler(async (req, res) => {
    const clientId = req.user.userId;
    const { coachId } = req.params; // Coach's USER ID

    // 🛑 CRITICAL FIX: Add a guard clause here to prevent the Sequelize crash
    if (!coachId) {
        console.error("getClientReviewEligibility called with missing Coach ID.");
        // Return a 400 status with an empty eligibility list instead of crashing
        return res.status(400).json({ eligibleSessions: [], error: 'Coach ID is missing from the request parameters.' });
    }
    // ----------------------------------------------------------------------

    const coachProfile = await CoachProfile.findOne({ where: { userId: coachId } });
    if (!coachProfile) {
        res.status(404);
        throw new Error('Coach profile not found.');
    }
    const coachProfileId = coachProfile.id;

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
                where: { coachProfileId: coachProfileId },
                attributes: ['title']
            }
        ],
        attributes: ['id', 'isReviewed']
    });

    const formattedSessions = eligibleBookings.map(booking => ({
        id: booking.id,
        title: booking.Session.title,
        isReviewed: booking.isReviewed,
        coachId: coachId, // Coach User ID
    }));

    res.status(200).json({ eligibleSessions: formattedSessions });
});

// ==============================
// Get All Approved Testimonials for a Coach
// ==============================
const getCoachTestimonials = asyncHandler(async (req, res) => {
    const { coachId } = req.params; // Coach's USER ID

    // 🛑 GUARD: Check coachId
    if (!coachId) {
        return res.status(400).json({ error: 'Coach ID is missing.' });
    }

    const coachProfile = await CoachProfile.findOne({ where: { userId: coachId } });
    if (!coachProfile) {
        return res.status(404).json({ error: 'Coach profile not found.' });
    }

    const testimonials = await Testimonial.findAll({
        where: {
            coachProfileId: coachProfile.id,
            isApproved: true,
        },
        include: [{
            model: User,
            as: 'client', 
            attributes: ['firstName', 'lastName', 'profilePicture']
        }],
        order: [['date', 'DESC']], 
    });

    res.status(200).json(testimonials);
});

// ==============================
// Delete a Testimonial (by Owner)
// ==============================
const deleteTestimonial = asyncHandler(async (req, res) => {
    const { testimonialId } = req.params;
    const clientId = req.user.userId;

    if (!testimonialId) {
        return res.status(400).json({ error: 'Testimonial ID is missing.' });
    }

    const testimonial = await Testimonial.findByPk(testimonialId);

    if (!testimonial) {
        res.status(404);
        throw new Error('Testimonial not found.');
    }

    if (testimonial.clientId !== clientId) {
        res.status(403); 
        throw new Error('You are not authorized to delete this testimonial.');
    }

    const booking = await Booking.findByPk(testimonial.bookingId);
    if (booking) {
        booking.isReviewed = false;
        await booking.save();
    }

    await testimonial.destroy();

    res.status(200).json({ message: 'Testimonial deleted successfully.' });
});

// ==============================
// Update a Testimonial (by Owner)
// ==============================
const updateTestimonial = asyncHandler(async (req, res) => {
    const { testimonialId } = req.params;
    const { rating, content, clientTitle } = req.body;
    const clientId = req.user.userId;

    if (!testimonialId) {
        return res.status(400).json({ error: 'Testimonial ID is missing.' });
    }

    const testimonial = await Testimonial.findByPk(testimonialId);

    if (!testimonial) {
        res.status(404);
        throw new Error('Testimonial not found.');
    }

    if (testimonial.clientId !== clientId) {
        res.status(403);
        throw new Error('You are not authorized to update this testimonial.');
    }

    testimonial.rating = parseInt(rating, 10) || testimonial.rating;
    testimonial.content = content || testimonial.content;
    testimonial.clientTitle = clientTitle !== undefined ? clientTitle : testimonial.clientTitle;
    testimonial.date = new Date(); 

    const clientUser = await User.findByPk(clientId, { attributes: ['firstName', 'lastName'] });
    testimonial.clientName = clientUser ? `${clientUser.firstName} ${clientUser.lastName}`.trim() : 'Anonymous';


    const updatedTestimonial = await testimonial.save();

    res.status(200).json(updatedTestimonial);
});


module.exports = {
    checkReviewEligibility,
    addTestimonial, 
    getClientReviewEligibility,
    getCoachTestimonials,
    deleteTestimonial,
    updateTestimonial
};