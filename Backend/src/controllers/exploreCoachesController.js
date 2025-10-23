// Backend/src/controllers/exploreCoachesController.js

import { Op, Sequelize } from 'sequelize';
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
        // 'search' is the search term, 'audience' is the selected specialty filter
        const { search, audience } = req.query;

        // --- Setup ---
        const searchLower = search ? search.toLowerCase() : null;
        const audienceLower = audience ? audience.toLowerCase() : null;
        
        let combinedIds = [];
        let profileMatchUserIds = [];
        let nameMatchUserIds = [];
        const isSearchOrFilterActive = search || audience;

        // ----------------------------------------------------
        // Step 1: Find CoachProfile IDs matching the Profile/Specialty Filter and Search
        // ----------------------------------------------------
        
        let profileWhere = {};
        let profileSearchOrs = [];

        if (search) {
            // Build Profile search conditions (Title, Bio, Specialty)
            profileSearchOrs.push(
                { professionalTitle: { [Op.like]: `%${searchLower}%` } },
                { bio: { [Op.like]: `%${searchLower}%` } },
                // 
                Sequelize.where(
                    Sequelize.fn('LOWER', Sequelize.col('specialties')), 
                    { [Op.like]: `%${searchLower}%` }
                )
            );
        }

        if (audience) {
            // 
            // This forces a case-insensitive 'LIKE' by applying LOWER() to the database column
            // This is the main fix for the JSON LIKE issue
            profileWhere.specialties = Sequelize.where(
                Sequelize.fn('LOWER', Sequelize.col('specialties')), 
                { [Op.like]: `%${audienceLower}%` }
            );
        }
        
        if (profileSearchOrs.length > 0) {
            const searchCondition = { [Op.or]: profileSearchOrs };

            if (audience) {
                // If we have both search and audience, combine them with AND
                profileWhere = {
                    [Op.and]: [
                        searchCondition,
                        profileWhere.specialties // Add the specialty filter
                    ]
                };
            } else {
                // If we only have search, use the OR block
                profileWhere = searchCondition;
            }
        }
        // 
        // ----------------------------------------------------

        if (Object.keys(profileWhere).length > 0) {
             const profileMatches = await CoachProfile.findAll({
                attributes: ['userId'],
                where: profileWhere,
                raw: true,
            });
            profileMatchUserIds = profileMatches.map(p => p.userId);
            combinedIds.push(...profileMatchUserIds);
        }

        // ----------------------------------------------------
        // Step 2: Find User IDs matching the Name Search (Name only)
        // ----------------------------------------------------
        
        if (search) {
            const userNameOrs = [
                { firstName: { [Op.like]: `%${searchLower}%` } },
                { lastName: { [Op.like]: `%${searchLower}%` } }
            ];
            
            const nameMatchUsers = await User.findAll({
                attributes: ['id'],
                where: { 
                    // 
                    roles: { [Op.like]: '%coach%' }, // 
                    [Op.or]: userNameOrs
                },
                raw: true,
            });
            nameMatchUserIds = nameMatchUsers.map(u => u.id);
            combinedIds.push(...nameMatchUserIds);
        }
        
        // ----------------------------------------------------
        // Step 3: Consolidate IDs and Perform Final Fetch
        // ----------------------------------------------------
        const uniqueCombinedIds = [...new Set(combinedIds)].filter(id => id !== null);
        
        

        if (uniqueCombinedIds.length === 0 && !isSearchOrFilterActive) {
            // If nothing was searched/filtered, fetch ALL coaches
             const allCoachUsers = await User.findAll({
                attributes: ['id'],
                // 
                where: { roles: { [Op.like]: '%coach%' } }, // 
                raw: true,
            });
            uniqueCombinedIds.push(...allCoachUsers.map(u => u.id));
             console.log("No search/filter, fetching ALL coach IDs:", uniqueCombinedIds.length);
        } else if (uniqueCombinedIds.length === 0 && isSearchOrFilterActive) {
            // Search/filter was active but yielded no results
            console.log("Search/filter was active but yielded 0 results.");
            return res.status(200).json({ coaches: [] });
        }
        
        if (uniqueCombinedIds.length === 0) {
             console.log("No coach IDs found in any step.");
             return res.status(200).json({ coaches: [] });
        }
        
        console.log(`Fetching final User profiles for ${uniqueCombinedIds.length} IDs.`);
        
        const coachesWithProfiles = await User.findAll({
            attributes: ['id', 'firstName', 'lastName', 'email', 'profilePicture'], 
            where: { id: { [Op.in]: uniqueCombinedIds } }, 
            include: [
                { 
                    model: CoachProfile, 
                    as: 'CoachProfile',
                    required: true,
                    // Explicitly list attributes to prevent deep cloning issues
                    attributes: ['id', 'professionalTitle', 'bio', 'specialties', 'yearsOfExperience'], 
                },
            ],
        });


        // STEP 4: Process coaches and fetch aggregated data separately (Remaining logic)
        const allResults = await Promise.all(coachesWithProfiles.map(async (coach) => {
            const plainCoach = coach.get({ plain: true });
            const profile = plainCoach.CoachProfile;
            
            if (!profile) return null; 
            
            // Parse JSON fields
            profile.specialties = safeParse(profile.specialties);
            
            // Fetch Testimonials for aggregation
            const testimonials = await Testimonial.findAll({
                where: { coachProfileId: profile.id }, 
                attributes: ['rating'],
                raw: true,
            });
            const ratings = testimonials.map(t => t.rating) || [];
            
            // Fetch Sessions for pricing calculation
            const sessions = await Session.findAll({
                where: { coachProfileId: profile.id }, 
                attributes: ['price'],
                raw: true,
            });
            const prices = sessions.map(s => s.price) || [];

            const averageRating = ratings.length > 0
                ? (ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length).toFixed(1)
                : '0.0';
            
            const startingPrice = prices.length > 0
                ? Math.min(...prices)
                : 0; 
            
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
        
        const processedCoaches = allResults.filter(coach => coach !== null); 

        res.status(200).json({ coaches: processedCoaches });
    } catch (error) {
        console.error('Error fetching all coach profiles:', error);
        res.status(500).json({ error: 'Failed to fetch coach profiles' });
    }
};

// ==============================
// GET Follow Status
// ... (rest of the file remains unchanged)
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
// ==============================
// GET Followed Coaches (for client dashboard) - NOW WITH FILTERING
// ==============================
export const getFollowedCoaches = async (req, res) => {
    try {
        const followerId = req.user.userId; 

        // === STEP 1: Get the base list of coaches the user follows ===
        const followedRecords = await Follow.findAll({
            where: { followerId: followerId },
            attributes: ['followingId'] 
        });
        
        const followedCoachIds = followedRecords.map(record => record.get('followingId'));

        if (followedCoachIds.length === 0) {
            return res.status(200).json({ coaches: [] });
        }

        // === STEP 2: Get and apply search/audience filters (copied from getAllCoachProfiles) ===
        const { search, audience } = req.query;
        const searchLower = search ? search.toLowerCase() : null;
        const audienceLower = audience ? audience.toLowerCase() : null;
        
        let combinedIds = [];
        let profileMatchUserIds = [];
        let nameMatchUserIds = [];
        const isSearchOrFilterActive = search || audience;

        let profileWhere = {};
        let profileSearchOrs = [];

        if (search) {
            profileSearchOrs.push(
                { professionalTitle: { [Op.like]: `%${searchLower}%` } },
                { bio: { [Op.like]: `%${searchLower}%` } },
                Sequelize.where(
                    Sequelize.fn('LOWER', Sequelize.col('specialties')), 
                    { [Op.like]: `%${searchLower}%` }
                )
            );
        }

        if (audience) {
            profileWhere.specialties = Sequelize.where(
                Sequelize.fn('LOWER', Sequelize.col('specialties')), 
                { [Op.like]: `%${audienceLower}%` }
            );
        }
        
        if (profileSearchOrs.length > 0) {
            const searchCondition = { [Op.or]: profileSearchOrs };
            if (audience) {
                profileWhere = {
                    [Op.and]: [
                        searchCondition,
                        profileWhere.specialties
                    ]
                };
            } else {
                profileWhere = searchCondition;
            }
        }

        if (Object.keys(profileWhere).length > 0) {
             const profileMatches = await CoachProfile.findAll({
                attributes: ['userId'],
                where: profileWhere,
                raw: true,
            });
            profileMatchUserIds = profileMatches.map(p => p.userId);
            combinedIds.push(...profileMatchUserIds);
        }

        if (search) {
            const userNameOrs = [
                { firstName: { [Op.like]: `%${searchLower}%` } },
                { lastName: { [Op.like]: `%${searchLower}%` } }
            ];
            const nameMatchUsers = await User.findAll({
                attributes: ['id'],
                where: { 
                    roles: { [Op.like]: '%coach%' },
                    [Op.or]: userNameOrs
                },
                raw: true,
            });
            nameMatchUserIds = nameMatchUsers.map(u => u.id);
            combinedIds.push(...nameMatchUserIds);
        }
        
        const searchAndFilterMatchIds = [...new Set(combinedIds)].filter(id => id !== null);

        // === STEP 3: Find the INTERSECTION of the two lists ===
        
        let finalIds = [];
        const followedSet = new Set(followedCoachIds); // Use a Set for efficient lookup

        if (isSearchOrFilterActive) {
            // If filters are active, only include coaches that are BOTH followed AND match the filter
            finalIds = searchAndFilterMatchIds.filter(id => followedSet.has(id));
        } else {
            // If no filters, just return all followed coaches
            finalIds = followedCoachIds;
        }

        if (finalIds.length === 0) {
            // This means either no followed coaches, or none matched the filter
            return res.status(200).json({ coaches: [] });
        }

        // === STEP 4: Fetch and process the final list of coaches ===
        const coachesWithProfiles = await User.findAll({
            where: { 
                id: { [Op.in]: finalIds }, // Use the final intersected/filtered list
            },
            attributes: ['id', 'firstName', 'lastName', 'email', 'profilePicture'],
            include: [
                { 
                    model: CoachProfile, 
                    as: 'CoachProfile',
                    required: true,
                },
            ],
        });

        // (The rest of the function: Promise.all, processing, etc. remains the same)
        const allResults = await Promise.all(coachesWithProfiles.map(async (coach) => {
            const plainCoach = coach.get({ plain: true });
            const profile = plainCoach.CoachProfile;
            
            if (!profile) return null;
            
            profile.specialties = safeParse(profile.specialties);
            profile.pricing = safeParse(profile.pricing);

            const testimonials = await Testimonial.findAll({
                where: { coachProfileId: profile.id }, 
                attributes: ['rating'],
                raw: true,
            });
            const ratings = testimonials.map(t => t.rating) || [];
            
            const sessions = await Session.findAll({
                where: { coachProfileId: profile.id }, 
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

        const processedCoaches = allResults.filter(coach => coach !== null);
        res.status(200).json({ coaches: processedCoaches });

    } catch (error) {
        console.error('Error fetching followed coaches:', error);
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
                // Optional: Filter for only 'client' roles
                roles: { [Op.like]: '%client%' } 
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

// ==============================
// 🔑 UPDATED: Check Client Review Eligibility
// ==============================
export const checkReviewEligibility = async (req, res) => {
    const { coachId } = req.params;
    const clientId = req.user?.userId;

    if (!clientId || req.user?.roles.includes('coach')) {
        return res.json({ eligibleSessions: [] });
    }

    try {
        const coachProfile = await CoachProfile.findOne({ where: { userId: coachId }, attributes: ['id'] });

        if (!coachProfile) {
            return res.status(404).json({ error: 'Coach profile not found.' });
        }
        const coachProfileId = coachProfile.id;

        // 🚨 CRITICAL FIX: Find all 'completed' bookings that have NOT been reviewed.
        const eligibleBookings = await Booking.findAll({
            where: { 
                clientId: clientId,
                // Assuming you have a 'status: completed' or equivalent in your Booking model
                status: 'completed', 
                // 🔑 CRITICAL: Assuming a boolean field 'isReviewed' exists in the Booking model
                isReviewed: { [Op.not]: true } 
            },
            include: [{
                model: Session,
                as: 'Session', 
                required: true,
                attributes: ['id', 'title', 'type', 'defaultDate', 'defaultTime'], // Fetch session details
                where: { coachProfileId: coachProfileId }
            }]
        });

        // Map the bookings to a list of eligible sessions for the frontend
        const eligibleSessions = eligibleBookings
            .map(booking => {
                const session = booking.Session;
                // We return the Booking ID (booking.id) but label it as a "session" on the frontend for context
                return {
                    id: booking.id, // 🔑 IMPORTANT: This is the Booking ID to be used in the testimonial POST
                    title: `${session.title} (on ${new Date(session.defaultDate).toLocaleDateString('en-US')})`,
                    type: session.type
                };
            });
        
        // This is the correct response payload for the frontend
        return res.json({ eligibleSessions });

    } catch (error) {
        console.error('Error checking review eligibility:', error);
        return res.status(500).json({ error: 'Server error checking eligibility.' });
    }
};