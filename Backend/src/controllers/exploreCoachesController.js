// Backend/src/controllers/exploreCoachesController.js

import { Op } from 'sequelize'; // Removed unused imports: path, fileURLToPath

// --- Model Imports ---
import User from '../models/user.js'; 
import CoachProfile from '../models/CoachProfile.js'; 
import Testimonial from '../models/Testimonial.js'; 
import Session from '../models/Session.js'; 
import Follow from '../models/Follow.js'; 
import Booking from '../models/Booking.js'; 
import ClientProfile from '../models/ClientProfile.js'; 
// ---------------------

// === Helper: Safe JSON parse (required for database fields) ===
const safeParse = (value) => {
  if (typeof value === 'string') {
    try { return JSON.parse(value); } catch { return value; }
  }
  return value;
};

// ==============================
// GET Public Coach Profile (by ID) 
// ==============================
export const getPublicCoachProfile = async (req, res) => { 
  try {
    const coachId = req.params.id;
    // 🚨 NEW: Get viewer ID from authentication middleware if available
    const viewerId = req.user?.userId || null; 

    // Step 1: Find the coach profile
    const coachProfile = await CoachProfile.findOne({
      where: { userId: coachId }, // coachId = User ID
      include: [
        {
          model: User,
          as: 'user', 
          attributes: ['id', 'firstName', 'lastName', 'email', 'phone', 'profilePicture'], 
        },
        { // Testimonials received by this coach
          model: Testimonial,
          as: 'testimonials',
          required: false,
          foreignKey: 'coachProfileId', // Explicitly set foreign key
          attributes: ['id', 'clientId', 'clientTitle', 'rating', 'content', 'date', 'sessionType'], 
          include: [{ 
            model: User,
            as: 'clientUser', 
            attributes: ['id', 'firstName', 'lastName', 'profilePicture'],
          }]
        },
        { // Include the coach's available services
          model: Session,
          as: 'sessions', 
          required: false,
          foreignKey: 'coachProfileId', // Explicitly set foreign key
        }
      ],
    });

    if (!coachProfile || !coachProfile.user) {
      return res.status(404).json({ error: 'Coach profile not found' });
    }

    // CRITICAL: Parse JSON strings before sending to the frontend
    let plainCoachProfile = coachProfile.get({ plain: true });
    
    if (plainCoachProfile.specialties) plainCoachProfile.specialties = safeParse(plainCoachProfile.specialties);
    if (plainCoachProfile.education) plainCoachProfile.education = safeParse(plainCoachProfile.education);
    if (plainCoachProfile.certifications) plainCoachProfile.certifications = safeParse(plainCoachProfile.certifications);
    // Removed parsing for plainCoachProfile.pricing and plainCoachProfile.availability (as per model changes)
    

    const user = plainCoachProfile.user;

    // 🚨 NEW LOGIC: Post-process sessions to check for existing bookings
    let availableSessions = plainCoachProfile.sessions || [];

    if (viewerId && availableSessions.length > 0) {
        // Find active bookings for this client for any of these sessions
        const clientBookings = await Booking.findAll({
            where: { 
                clientId: viewerId,
                sessionId: { [Op.in]: availableSessions.map(s => s.id) },
                // Check for any active status (confirmed, pending, etc.) excluding 'cancelled'
                status: { [Op.ne]: 'cancelled' } 
            },
            attributes: ['sessionId', 'status'],
        });

        const bookedMap = clientBookings.reduce((map, b) => {
            map.set(b.sessionId, b.status);
            return map;
        }, new Map());
        
        availableSessions = availableSessions.map(session => ({
            ...session,
            isBooked: bookedMap.has(session.id), // <-- NEW FLAG: true if an active booking exists
            bookingStatus: bookedMap.get(session.id) || null // <-- NEW STATUS
        }));
    }
    // 🚨 END NEW LOGIC

    // Format testimonials to include the client's name/avatar from the User model
    const formattedTestimonials = (plainCoachProfile.testimonials || []).map(t => ({
        id: t.id,
        clientId: t.clientId,
        clientName: t.clientUser ? `${t.clientUser.firstName} ${t.clientUser.lastName}` : 'Anonymous Client',
        clientAvatar: t.clientUser?.profilePicture || '/default-avatar.png', 
        clientTitle: t.clientTitle,
        rating: t.rating,
        content: t.content,
        date: t.date,
        sessionType: t.sessionType,
    }));

    // Calculate starting price based on available sessions only
    const sessionPrices = availableSessions.length > 0 ? availableSessions.map(s => s.price) : [0];
    const calculatedStartingPrice = Math.min(...sessionPrices);


    // Step 2: Construct final object
    const profile = {
      id: user.id,
      name: `${user.firstName} ${user.lastName}`,
      email: user.email,
      phone: user.phone,
      profileImage: plainCoachProfile.profilePicture || user.profilePicture, 
      testimonials: formattedTestimonials,
      availableSessions: availableSessions, // <-- Use the processed array
      title: plainCoachProfile.professionalTitle,
      rating: 4.9, // This is a hardcoded value, consider calculating or removing if unused
      totalReviews: formattedTestimonials.length, // This is calculated dynamically from testimonials
      totalClients: 0,
      yearsExperience: plainCoachProfile.yearsOfExperience || 0,
      shortBio: plainCoachProfile.bio ? plainCoachProfile.bio.substring(0, 150) + '...' : '',
      fullBio: plainCoachProfile.bio || '',
      isAvailable: true,
      avgResponseTime: 'within-4h', 
      timezone: 'UTC', 
      startingPrice: calculatedStartingPrice,
      specialties: plainCoachProfile.specialties || [],
      education: plainCoachProfile.education || [],
      certifications: plainCoachProfile.certifications || [],
      linkedinUrl: plainCoachProfile.linkedinUrl,
      twitterUrl: plainCoachProfile.twitterUrl,
      instagramUrl: plainCoachProfile.instagramUrl,
      facebookUrl: plainCoachProfile.facebookUrl,
      dateOfBirth: plainCoachProfile.dateOfBirth,
      gender: plainCoachProfile.gender,
      ethnicity: plainCoachProfile.ethnicity,
      country: plainCoachProfile.country,
    };

    res.status(200).json({ coach: profile });
  } catch (error) {
    console.error('Error fetching public coach profile:', error);
    res.status(500).json({ error: 'Failed to fetch public profile' });
  }
};

// ==============================
// GET All Coach Profiles (for client discovery)
// ===================================
export const getAllCoachProfiles = async (req, res) => { 
  try {
    const { search, audience } = req.query;
    const whereClause = { /* ... omitted search logic ... */ };

    // STEP 1: Fetch all coach profiles with minimal includes to avoid SQL aggregation errors
    const coachesWithProfiles = await User.findAll({
        // ... (omitted User attributes and where clause)
        attributes: ['id', 'firstName', 'lastName', 'email', 'profilePicture'], // Include basic user data
        where: { 
            // Include search logic here if needed
            roles: { [Op.like]: '%"coach"%' } // Ensure they are coaches
        },
        include: [
            { 
                model: CoachProfile, 
                as: 'CoachProfile',
                required: true,
                // Note: Testimonials and Sessions are REMOVED from the main query
            },
        ],
        // FIX: Ensure the problematic group clause is gone
    });

    // STEP 2: Process coaches and fetch aggregated data separately
    // FIX: Separate await and filter calls to prevent TypeError in some environments
    const allResults = await Promise.all(coachesWithProfiles.map(async (coach) => {
        const plainCoach = coach.get({ plain: true });
        const profile = plainCoach.CoachProfile;
        
        if (!profile) return null; // Should not happen with required: true, but for safety
        
        // Parse JSON fields
        profile.specialties = safeParse(profile.specialties);
        profile.pricing = safeParse(profile.pricing);
        
        // Fetch Testimonials for aggregation
        const testimonials = await Testimonial.findAll({
            where: { coachProfileId: profile.id }, // ✅ FIX: Use coachProfileId (links to CoachProfile)
            attributes: ['rating'],
            raw: true,
        });
        const ratings = testimonials.map(t => t.rating) || [];
        
        // Fetch Sessions for pricing calculation
        const sessions = await Session.findAll({
            where: { coachProfileId: profile.id }, // ✅ FIX: Assuming Session links to CoachProfile
            attributes: ['price'],
            raw: true,
        });
        const prices = sessions.map(s => s.price) || [];

        const averageRating = ratings.length > 0 
            ? (ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length).toFixed(1)
            : '0.0';
        
        const startingPrice = prices.length > 0
            ? Math.min(...prices)
            : profile.pricing?.individual || 0; 
        
        return {
            id: plainCoach.id,
            firstName: plainCoach.firstName, 
            lastName: plainCoach.lastName,   
            profilePicture: plainCoach.profilePicture, 
            title: profile.professionalTitle,
            shortBio: profile.bio ? profile.bio.substring(0, 150) + '...' : '',
            specialties: profile.specialties || [],
            startingPrice: startingPrice,
            rating: parseFloat(averageRating),
            totalReviews: ratings.length,
        };
    }));
    
    const processedCoaches = allResults.filter(coach => coach !== null); // ✅ FIX: Separate filter call

    res.status(200).json({ coaches: processedCoaches });
  } catch (error) {
    console.error('Error fetching all coach profiles:', error);
    // Ensure a consistent 500 status on failure
    res.status(500).json({ error: 'Failed to fetch coach profiles' });
  }
};

// ==============================
// GET Follow Status
// ==============================
export const getFollowStatus = async (req, res) => { 
    try {
        const coachId = req.params.coachId; 
        const followerId = req.user.userId; 

        if (followerId.toString() === coachId.toString()) {
            return res.status(200).json({ isFollowing: false });
        }

        const followRecord = await Follow.findOne({
            where: {
                followerId: followerId,
                followingId: coachId
            }
        });

        res.status(200).json({ isFollowing: !!followRecord });

    } catch (error) {
        console.error('Error checking follow status (MySQL):', error);
        res.status(500).json({ message: 'Server error when checking follow status.' });
    }
};

// ==============================
// POST Follow Coach
// ==============================
export const followCoach = async (req, res) => {
    try {
        const coachId = req.params.coachId;
        const followerId = req.user.userId;

        if (followerId.toString() === coachId.toString()) {
            return res.status(400).json({ message: 'Cannot follow yourself.' });
        }
        
        const [followRecord, created] = await Follow.findOrCreate({
            where: {
                followerId: followerId,
                followingId: coachId
            },
            defaults: {
                followerId: followerId,
                followingId: coachId
            }
        });
        
        if (!created) {
            return res.status(200).json({ message: 'Coach already followed.', isFollowing: true });
        }

        res.status(201).json({ message: 'Coach followed successfully!', isFollowing: true });

    } catch (error) {
        console.error('Error following coach (MySQL):', error);
        res.status(500).json({ message: 'Server error when attempting to follow coach.' });
    }
};

// ==============================
// DELETE Unfollow Coach
// ==============================
export const unfollowCoach = async (req, res) => {
    try {
        const coachId = req.params.coachId;
        const followerId = req.user.userId;

        if (followerId.toString() === coachId.toString()) {
            return res.status(400).json({ message: 'Cannot unfollow yourself.' });
        }
        
        const result = await Follow.destroy({
            where: {
                followerId: followerId,
                followingId: coachId
            }
        });

        if (result === 0) {
            return res.status(404).json({ message: 'Follow record not found.', isFollowing: false });
        }

        res.status(200).json({ message: 'Coach unfollowed successfully!', isFollowing: false });

    } catch (error) {
        console.error('Error unfollowing coach (MySQL):', error);
        res.status(500).json({ message: 'Server error when attempting to unfollow coach.' });
    }
};


// ==============================
// GET Followed Coaches (for client dashboard)
// ==============================
export const getFollowedCoaches = async (req, res) => {
    try {
        const followerId = req.user.userId; 

        const followedRecords = await Follow.findAll({
            where: { followerId: followerId },
            attributes: ['followingId'] 
        });
        
        const followedCoachIds = followedRecords.map(record => record.get('followingId'));

        if (followedCoachIds.length === 0) {
            return res.status(200).json({ coaches: [] });
        }
        
        // STEP 1: Fetch all coach profiles with minimal includes to avoid SQL aggregation errors
        const coachesWithProfiles = await User.findAll({
            where: { 
                id: { [Op.in]: followedCoachIds },
                roles: { [Op.like]: '%"coach"%' }
            },
            attributes: ['id', 'firstName', 'lastName', 'email', 'profilePicture'],
            include: [
                { 
                    model: CoachProfile, 
                    as: 'CoachProfile',
                    required: true,
                    // Note: Testimonials and Sessions are REMOVED from the main query
                },
            ],
            // FIX: Ensure the problematic group clause is gone (as in the last corrected version)
        });

        // STEP 2: Process coaches and fetch aggregated data separately
        // FIX: Separate await and filter calls to prevent TypeError in some environments
        const allResults = await Promise.all(coachesWithProfiles.map(async (coach) => {
            const plainCoach = coach.get({ plain: true });
            const profile = plainCoach.CoachProfile;
            
            if (!profile) return null;
            
            // Parse JSON fields
            profile.specialties = safeParse(profile.specialties);
            profile.pricing = safeParse(profile.pricing);

            // Fetch Testimonials for aggregation
            const testimonials = await Testimonial.findAll({
                where: { coachProfileId: profile.id }, // ✅ FIX: Use coachProfileId (links to CoachProfile)
                attributes: ['rating'],
                raw: true,
            });
            const ratings = testimonials.map(t => t.rating) || [];
            
            // Fetch Sessions for pricing calculation
            const sessions = await Session.findAll({
                where: { coachProfileId: profile.id }, // ✅ FIX: Assuming Session links to CoachProfile
                attributes: ['price'],
                raw: true,
            });
            const prices = sessions.map(s => s.price) || [];
            
            const averageRating = ratings.length > 0 
                ? (ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length).toFixed(1)
                : '0.0';
            
            const startingPrice = prices.length > 0
                ? Math.min(...prices)
                : profile.pricing?.individual || 0; 

            return {
                id: plainCoach.id,
                firstName: plainCoach.firstName, 
                lastName: plainCoach.lastName,   
                profilePicture: plainCoach.profilePicture, 
                title: profile.professionalTitle, 
                shortBio: profile.bio ? profile.bio.substring(0, 150) + '...' : '',
                specialties: profile.specialties || [],
                startingPrice: startingPrice,
                rating: parseFloat(averageRating),
                totalReviews: ratings.length,
            };
        }));

        const processedCoaches = allResults.filter(coach => coach !== null); // ✅ FIX: Separate filter call

        res.status(200).json({ coaches: processedCoaches });

    } catch (error) {
        console.error('Error fetching followed coaches:', error);
        // Ensure a consistent 500 status on failure
        res.status(500).json({ error: 'Failed to fetch followed coaches' });
    }
};

// ==============================
// GET Clients Who Follow This Coach
// ==============================
export const getClientsWhoFollow = async (req, res) => {
    try {
        const coachId = req.user.userId; 

        // 1. Find all Follow records where the current coach is the 'followingId'
        const followerRecords = await Follow.findAll({
            where: { followingId: coachId },
            attributes: ['followerId'] 
        });
        
        const followerIds = followerRecords.map(record => record.get('followerId'));

        if (followerIds.length === 0) {
            return res.status(200).json({ clients: [] });
        }
        
        // 2. Fetch the full User data for all followers, ensuring they are clients
        const clients = await User.findAll({
            where: { 
                id: { [Op.in]: followerIds },
                roles: { [Op.like]: '%"client"%' } // Optional: Filter for only 'client' roles
            },
            attributes: ['id', 'firstName', 'lastName', 'email', 'profilePicture', 'roles'],
            include: [
                { model: ClientProfile, as: 'ClientProfile', required: false, attributes: ['coachingGoals'] }
            ]
        });

        const processedClients = clients.map(client => client.get({ plain: true }));

        return res.status(200).json({ clients: processedClients });

    } catch (error) {
        console.error('Error fetching clients who follow coach:', error);
        return res.status(500).json({ error: 'Failed to fetch follower clients.' });
    }
};

