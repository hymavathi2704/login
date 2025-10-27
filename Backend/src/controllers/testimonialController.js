// Backend/src/controllers/testimonialController.js
const { Op } = require('sequelize');
const { v4: uuidv4 } = require('uuid');

const Testimonial = require('../models/Testimonial');
const Booking = require('../models/Booking'); 
const Session = require('../models/Session'); 
const CoachProfile = require('../models/CoachProfile'); 
const User = require('../models/user'); // 🔑 ADDED: Needed for coachName in eligibility check

/**
 * Checks if the logged-in client is eligible to leave a review for a coach.
 * Returns ALL completed bookings for the client/coach pair, including any existing testimonial.
 */
const checkReviewEligibility = async (req, res) => {
    try {
        const clientId = req.user.id; 
        const coachId = req.params.coachId; // The Coach's User ID
        
        if (!clientId) {
            return res.status(401).json({ message: 'Authentication required.' });
        }
        
        // 1. Get the CoachProfile ID and associate User details
        const coachProfile = await CoachProfile.findOne({ 
            where: { userId: coachId },
            attributes: ['id'],
            include: [{ model: User, as: 'user', attributes: ['firstName', 'lastName'] }]
        });

        if (!coachProfile || !coachProfile.user) {
            return res.status(404).json({ error: 'Coach profile not found.' });
        }
        const coachProfileId = coachProfile.id;
        const coachName = `${coachProfile.user.firstName} ${coachProfile.user.lastName}`;


        // 2. Find ALL completed bookings for this client and coach, and include existing testimonials
        const completedBookings = await Booking.findAll({
            where: {
                clientId,
                status: 'completed', // 🔑 Look for ALL completed sessions
                // Removed isReviewed filter to allow checking/editing reviewed sessions
            },
            // 3. Join with Session model to ensure the booking is for the specified coach
            include: [
                {
                    model: Session,
                    as: 'Session',
                    required: true,
                    attributes: ['id', 'title', 'type', 'coachProfileId'], 
                    where: { coachProfileId: coachProfileId } // Filter by the target coach
                },
                // 🔑 NEW: Join with Testimonial model to see if a review already exists
                {
                    model: Testimonial,
                    as: 'Testimonial', // IMPORTANT: This assumes the association is correct in Sequelize config
                    required: false, // Ensure we get bookings even if no testimonial exists
                    attributes: ['id', 'rating', 'content', 'clientTitle']
                }
            ],
        });
        
        const eligibleSessions = completedBookings
            .map(booking => ({
                id: booking.id, // Booking ID is used as the key
                title: booking.Session.title,
                coachName: coachName,
                coachId: coachId,
                existingReview: booking.Testimonial 
                    ? {
                        id: booking.Testimonial.id,
                        rating: booking.Testimonial.rating,
                        content: booking.Testimonial.content,
                        clientTitle: booking.Testimonial.clientTitle
                      }
                    : null,
            }));

        return res.status(200).json({ eligibleSessions });

    } catch (error) {
        console.error('Error checking review eligibility:', error);
        return res.status(500).json({ message: 'Server error while checking review eligibility.' });
    }
};

/**
 * Submits a new testimonial OR UPDATES an existing one and marks the associated booking as reviewed (if new).
 */
const addTestimonial = async (req, res) => {
    try {
        const clientId = req.user.id;
        const coachId = req.params.coachId; // Not strictly necessary but useful for logging/context
        const { rating, content, clientTitle, sessionId: bookingId } = req.body; 

        if (!rating || !content || !bookingId) {
            return res.status(400).json({ error: 'Missing required fields.' });
        }

        // 1. Verify and retrieve the booking and existing testimonial
        const booking = await Booking.findOne({
            where: {
                id: bookingId,
                clientId,
                status: 'completed',
            },
            include: [{ 
                model: Session, 
                as: 'Session',
                attributes: ['coachProfileId', 'type'] 
            }, {
                model: Testimonial, 
                as: 'Testimonial'
            }] 
        });

        if (!booking || !booking.Session) {
            return res.status(403).json({ error: 'The selected session is not eligible for review.' });
        }
        
        const coachProfileId = booking.Session.coachProfileId;
        const sessionType = booking.Session.type;
        const existingTestimonial = booking.Testimonial;

        const testimonialData = {
            coachProfileId,
            clientId,
            clientTitle: clientTitle || null,
            rating: parseInt(rating),
            content,
            date: new Date().toISOString().split('T')[0], 
            sessionType, 
        };

        // 2. Create or Update the Testimonial entry
        if (existingTestimonial) {
            await existingTestimonial.update(testimonialData);
            
        } else {
            // Create new review and associate it with the booking
            await Testimonial.create({
                id: uuidv4(),
                bookingId: booking.id, // 🔑 NEW: Must link the testimonial to the booking
                ...testimonialData,
            });
            // 3. Mark the Booking as reviewed
            await booking.update({ isReviewed: true });
        }
        
        return res.status(201).json({ message: 'Testimonial submitted successfully!' });

    } catch (error) {
        console.error('Error submitting testimonial:', error);
        return res.status(500).json({ error: 'Failed to submit testimonial. Server error.' });
    }
};

module.exports = {
    checkReviewEligibility,
    addTestimonial,
};