
// 🛑 Ensure all these required dependencies are imported
const asyncHandler = require('express-async-handler'); 
const { Op } = require('sequelize'); // Import Op from Sequelize
const { v4: uuidv4 } = require('uuid'); // If you use uuid for other IDs
const { PGCreateOrder } = require('../utils/cashfree'); // Your payment utility
const { Booking, Session, User, CoachProfile } = require('../../models'); // Corrected model path

// 🛑 CRITICAL FIX: The missing helper function
const generateUniqueOrderId = (userId) => {
    // Format: cf_{random_number}_{customer_id}_{currentTimestamp}
    const randomPart = Math.floor(Math.random() * 900) + 100;
    const userPart = userId.slice(0, 4); // Use slice for a compact ID
    return `cf_${randomPart}_${userPart}_${Date.now()}`;
};
// -------------------------------------------------------------------


// ==============================
// Helper: Sanitize & Map Data (UPDATED)
// ==============================
const sanitizeSessionData = (data) => {
    // Frontend is expected to send 'title', 'type', 'duration', and 'price'.
    
    // Ensure price and duration are correctly typed
    const duration = parseInt(data.duration, 10) || 0; // Default to 0 if invalid
    const price = parseFloat(data.price) || 0.0;     // Default to 0.0 if invalid
    
    return {
        // Ensure required fields map correctly
        title: data.title || data.name || 'Untitled Session', 
        
        // This is the "section type" field you asked about.
        type: data.type || 'individual', // Default to 'individual' if missing

        duration: duration, 
        price: price, 
        description: data.description || null,
        
        // Sanitize optional fields
        defaultDate: data.defaultDate || null,
        defaultTime: data.defaultTime || null,
        meetingLink: data.meetingLink || null,
        
        isActive: true, // Default status
    };
};

// ==========================================
// 1. CREATE SESSION
// ==========================================
const createSession = async (req, res) => {
    try {
        const userId = req.user?.userId;
        const data = req.body;

        const coachProfile = await CoachProfile.findOne({ where: { userId } });
        if (!coachProfile) {
            return res.status(404).json({ error: 'Coach profile not found.' });
        }

        const sanitizedData = sanitizeSessionData(data);
        
        const newSession = await Session.create({
            coachProfileId: coachProfile.id,
            ...sanitizedData, // Now contains a valid 'title' field
        });

        return res.status(201).json({ 
            message: 'Session created successfully.',
            session: newSession 
        });

    } catch (error) {
        console.error('Error creating session:', error);
        if (error.name === 'SequelizeValidationError') {
            console.error('Sequelize Validation Errors:', error.errors.map(e => e.message));
        }
        return res.status(500).json({ error: 'Failed to create session' });
    }
};

// ==========================================
// 2. UPDATE SESSION
// ==========================================
const updateSession = async (req, res) => {
    try {
        const userId = req.user?.userId;
        const sessionId = req.params.sessionId;
        const data = req.body;

        const coachProfile = await CoachProfile.findOne({ where: { userId } });
        if (!coachProfile) {
            return res.status(404).json({ error: 'Coach profile not found.' });
        }

        const session = await Session.findOne({ 
            where: { 
                id: sessionId, 
                coachProfileId: coachProfile.id 
            } 
        });

        if (!session) {
            return res.status(404).json({ error: 'Session not found or unauthorized.' });
        }

        const sanitizedData = sanitizeSessionData(data);
        
        await session.update(sanitizedData);

        return res.json({ 
            message: 'Session updated successfully.',
            session 
        });

    } catch (error) {
        console.error('Error updating session:', error);
        return res.status(500).json({ error: 'Failed to update session' });
    }
};


// ==========================================
// 3. DELETE SESSION
// ==========================================
const deleteSession = async (req, res) => {
    try {
        const userId = req.user?.userId;
        const sessionId = req.params.sessionId;

        const coachProfile = await CoachProfile.findOne({ where: { userId } });
        if (!coachProfile) {
            return res.status(404).json({ error: 'Coach profile not found.' });
        }

        const result = await Session.destroy({ 
            where: { 
                id: sessionId, 
                coachProfileId: coachProfile.id 
            } 
        });

        if (result === 0) {
            return res.status(404).json({ error: 'Session not found or unauthorized.' });
        }

        return res.json({ message: 'Session deleted successfully.' });

    } catch (error) {
        console.error('Error deleting session:', error);
        return res.status(500).json({ error: 'Failed to delete session' });
    }
};



// ==========================================
// 4. BOOK SESSION (Payment Initiation Logic)
// ==========================================
const bookSession = asyncHandler(async (req, res) => {
    const clientId = req.user.userId;
    const { sessionId } = req.params;

    // 1. Fetch Session and Coach Details
    const session = await Session.findByPk(sessionId, {
        include: [{ 
            model: CoachProfile, 
            as: 'coachProfile', 
            include: [{ model: User, as: 'user' }] 
        }] 
    });

    if (!session) {
        return res.status(404).json({ error: 'Session not found.' });
    }

    const amount = parseFloat(session.price);
    
    // --- Anti-Duplication Check ---
    const existingBooking = await Booking.findOne({ 
        where: { 
            clientId, 
            sessionId, 
            status: { [Op.in]: ['confirmed', 'payment_success', 'order_created'] } 
        } 
    });

    if (existingBooking) {
        if (existingBooking.status === 'order_created' && existingBooking.paymentSessionId) {
             return res.status(200).json({ 
                message: 'Existing payment order found. Resuming checkout.',
                payment_session_id: existingBooking.paymentSessionId,
                order_id: existingBooking.paymentOrderId
            });
        }
        return res.status(400).json({ 
            error: 'You have already purchased or booked this session.' 
        });
    }

    // --- Payment Initiation Flow ---

    const orderId = generateUniqueOrderId(clientId);
    const frontendBaseUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const confirmationPath = "/booking-confirmed";
    const returnUrl = `${frontendBaseUrl}${confirmationPath}`;


    // 🛑 CRITICAL FIX: Safely access coachUser using optional chaining
    // This resolves the "Cannot read properties of undefined (reading 'user')" error
    const coachUser = session.coachProfile?.user;
    
    // Default values if coach profile data is inconsistent
    const coachFirstName = coachUser?.firstName || 'Unknown Coach';


    // 1. Handle Free Sessions
    if (amount === 0) {
        const booking = await Booking.create({ clientId, sessionId, status: 'confirmed' });
        return res.status(201).json({ message: 'Session booked successfully.', booking });
    }

    // 2. Create initial Booking Entry (for paid sessions)
    let booking = await Booking.create({
        clientId: clientId,
        sessionId: sessionId,
        status: 'order_initiated',
        paymentOrderId: orderId,
    });


    // 3. Prepare data for Cashfree
    const pgRequest = {
        order_id: orderId,
        order_amount: amount,
        order_currency: "INR", 
        customer_details: {
            customer_id: clientId,
            customer_email: req.user.email,
            customer_phone: req.user.phone || "9999999999" 
        },
        order_meta: {
            return_url: `${returnUrl}?order_id={order_id}` 
        },
        // Safely use the retrieved or default name
        order_note: `Session: ${session.title} with Coach ${coachFirstName}`
    };


    // 4. Call Cashfree PGCreateOrder
    const pgResponse = await PGCreateOrder(pgRequest);

    if (!pgResponse.success) {
        await booking.update({ status: 'order_creation_failed' });
        return res.status(500).json({ 
            message: 'Server failed to initiate payment session.', 
            error: pgResponse.error 
        });
    }

    // 5. Update Booking with Cashfree Session ID and Status
    await booking.update({
        status: 'order_created',
        paymentSessionId: pgResponse.paymentSessionId
    });

    // 6. Return the paymentSessionId to the frontend
    return res.status(200).json({
        message: 'Payment session initiated.',
        payment_session_id: pgResponse.paymentSessionId,
        order_id: orderId
    });
});
// ... (rest of the file remains the same) ...

// ==========================================
// 5. GET COACH SESSION BOOKINGS (FIXED)
// ==========================================
const getCoachSessionBookings = async (req, res) => {
    try {
        const coachId = req.user.userId;
        
        const coachProfile = await CoachProfile.findOne({ where: { userId: coachId } });
        if (!coachProfile) {
             return res.status(404).json({ error: 'Coach profile not found.' });
        }
        const coachProfileId = coachProfile.id;

        const bookings = await Booking.findAll({
            where: { 
                sessionId: { [Op.ne]: null } // Only look for Session bookings
            },
            include: [
                {
                    model: Session,
                    as: 'Session', // 🚨 CRITICAL FIX: Use the 'Session' alias matching server.js
                    required: true,
                    where: { coachProfileId: coachProfileId }, // Filter by this coach's sessions
                    attributes: ['id', 'title', 'duration', 'price', 'type', 'defaultDate', 'defaultTime', 'meetingLink'],
                },
                {
                    model: User,
                    as: 'client', // Alias for the client user
                    attributes: ['id', 'firstName', 'lastName', 'email', 'profilePicture']
                }
            ],
            order: [['bookedAt', 'DESC']]
        });
        
        return res.json(bookings);

    } catch (error) {
        console.error("Coach Session Bookings Error:", error);
        return res.status(500).json({ error: 'Failed to fetch coach session bookings.' });
    }
};

module.exports = {
    createSession,
    updateSession,
    deleteSession,
    bookSession,
    getCoachSessionBookings // <-- EXPORTED
};