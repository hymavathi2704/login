// Backend/src/controllers/exploreCoachesController.js

const { Op, Sequelize } = require('sequelize');
const db = require('../../models/index.js');

const { User, CoachProfile, Testimonial, Session, Follow, Booking, ClientProfile } = db;

const safeParse = (value) => {
  if (typeof value === 'string') {
    try { return JSON.parse(value); } catch { return value; }
  }
  return value;
};

// ==============================
// GET Public Coach Profile (by ID) 
// ==============================
const getPublicCoachProfile = async (req, res) => {
    try {
        const coachId = req.params.id;
        const viewerId = req.user?.userId || null; 

        // Step 1: Find the coach profile
        const coachProfile = await CoachProfile.findOne({
            where: { userId: coachId },
            include: [
                {
                    model: User,
                    as: 'user', 
                    attributes: ['id', 'firstName', 'lastName', 'email', 'phone', 'profilePicture'], 
                },
                { 
                    // Testimonials received by this coach
                    model: Testimonial,
                    as: 'testimonials',
                    required: false,
                    foreignKey: 'coachProfileId',
                    // 👇 We only select basic testimonial and client data
                    attributes: ['id', 'clientId', 'clientTitle', 'rating', 'content', 'date', 'bookingId'], 
                    include: [{ 
                        model: User,
                        as: 'client', 
                        attributes: ['id', 'firstName', 'lastName', 'profilePicture'],
                    }]
                    // 🛑 Removed all nested Booking and Session includes 🛑
                },
                { // Include the coach's available services
                    model: Session,
                    as: 'sessions', 
                    required: false,
                    foreignKey: 'coachProfileId',
                }
            ],
        });

        if (!coachProfile || !coachProfile.user) {
            return res.status(404).json({ error: 'Coach profile not found' });
        }

        let plainCoachProfile = coachProfile.get({ plain: true });
        
        if (plainCoachProfile.specialties) plainCoachProfile.specialties = safeParse(plainCoachProfile.specialties);
        if (plainCoachProfile.education) plainCoachProfile.education = safeParse(plainCoachProfile.education);
        if (plainCoachProfile.certifications) plainCoachProfile.certifications = safeParse(plainCoachProfile.certifications);
        
        const user = plainCoachProfile.user;

        // Post-process sessions to check for existing bookings
        let availableSessions = plainCoachProfile.sessions || [];

        if (viewerId && availableSessions.length > 0) {
            const clientBookings = await Booking.findAll({
                where: { 
                    clientId: viewerId,
                    sessionId: { [Op.in]: availableSessions.map(s => s.id) },
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
                isBooked: bookedMap.has(session.id),
                bookingStatus: bookedMap.get(session.id) || null
            }));
        }
        
        // 🔑 REVERTED FORMATTING: Use a static placeholder for session
        const formattedTestimonials = (plainCoachProfile.testimonials || []).map(t => ({
            id: t.id,
            clientId: t.clientId,
            clientName: t.client ? `${t.client.firstName} ${t.client.lastName}` : 'Anonymous Client',
            clientAvatar: t.client?.profilePicture || '/default-avatar.png', 
            clientTitle: t.clientTitle,
            rating: t.rating,
            content: t.content,
            date: t.date,
            // 🛑 Reverting to a static string, as no session data is fetched
            sessionTitle: 'Session', 
        }));

        const sessionPrices = availableSessions.length > 0 ? availableSessions.map(s => s.price) : [0];
        const calculatedStartingPrice = Math.min(...sessionPrices);

        // Construct final object
        const profile = {
            id: user.id,
            name: `${user.firstName} ${user.lastName}`,
            email: user.email,
            phone: user.phone,
            profileImage: plainCoachProfile.profilePicture || user.profilePicture, 
            testimonials: formattedTestimonials,
            availableSessions: availableSessions,
            title: plainCoachProfile.professionalTitle,
            rating: 4.9,
            totalReviews: formattedTestimonials.length,
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

const getAllCoachProfiles = async (req, res) => {
    try {
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

        const uniqueCombinedIds = [...new Set(combinedIds)].filter(id => id !== null);


        if (uniqueCombinedIds.length === 0 && !isSearchOrFilterActive) {
             const allCoachUsers = await User.findAll({
                 attributes: ['id'],
                 where: { roles: { [Op.like]: '%coach%' } },
                 raw: true,
             });
             uniqueCombinedIds.push(...allCoachUsers.map(u => u.id));
        } else if (uniqueCombinedIds.length === 0 && isSearchOrFilterActive) {
            return res.status(200).json({ coaches: [] });
        }

        if (uniqueCombinedIds.length === 0) {
             return res.status(200).json({ coaches: [] });
        }


        const coachesWithProfiles = await User.findAll({
            attributes: ['id', 'firstName', 'lastName', 'email', 'profilePicture'],
            where: { id: { [Op.in]: uniqueCombinedIds } },
            include: [
                {
                    model: CoachProfile,
                    as: 'CoachProfile',
                    required: true,
                    attributes: ['id', 'professionalTitle', 'bio', 'specialties', 'yearsOfExperience'],
                },
            ],
        });


        const allResults = await Promise.all(coachesWithProfiles.map(async (coach) => {
            const plainCoach = coach.get({ plain: true });
            const profile = plainCoach.CoachProfile;

            if (!profile) return null;

            profile.specialties = safeParse(profile.specialties);

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

const getFollowStatus = async (req, res) => { 
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

const followCoach = async (req, res) => {
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

const unfollowCoach = async (req, res) => {
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

const getFollowedCoaches = async (req, res) => {
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

        let finalIds = [];
        const followedSet = new Set(followedCoachIds);

        if (isSearchOrFilterActive) {
            finalIds = searchAndFilterMatchIds.filter(id => followedSet.has(id));
        } else {
            finalIds = followedCoachIds;
        }

        if (finalIds.length === 0) {
            return res.status(200).json({ coaches: [] });
        }

        const coachesWithProfiles = await User.findAll({
            where: { 
                id: { [Op.in]: finalIds },
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

const getClientsWhoFollow = async (req, res) => {
    try {
        const coachId = req.user.userId; 

        const followerRecords = await Follow.findAll({
            where: { followingId: coachId },
            attributes: ['followerId'] 
        });
        
        const followerIds = followerRecords.map(record => record.get('followerId'));

        if (followerIds.length === 0) {
            return res.status(200).json({ clients: [] });
        }
        
        const clients = await User.findAll({
            where: { 
                id: { [Op.in]: followerIds },
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

const checkReviewEligibility = async (req, res) => {
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

        const eligibleBookings = await Booking.findAll({
            where: { 
                clientId: clientId,
                status: 'completed', 
                isReviewed: { [Op.not]: true } 
            },
            include: [{
                model: Session,
                as: 'Session', 
                required: true,
                attributes: ['id', 'title', 'type', 'defaultDate', 'defaultTime'], 
                where: { coachProfileId: coachProfileId }
            }]
        });

        const eligibleSessions = eligibleBookings
            .map(booking => {
                const session = booking.Session;
                return {
                    id: booking.id, 
                    title: `${session.title} (on ${new Date(session.defaultDate).toLocaleDateString('en-US')})`,
                    type: session.type
                };
            });
        
        return res.json({ eligibleSessions });

    } catch (error) {
        console.error('Error checking review eligibility:', error);
        return res.status(500).json({ error: 'Server error checking eligibility.' });
    }
};

module.exports = {
    getPublicCoachProfile,
    getAllCoachProfiles,
    getFollowStatus,
    followCoach,
    unfollowCoach,
    getFollowedCoaches,
    getClientsWhoFollow,
    checkReviewEligibility
};