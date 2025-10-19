// Backend/src/controllers/clientManagementController.js

import { Op } from 'sequelize'; 
// --- Model Imports ---
import User from '../models/user.js'; 
import Follow from '../models/Follow.js'; 
import Booking from '../models/Booking.js'; 
import ClientProfile from '../models/ClientProfile.js'; 
import Session from '../models/Session.js'; // <- Ensure Session is imported for JOIN
// ---------------------

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

        // 1. Find all Booking records that link to a Session created by the coach
        // FIX: Use 'include' to join with the Session model and filter by Session.coachId
        const allBookings = await Booking.findAll({
            attributes: ['clientId'], 
            include: [{
                model: Session, // Assumes Session is associated with Booking (e.g., Booking.belongsTo(Session))
                as: 'Session', 
                required: true,
                attributes: [], 
                where: { coachId: coachId } // Filter by coachId on the Session model
            }]
        });

        if (allBookings.length === 0) {
            return res.status(200).json({ clients: [] });
        }
        
        // 2. Calculate the count of sessions booked per unique client
        const sessionsCountMap = allBookings.reduce((acc, booking) => {
            acc[booking.clientId] = (acc[booking.clientId] || 0) + 1;
            return acc;
        }, {});
        const bookedClientIds = Object.keys(sessionsCountMap);
        
        // 3. Fetch the full User data for all unique clients
        const clients = await User.findAll({
            where: { 
                id: { [Op.in]: bookedClientIds },
                roles: { [Op.like]: '%"client"%' } 
            },
            attributes: ['id', 'firstName', 'lastName', 'email', 'profilePicture', 'roles'],
        });

        // 4. Process and map the final client data
        const processedClients = clients.map(client => {
            const plainClient = client.get({ plain: true });
            
            return {
                id: plainClient.id,
                name: `${plainClient.firstName} ${plainClient.lastName}`,
                profilePicture: plainClient.profilePicture || '/default-avatar.png', 
                email: plainClient.email,
                sessionsBookedTillNow: sessionsCountMap[plainClient.id] || 0, // Attach the calculated count
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