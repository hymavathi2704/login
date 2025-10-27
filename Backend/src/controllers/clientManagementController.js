// Backend/src/controllers/clientManagementController.js

import { Op } from 'sequelize'; 
// --- Model Imports ---
// Add this at the top
import db from '../../models/index.js';

// Then destructure the models you need from 'db'
const { User, Follow, Booking, ClientProfile, Session, CoachProfile } = db;
// === Helper: Calculate Age ===
const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return 'N/A';
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
};

// === Helper: Format Date ===
const formatDate = (date) => {
    if (!date) return 'N/A';
    // Simple formatting: MMM DD, YYYY
    return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

// ==============================
// GET Booked Clients (FIXED SQL QUERY)
// ==============================
export const getBookedClients = async (req, res) => {
    try {
        const coachId = req.user.userId; 

        // [2] FIX: Get the coachProfileId associated with the User ID
        const coachProfile = await CoachProfile.findOne({ 
            where: { userId: coachId },
            attributes: ['id']
        });

        if (!coachProfile) {
            return res.status(404).json({ error: 'Coach profile not found.' });
        }
        const coachProfileId = coachProfile.id; // <-- The correct ID to filter on

        // 3. Find all Booking records that link to a Session created by the coach
        const allBookings = await Booking.findAll({
            attributes: ['clientId'], 
            include: [{
                model: Session, 
                as: 'Session', 
                required: true,
                attributes: [], 
                // [3] CRITICAL FIX: Use the correct column name and ID
                where: { coachProfileId: coachProfileId } 
            }]
        });

        if (allBookings.length === 0) {
            return res.status(200).json({ clients: [] });
        }
        
        // ... (rest of the logic remains unchanged)
        const sessionsCountMap = allBookings.reduce((acc, booking) => {
            acc[booking.clientId] = (acc[booking.clientId] || 0) + 1;
            return acc;
        }, {});
        const bookedClientIds = Object.keys(sessionsCountMap);
        
        const clients = await User.findAll({
            where: { 
                id: { [Op.in]: bookedClientIds },
                roles: { [Op.like]: '%"client"%' } 
            },
            attributes: ['id', 'firstName', 'lastName', 'email', 'profilePicture', 'roles'],
        });

        const processedClients = clients.map(client => {
            const plainClient = client.get({ plain: true });
            
            return {
                id: plainClient.id,
                name: `${plainClient.firstName} ${plainClient.lastName}`,
                profilePicture: plainClient.profilePicture || '/default-avatar.png', 
                email: plainClient.email,
                sessionsBookedTillNow: sessionsCountMap[plainClient.id] || 0,
            };
        });

        return res.status(200).json({ clients: processedClients });

    } catch (error) {
        console.error('Error fetching booked clients:', error);
        return res.status(500).json({ error: 'Failed to fetch booked clients.' });
    }
};

// ==============================
// GET Followed Clients
// Includes: profile pic, name, age, mail, following since date
// ==============================
export const getFollowedClients = async (req, res) => {
    try {
        const coachId = req.user.userId; 

        // 1. Find all Follow records where the current coach is the 'followingId'
        const followerRecords = await Follow.findAll({
            where: { followingId: coachId },
            attributes: ['followerId', 'created_at'] // Get creation date
        });
        
        const followerIds = followerRecords.map(record => record.get('followerId'));
        // Map followerIds to their creation date for later lookup
        const followerMap = followerRecords.reduce((map, record) => {
            map[record.get('followerId')] = record.get('created_at');
            return map;
        }, {});

        if (followerIds.length === 0) {
            return res.status(200).json({ clients: [] });
        }
        
        // 2. Fetch the full User and ClientProfile data for all followers
        const clients = await User.findAll({
            where: { 
                id: { [Op.in]: followerIds },
                roles: { [Op.like]: '%"client"%' } 
            },
            attributes: ['id', 'firstName', 'lastName', 'email', 'profilePicture', 'roles'],
            include: [
                { model: ClientProfile, as: 'ClientProfile', required: false, attributes: ['dateOfBirth'] } 
            ]
        });

        // 3. Process and map the final client data
        const processedClients = clients.map(client => {
            const plainClient = client.get({ plain: true });
            const dob = plainClient.ClientProfile?.dateOfBirth;
            const followingSince = followerMap[plainClient.id];
            
            return {
                id: plainClient.id,
                name: `${plainClient.firstName} ${plainClient.lastName}`, // Combined name
                profilePicture: plainClient.profilePicture || '/default-avatar.png', 
                email: plainClient.email,
                age: dob ? calculateAge(dob) : 'N/A', // Calculate age
                followingSince: formatDate(followingSince), // Format date
            };
        });

        return res.status(200).json({ clients: processedClients });

    } catch (error) {
        console.error('Error fetching clients who follow coach:', error);
        return res.status(500).json({ error: 'Failed to fetch follower clients.' });
    }
};