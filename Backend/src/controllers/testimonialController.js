// Backend/src/controllers/testimonialController.js
const { Op } = require('sequelize');
const Testimonial = require('../models/Testimonial');
const Session = require('../models/Session');
// 🔑 ASSUMPTION: You must have a Booking model with fields like: 
// { clientId, coachProfileId, sessionId, status: 'completed', isReviewed: false }
const Booking = require('../models/Booking'); 

/**
 * Checks if the logged-in client is eligible to leave a review for a coach.
 * Eligibility: Client must have a 'completed' booking with the coach that has NOT been reviewed yet.
 * * @param {object} req - Express request object. Requires req.user.id (clientId) and req.params.coachId.
 * @param {object} res - Express response object.
 */
const checkReviewEligibility = async (req, res) => {
    try {
        // Assuming authMiddleware sets req.user.id
        const clientId = req.user.id; 
        const coachProfileId = req.params.coachId;

        if (!clientId || !coachProfileId) {
            return res.status(400).json({ message: 'Missing client or coach ID.' });
        }

        // 1. Find all completed sessions booked by this client with this coach that have NOT been reviewed.
        const eligibleBookings = await Booking.findAll({
            where: {
                clientId,
                coachProfileId,
                status: 'completed', // Only show sessions marked as completed
                isReviewed: { [Op.not]: true } // Only show sessions that have NOT been reviewed
            },
            // Join with Session model to get the title for the frontend select list
            include: [{
                model: Session,
                attributes: ['id', 'title'],
            }],
        });
        
        // Map the bookings to a list of eligible sessions for the frontend
        const eligibleSessions = eligibleBookings
            .filter(booking => booking.Session) // Ensure the session data was joined
            .map(booking => ({
                id: booking.id, // 🔑 IMPORTANT: We pass the Booking ID to the frontend to mark it as reviewed later
                title: `${booking.Session.title} (Booking ID: ${booking.id.substring(0, 8)}...)`,
            }));

        return res.status(200).json({ eligibleSessions });

    } catch (error) {
        console.error('Error checking review eligibility:', error);
        return res.status(500).json({ message: 'Server error while checking review eligibility.' });
    }
};

/**
 * Submits a new testimonial.
 * * @param {object} req - Express request object. Requires req.user.id (clientId), req.params.coachId, and body { rating, content, clientTitle, sessionId (which is actually Booking ID) }.
 * @param {object} res - Express response object.
 */
const addTestimonial = async (req, res) => {
    // Ideally wrapped in a transaction
    try {
        const clientId = req.user.id;
        const coachProfileId = req.params.coachId;
        // 🔑 NOTE: The sessionId here is actually the Booking ID passed from the frontend
        const { rating, content, clientTitle, sessionId: bookingId } = req.body; 

        if (!rating || !content || !bookingId || !coachProfileId || !clientId) {
            return res.status(400).json({ message: 'Missing required fields: rating, content, or session selection.' });
        }

        // 1. Verify the booking is eligible (completed and not reviewed)
        const booking = await Booking.findOne({
            where: {
                id: bookingId,
                clientId,
                coachProfileId,
                status: 'completed',
                isReviewed: { [Op.not]: true }
            },
            // Eager load the Session to get the type and the Testimonial model's foreign key
            include: [{ model: Session, attributes: ['type'] }] 
        });

        if (!booking || !booking.Session) {
            return res.status(403).json({ message: 'Session is not eligible for review (not found, not completed, or already reviewed).' });
        }
        
        // 2. Create the Testimonial entry
        await Testimonial.create({
            coachProfileId,
            clientId,
            clientTitle,
            rating: parseInt(rating),
            content,
            date: new Date(), 
            // Get the sessionType from the associated Session model
            sessionType: booking.Session.type, 
        });

        // 3. Mark the Booking as reviewed
        await booking.update({ isReviewed: true });
        
        return res.status(201).json({ message: 'Testimonial submitted successfully and session marked as reviewed.' });

    } catch (error) {
        console.error('Error submitting testimonial:', error);
        return res.status(500).json({ message: 'Server error while submitting testimonial.' });
    }
};

module.exports = {
    checkReviewEligibility,
    addTestimonial,
};