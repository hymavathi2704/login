// Backend/src/controllers/coachProfileController.js

import { v4 as uuidv4 } from 'uuid';
import path from 'path'; 
import fs from 'fs';
import User from '../models/user.js'; 
import CoachProfile from '../models/CoachProfile.js'; 
import ClientProfile from '../models/ClientProfile.js'; 
import Testimonial from '../models/Testimonial.js'; 
import Session from '../models/Session.js'; 
import Follow from '../models/Follow.js'; 

import { Op } from 'sequelize';

// === FIX: Replacement for __dirname in ES Modules ===
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// ===================================================

// Define the root directory for uploads, now using the __dirname equivalent
const UPLOADS_DIR = path.join(__dirname, '..', '..', 'uploads');

// ==============================
// Helper: Safe JSON parse
// ==============================
const safeParse = (value) => {
  if (typeof value === 'string') {
    try { return JSON.parse(value); } catch { return value; }
  }
  return value;
};

// ==============================
// GET Coach Profile (logged-in)
// ==============================
export const getCoachProfile = async (req, res) => { 
  try {
    const userId = req.user?.userId; 
    if (!userId) return res.status(401).json({ error: 'User ID missing from token' });

    const user = await User.findByPk(userId, {
        include: [
            { 
                model: CoachProfile, 
                as: 'CoachProfile',
                include: [{ model: Session, as: 'sessions' }] 
            }, 
            { model: ClientProfile, as: 'ClientProfile' }
        ],
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const plainUser = user.get({ plain: true });

    if (plainUser.CoachProfile) {
        plainUser.CoachProfile.specialties = safeParse(plainUser.CoachProfile.specialties);
        plainUser.CoachProfile.education = safeParse(plainUser.CoachProfile.education);
        plainUser.CoachProfile.certifications = safeParse(plainUser.CoachProfile.certifications);
        plainUser.CoachProfile.pricing = safeParse(plainUser.CoachProfile.pricing);
        plainUser.CoachProfile.availability = safeParse(plainUser.CoachProfile.availability);
    }

    res.json({ user: plainUser });

  } catch (error) {
    console.error('Error fetching coach profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// ... (omitted imports and helper functions)

// ==============================
// UPDATE Coach Profile 
// ==============================
export const updateCoachProfile = async (req, res) => { 
    try {
        const userId = req.user?.userId;
        if (!userId) return res.status(401).json({ error: 'Unauthorized: User ID missing.' });

        const user = await User.findByPk(userId, { include: { model: CoachProfile, as: 'CoachProfile' } });
        if (!user) return res.status(404).json({ error: 'User not found' });

        const {
            firstName, lastName, email, phone,
            professionalTitle, bio, 
            yearsOfExperience, 
            dateOfBirth, gender, ethnicity, country,
            linkedinUrl, twitterUrl, instagramUrl, facebookUrl,
            // The JSON fields (now strings in req.body due to FormData)
            specialties, certifications, education 
            // pricing, availability (removed from the payload in the previous step)
        } = req.body; 

        // ⚠️ CRITICAL FIX 1: Add logic to handle req.file and update User.profilePicture
        const userData = { firstName, lastName, email, phone };

        if (req.file) {
            // A new file was uploaded via the FormData request
            userData.profilePicture = `/uploads/${req.file.filename}`;
        } else if (req.body.profilePicture === 'null' || req.body.profilePicture === '') {
            // The user removed the picture (sent 'null' or empty string)
            userData.profilePicture = null;
        } else if (req.body.profilePicture) {
            // The user sent the existing path/URL, keep it.
            userData.profilePicture = req.body.profilePicture;
        }
        
        // Update User Model (Handles core user fields and profilePicture)
        await user.update(userData); // ✅ FIX: This now updates the profilePicture column

        let coachProfile = user.CoachProfile;
        if (!coachProfile) coachProfile = await CoachProfile.create({ userId });

        // Update CoachProfile Model (Handles coach-specific fields, including JSON strings)
        await coachProfile.update({
            professionalTitle,
            bio, 
            yearsOfExperience: parseInt(yearsOfExperience) || 0,
            dateOfBirth, gender, ethnicity, country,
            linkedinUrl, twitterUrl, instagramUrl, facebookUrl,
            // JSON fields from req.body (already stringified on frontend)
            specialties: specialties, 
            certifications: certifications, 
            education: education,
            // ... (remove pricing/availability if they aren't meant to be here)
            // pricing: pricing || '{}', 
            // availability: availability || '{}'
        });

        // ⚠️ CRITICAL FIX 2: Fetch and return the updated user object with the new profilePicture value
        const updatedUser = await User.findByPk(userId, {
            include: [
                { 
                    model: CoachProfile, 
                    as: 'CoachProfile',
                    include: [{ model: Session, as: 'sessions' }] 
                },
                { model: ClientProfile, as: 'ClientProfile' }
            ],
        });

        const plainUpdatedUser = updatedUser.get({ plain: true });
        
        // Ensure JSON fields are parsed before sending back
        if (plainUpdatedUser.CoachProfile) {
            plainUpdatedUser.CoachProfile.specialties = safeParse(plainUpdatedUser.CoachProfile.specialties);
            plainUpdatedUser.CoachProfile.education = safeParse(plainUpdatedUser.CoachProfile.education);
            plainUpdatedUser.CoachProfile.certifications = safeParse(plainUpdatedUser.CoachProfile.certifications);
        }

        res.json({ user: plainUpdatedUser });
    } catch (error) {
        console.error('Error updating coach profile:', error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
};
// ... (rest of file)
// ==============================
// ADD Item (certification/education/specialties)
// ==============================
export const addItem = async (req, res) => { 
  try {
    const { type, item } = req.body; 
    const allowedTypes = ['certifications', 'education', 'specialties'];
    if (!allowedTypes.includes(type)) {
        return res.status(400).json({ error: 'Invalid item type specified.' });
    }
    
    const userId = req.user.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized: User ID missing.' });
    
    const coachProfile = await CoachProfile.findOne({ where: { userId } });
    if (!coachProfile) return res.status(404).json({ error: 'Coach profile not found' });

    const dataFromDb = safeParse(coachProfile[type]);
    const currentItems = Array.isArray(dataFromDb) ? dataFromDb : [];
    
    currentItems.push(type === 'specialties' ? item : { ...item, id: uuidv4() }); 

    // Data is stored as a JSON string in the database
    await coachProfile.update({ [type]: JSON.stringify(currentItems) });
    
    const updatedProfile = await CoachProfile.findOne({ where: { userId } });
    const currentItemsParsed = safeParse(updatedProfile[type]);

    // Return the specific type field array, now guaranteed to be refreshed from DB
    res.json({ [type]: currentItemsParsed });
  } catch (error) {
    console.error('Error adding item:', error);
    res.status(500).json({ error: 'Failed to add item' });
  }
};

// ==============================
// REMOVE Item (certification/education/specialties)
// ==============================
export const removeItem = async (req, res) => { 
  try {
    const { type, id } = req.body;
    const allowedTypes = ['certifications', 'education', 'specialties'];
    if (!allowedTypes.includes(type)) {
        return res.status(400).json({ error: 'Invalid item type specified.' });
    }

    const userId = req.user.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized: User ID missing.' });

    const coachProfile = await CoachProfile.findOne({ where: { userId } });
    if (!coachProfile) return res.status(404).json({ error: 'Coach profile not found' });

    const dataFromDb = safeParse(coachProfile[type]);
    const listToFilter = Array.isArray(dataFromDb) ? dataFromDb : [];
    
    // Filtering logic: filter by string value for specialties, filter by object id for Certs/Edu
    const currentItems = listToFilter.filter(item => 
        type === 'specialties' ? item !== id : item.id !== id
    );

    // Data is stored as a JSON string in the database
    await coachProfile.update({ [type]: JSON.stringify(currentItems) });
    
    const updatedProfile = await CoachProfile.findOne({ where: { userId } });
    const currentItemsParsed = safeParse(updatedProfile[type]);

    // Return the specific type field array, now guaranteed to be refreshed from DB
    res.json({ [type]: currentItemsParsed });
  } catch (error) {
    console.error('Error removing item:', error);
    res.status(500).json({ error: 'Failed to remove item' });
  }
};

// ==============================
// UPLOAD Profile Picture
// ==============================
export const uploadProfilePicture = async (req, res) => { 
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded or file type is invalid (must be an image).' });
    }

    try {
        const user = await User.findByPk(userId);

        if (!user) {
            fs.unlinkSync(path.join(UPLOADS_DIR, req.file.filename));
            return res.status(404).json({ message: 'User not found' });
        }
        
        const newFilename = req.file.filename;
        const publicPath = `/uploads/${newFilename}`;
        user.profilePicture = publicPath;
        await user.save(); 

        res.json({
            message: 'Profile picture uploaded successfully',
            profilePicture: user.profilePicture, 
        });

    } catch (error) {
        console.error('Error in uploadProfilePicture:', error.stack);
        try {
            if (req.file) { // Added conditional check for req.file before unlinking
                fs.unlinkSync(path.join(UPLOADS_DIR, req.file.filename));
            }
        } catch (cleanupErr) {
            // Log cleanup error if necessary
        }
        res.status(500).json({ message: 'Failed to upload image due to server error.' });
    }
};

// ==============================
// GET Public Coach Profile (by ID) - FIXED
// ==============================
export const getPublicCoachProfile = async (req, res) => { 
  try {
    const coachId = req.params.id;

    // Step 1: Find the coach profile
    const coachProfile = await CoachProfile.findOne({
      where: { userId: coachId }, // coachId = User ID
      include: [
        {
          model: User,
          as: 'user', 
          attributes: ['id', 'firstName', 'lastName', 'email', 'phone', 'profilePicture'], 
          // 🚨 FIX: REMOVED the invalid Event include here
        },
        { // Testimonials received by this coach
          model: Testimonial,
          as: 'testimonials',
          required: false,
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
        }
      ],
    });

    if (!coachProfile || !coachProfile.user) {
      return res.status(404).json({ error: 'Coach profile not found' });
    }

    // CRITICAL: Parse JSON strings before sending to the frontend
    const plainCoachProfile = coachProfile.get({ plain: true });
    
    if (plainCoachProfile.specialties) plainCoachProfile.specialties = safeParse(plainCoachProfile.specialties);
    if (plainCoachProfile.education) plainCoachProfile.education = safeParse(plainCoachProfile.education);
    if (plainCoachProfile.certifications) plainCoachProfile.certifications = safeParse(plainCoachProfile.certifications);
    if (plainCoachProfile.pricing) plainCoachProfile.pricing = safeParse(plainCoachProfile.pricing); 
    if (plainCoachProfile.availability) plainCoachProfile.availability = safeParse(plainCoachProfile.availability);

    const user = plainCoachProfile.user;

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


    // Step 2: Construct final object
    const profile = {
      id: user.id,
      name: `${user.firstName} ${user.lastName}`,
      email: user.email,
      phone: user.phone,
      profileImage: plainCoachProfile.profilePicture || user.profilePicture, 
      // 🚨 FIX: REMOVED events: user.events || [],
      testimonials: formattedTestimonials,
      availableSessions: plainCoachProfile.sessions || [], 
      title: plainCoachProfile.professionalTitle,
      rating: 4.9, 
      totalReviews: formattedTestimonials.length,
      totalClients: 0,
      yearsExperience: plainCoachProfile.yearsOfExperience || 0,
      shortBio: plainCoachProfile.bio ? plainCoachProfile.bio.substring(0, 150) + '...' : '',
      fullBio: plainCoachProfile.bio || '',
      isAvailable: true,
      avgResponseTime: plainCoachProfile.responseTime || 'within-4h',
      timezone: plainCoachProfile.availability?.timezone || 'UTC',
      startingPrice: plainCoachProfile.pricing?.individual || plainCoachProfile.sessions?.[0]?.price || 0,
      
      // PARSED LIST FIELDS
      specialties: plainCoachProfile.specialties || [],
      education: plainCoachProfile.education || [],
      certifications: plainCoachProfile.certifications || [],

      // ADDED: Social Links and Demographics
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
// GET All Coach Profiles (for client discovery) - FIXED
// ===================================
export const getAllCoachProfiles = async (req, res) => { 
  try {
    const { search, audience } = req.query;
    const whereClause = { /* ... omitted ... */ };

    const coaches = await User.findAll({
        // ... (omitted User attributes and where clause)
        include: [
            { 
                model: CoachProfile, 
                as: 'CoachProfile',
                // ... (omitted where clause)
                required: true,
                include: [
                    { // For rating calculation
                        model: Testimonial,
                        as: 'testimonials',
                        attributes: ['rating'], 
                        required: false,
                    },
                    { // For price calculation
                        model: Session,
                        as: 'sessions', 
                        attributes: ['price'], 
                        required: false,
                    }
                ]
            },
        ],
        group: ['User.id', 'CoachProfile.id', 'CoachProfile.testimonials.id', 'CoachProfile.sessions.id']
    });

    const processedCoaches = coaches.map(coach => {
        const plainCoach = coach.get({ plain: true });
        const profile = plainCoach.CoachProfile;
        
        if (profile) {
            profile.specialties = safeParse(profile.specialties);
            profile.pricing = safeParse(profile.pricing);
        }

        const ratings = profile?.testimonials?.map(t => t.rating) || [];
        const prices = profile?.sessions?.map(s => s.price) || [];
        
        const averageRating = ratings.length > 0 
            ? (ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length).toFixed(1)
            : '0.0';
        
        // Calculate minimum price from available sessions, falling back to pricing JSON
        const startingPrice = prices.length > 0
            ? Math.min(...prices)
            : profile?.pricing?.individual || 0; 

        
        return {
        // Pass the raw User fields directly
        id: plainCoach.id,
        firstName: plainCoach.firstName, // <-- ADDED
        lastName: plainCoach.lastName,   // <-- ADDED
        profilePicture: plainCoach.profilePicture, // <-- ADDED
        
        // Pass CoachProfile fields as before
        title: profile?.professionalTitle,
        shortBio: profile?.bio ? profile.bio.substring(0, 150) + '...' : '',
        specialties: profile?.specialties || [],
        
        // Ensure rating and price fields are still present
        startingPrice: startingPrice,
        rating: parseFloat(averageRating),
        totalReviews: ratings.length,
    };
});

    res.status(200).json({ coaches: processedCoaches });
  } catch (error) {
    console.error('Error fetching all coach profiles:', error);
    res.status(500).json({ error: 'Failed to fetch coach profiles' });
  }
};

// ==============================
// NEW: GET Follow Status
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
// NEW: POST Follow Coach
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
// NEW: DELETE Unfollow Coach
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

// Backend/src/controllers/coachProfileController.js


// ==============================
// NEW: GET Followed Coaches (for client dashboard)
// ==============================
export const getFollowedCoaches = async (req, res) => {
    try {
        // Ensure req.user.userId is reliably present from the authenticate middleware
        const followerId = req.user.userId; 

        // 1. Find all Follow records where the current user is the follower
        const followedRecords = await Follow.findAll({
            where: { followerId: followerId },
            attributes: ['followingId'] 
        });
        
        // CRITICAL FIX: Use .get('followingId') to reliably extract the attribute value.
        // Direct access (record.followingId) often fails when attributes are explicitly limited.
        const followedCoachIds = followedRecords.map(record => record.get('followingId'));

        if (followedCoachIds.length === 0) {
            return res.status(200).json({ coaches: [] });
        }
        
        // 2. Reuse the logic from getAllCoachProfiles to fetch the full data for these specific IDs
        const coaches = await User.findAll({
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
                    include: [
                        { model: Testimonial, as: 'testimonials', attributes: ['rating'], required: false },
                        { model: Session, as: 'sessions', attributes: ['price'], required: false }
                    ]
                },
            ],
            group: ['User.id', 'CoachProfile.id', 'CoachProfile.testimonials.id', 'CoachProfile.sessions.id']
        });

        // 3. Apply the same data processing logic as getAllCoachProfiles
        const processedCoaches = coaches.map(coach => {
            const plainCoach = coach.get({ plain: true });
            const profile = plainCoach.CoachProfile;
            
            if (profile) {
                profile.specialties = safeParse(profile.specialties);
                profile.pricing = safeParse(profile.pricing);
            }

            const ratings = profile?.testimonials?.map(t => t.rating) || [];
            const prices = profile?.sessions?.map(s => s.price) || [];
            
            const averageRating = ratings.length > 0 
                ? (ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length).toFixed(1)
                : '0.0';
            
            const startingPrice = prices.length > 0
                ? Math.min(...prices)
                : profile?.pricing?.individual || 0; 

            return {
                id: plainCoach.id,
                firstName: plainCoach.firstName, 
                lastName: plainCoach.lastName,   
                profilePicture: plainCoach.profilePicture, 
                // Ensure this field matches the frontend expectation (frontend was updated in the last response)
                title: profile?.professionalTitle, 
                shortBio: profile?.bio ? profile.bio.substring(0, 150) + '...' : '',
                specialties: profile?.specialties || [],
                startingPrice: startingPrice,
                rating: parseFloat(averageRating),
                totalReviews: ratings.length,
            };
        });

        res.status(200).json({ coaches: processedCoaches });

    } catch (error) {
        console.error('Error fetching followed coaches:', error);
        res.status(500).json({ error: 'Failed to fetch followed coaches' });
    }
};


// ==============================
// NEW: GET Clients Who Follow This Coach
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

