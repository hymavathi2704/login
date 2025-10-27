// Backend/src/controllers/testimonialController.js
const { Op } = require('sequelize');
const asyncHandler = require('express-async-handler'); // Make sure this is imported

// Import all necessary models from the central index file
const { User, Testimonial, Session, Booking, CoachProfile } = require('../../models');

// ==============================
// Check Review Eligibility (MODIFIED FOR EDITING)
// Now returns existing testimonial data if found
// ==============================
const checkReviewEligibility = asyncHandler(async (req, res) => {
    const { bookingId } = req.params;
    const userId = req.user.userId;

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
// Add or Update Testimonial (Function Definition Was Missing)
// ==============================
const addTestimonial = asyncHandler(async (req, res) => {
    // Expects coachId (User ID) in params, and review data in body
    const { coachId } = req.params; // Coach's User ID
    const { rating, content, clientTitle, sessionId } = req.body; // sessionId is the Booking ID
    const clientId = req.user.userId; // Client's User ID from authenticated request

    if (!rating || !content || !sessionId) {
        res.status(400); // Bad Request
        throw new Error('Missing required fields: rating, content, sessionId (bookingId).');
    }

    // 1. Find the CoachProfile ID associated with the coach's User ID
    const coachProfile = await CoachProfile.findOne({
        where: { userId: coachId },
        attributes: ['id'] // Only need the ID
    });

    if (!coachProfile) {
        res.status(404); // Not Found
        throw new Error('Coach profile not found.');
    }
    const coachProfileId = coachProfile.id; // This is the foreign key for Testimonial table

    // 2. Verify the booking exists, belongs to the client, is completed, and matches the coach profile
    const booking = await Booking.findOne({
        where: {
            id: sessionId,          // Match the specific booking ID
            clientId: clientId,     // Ensure it belongs to the logged-in client
            status: 'completed',    // Must be completed to review
        },
        include: [{              // Include the Session to verify the coach
            model: Session,
            as: 'Session',
            required: true,      // Make sure the session exists
            where: { coachProfileId: coachProfileId } // Ensure session belongs to the correct coach
        }]
    });

    if (!booking) {
        res.status(403); // Forbidden
        throw new Error('Booking not found, not completed, or does not match the specified coach.');
    }

    // 3. Get client's name for the testimonial
    const clientUser = await User.findByPk(clientId, { attributes: ['firstName', 'lastName'] });
    const clientName = clientUser ? `${clientUser.firstName} ${clientUser.lastName}`.trim() : 'Anonymous';

    // 4. Use findOrCreate to handle both creating and updating based on bookingId uniqueness
    const [testimonial, created] = await Testimonial.findOrCreate({
        where: { bookingId: sessionId }, // Unique constraint based on bookingId
        defaults: {
            coachProfileId: coachProfileId, // FK to coach_profiles table
            clientId: clientId,             // FK to users table (client)
            bookingId: sessionId,           // FK to client_bookings table
            clientName: clientName,
            rating: parseInt(rating, 10),
            content: content,
            clientTitle: clientTitle || null, // Optional field
            isApproved: true,               // Auto-approve, adjust if needed
            date: new Date(),               // Set current date
        }
    });

    // 5. If it wasn't created, it means it already existed, so update it
    if (!created) {
        testimonial.rating = parseInt(rating, 10);
        testimonial.content = content;
        testimonial.clientTitle = clientTitle || null;
        testimonial.clientName = clientName; // Update name in case it changed
        testimonial.date = new Date();       // Update date on edit
        await testimonial.save();
    }

    // 6. Ensure the booking record is marked as reviewed
    if (!booking.isReviewed) {
        booking.isReviewed = true;
        await booking.save();
    }

    // Return the created or updated testimonial
    res.status(created ? 201 : 200).json(testimonial);
});


// ===================================
// Get Client's Review Eligibility for ALL sessions with a Coach
// ===================================
const getClientReviewEligibility = asyncHandler(async (req, res) => {
    const clientId = req.user.userId;
    const { coachId } = req.params; // Coach's USER ID

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

    const coachProfile = await CoachProfile.findOne({ where: { userId: coachId } });
    if (!coachProfile) {
        return res.status(404).json({ error: 'Coach profile not found.' }); // Return JSON error
    }

    const testimonials = await Testimonial.findAll({
        where: {
            coachProfileId: coachProfile.id,
            isApproved: true,
        },
        // Include client details (optional, adjust attributes as needed)
        include: [{
            model: User,
            as: 'client', // Use the alias defined in Testimonial model
            attributes: ['firstName', 'lastName', 'profilePicture'] // Specify fields
        }],
        order: [['date', 'DESC']], // Order by date descending
    });

    res.status(200).json(testimonials);
});

// ==============================
// Delete a Testimonial (by Owner)
// ==============================
const deleteTestimonial = asyncHandler(async (req, res) => {
    const { testimonialId } = req.params; // The ID of the testimonial itself
    const clientId = req.user.userId;     // ID of the logged-in user

    const testimonial = await Testimonial.findByPk(testimonialId);

    if (!testimonial) {
        res.status(404);
        throw new Error('Testimonial not found.');
    }

    // Authorization check: Only the client who wrote it can delete it
    if (testimonial.clientId !== clientId) {
        res.status(403); // Forbidden
        throw new Error('You are not authorized to delete this testimonial.');
    }

    // Find the associated booking to unmark it
    const booking = await Booking.findByPk(testimonial.bookingId);
    if (booking) {
        booking.isReviewed = false; // Allow reviewing again if deleted
        await booking.save();
    }

    // Delete the testimonial
    await testimonial.destroy();

    res.status(200).json({ message: 'Testimonial deleted successfully.' });
});

// ==============================
// Update a Testimonial (by Owner)
// ==============================
// Note: This is similar to addTestimonial's update path but accessed via testimonial ID
const updateTestimonial = asyncHandler(async (req, res) => {
    const { testimonialId } = req.params; // The ID of the testimonial itself
    const { rating, content, clientTitle } = req.body; // New data
    const clientId = req.user.userId;     // ID of the logged-in user

    const testimonial = await Testimonial.findByPk(testimonialId);

    if (!testimonial) {
        res.status(404);
        throw new Error('Testimonial not found.');
    }

    // Authorization check: Only the client who wrote it can update it
    if (testimonial.clientId !== clientId) {
        res.status(403); // Forbidden
        throw new Error('You are not authorized to update this testimonial.');
    }

    // Update the fields (use || to keep existing value if new value is null/undefined)
    testimonial.rating = parseInt(rating, 10) || testimonial.rating;
    testimonial.content = content || testimonial.content;
    testimonial.clientTitle = clientTitle !== undefined ? clientTitle : testimonial.clientTitle; // Handle empty string correctly
    testimonial.date = new Date(); // Update the date to show it was recently edited

    // Get updated client name (in case it changed)
    const clientUser = await User.findByPk(clientId, { attributes: ['firstName', 'lastName'] });
    testimonial.clientName = clientUser ? `${clientUser.firstName} ${clientUser.lastName}`.trim() : 'Anonymous';


    const updatedTestimonial = await testimonial.save();

    res.status(200).json(updatedTestimonial);
});


module.exports = {
    checkReviewEligibility,
    addTestimonial,             // Now defined above
    getClientReviewEligibility,
    getCoachTestimonials,
    deleteTestimonial,
    updateTestimonial
};