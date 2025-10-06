// Backend/src/controllers/coachProfileController.js
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');
const User = require('../models/user');
const CoachProfile = require('../models/CoachProfile');
const ClientProfile = require('../models/ClientProfile');
const Event = require('../models/Event');
const Testimonial = require('../models/Testimonial');

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
// src/controllers/coachController.js
const getCoachProfile = async (req, res) => {
  try {
    const userId = req.user?.id; // ✅ use `id` from JWT payload
    if (!userId) return res.status(401).json({ error: 'User ID missing from token' });

    const profile = await CoachProfile.findOne({ where: { userId } });
    if (!profile) {
      return res.status(404).json({ error: 'Coach profile not found' });
    }

    res.json(profile);
  } catch (error) {
    console.error('Error fetching coach profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// ==============================
// UPDATE Coach Profile
// ==============================
const updateCoachProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findByPk(userId, { include: CoachProfile });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const {
      firstName, lastName, email, phone,
      professionalTitle, profilePicture, websiteUrl, bio,
      yearsOfExperience, specialties, sessionTypes,
      certifications, education, pricing, availability
    } = req.body;

    // Update user fields
    await user.update({ firstName, lastName, email, phone });

    // Update or create coach profile
    let coachProfile = user.CoachProfile;
    if (!coachProfile) coachProfile = await CoachProfile.create({ userId });

    await coachProfile.update({
      professionalTitle,
      profilePicture,
      websiteUrl,
      bio,
      yearsOfExperience: parseInt(yearsOfExperience) || 0,
      specialties: specialties || '[]',
      sessionTypes: sessionTypes || '[]',
      certifications: certifications || '[]',
      education: education || '[]',
      pricing: pricing || '{}',
      availability: availability || '{}'
    });

    res.json({ user: { ...user.toJSON(), CoachProfile: coachProfile } });
  } catch (error) {
    console.error('Error updating coach profile:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

// ==============================
// ADD Item (certification/education)
// ==============================
const addItem = async (req, res) => {
  try {
    const { type, item } = req.body; // type: 'certifications' | 'education'
    const userId = req.user.id;
    const coachProfile = await CoachProfile.findOne({ where: { userId } });
    if (!coachProfile) return res.status(404).json({ error: 'Coach profile not found' });

    const currentItems = safeParse(coachProfile[type]) || [];
    currentItems.push({ ...item, id: uuidv4() });

    await coachProfile.update({ [type]: JSON.stringify(currentItems) });
    res.json({ [type]: currentItems });
  } catch (error) {
    console.error('Error adding item:', error);
    res.status(500).json({ error: 'Failed to add item' });
  }
};

// ==============================
// REMOVE Item (certification/education)
// ==============================
const removeItem = async (req, res) => {
  try {
    const { type, id } = req.body;
    const userId = req.user.id;
    const coachProfile = await CoachProfile.findOne({ where: { userId } });
    if (!coachProfile) return res.status(404).json({ error: 'Coach profile not found' });

    const currentItems = (safeParse(coachProfile[type]) || []).filter(item => item.id !== id);
    await coachProfile.update({ [type]: JSON.stringify(currentItems) });
    res.json({ [type]: currentItems });
  } catch (error) {
    console.error('Error removing item:', error);
    res.status(500).json({ error: 'Failed to remove item' });
  }
};

// ==============================
// UPLOAD Profile Picture
// ==============================
const uploadProfilePicture = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const userId = req.user.id;
    const coachProfile = await CoachProfile.findOne({ where: { userId } });
    if (!coachProfile) return res.status(404).json({ error: 'Coach profile not found' });

    const filePath = `/uploads/${req.file.filename}`;
    await coachProfile.update({ profilePicture: filePath });

    res.json({ profilePicture: filePath });
  } catch (error) {
    console.error('Error uploading profile picture:', error);
    res.status(500).json({ error: 'Failed to upload profile picture' });
  }
};

// ==============================
// GET Public Coach Profile
// ==============================
const getPublicCoachProfile = async (req, res) => {
  try {
    const coachId = req.params.id;

    const coachProfile = await CoachProfile.findOne({
      where: { userId: coachId },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email', 'phone'],
          include: [
            { model: Event, as: 'events', required: false, where: { status: 'published' } }
          ]
        },
        { model: Testimonial, as: 'testimonials', required: false }
      ]
    });

    if (!coachProfile || !coachProfile.user) {
      return res.status(404).json({ error: 'Coach profile not found' });
    }

    const user = coachProfile.user.get({ plain: true });
    res.status(200).json({
      coach: {
        id: user.id,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        phone: user.phone,
        profileImage: coachProfile.profilePicture,
        events: user.events || [],
        testimonials: coachProfile.testimonials || [],
        title: coachProfile.professionalTitle,
        rating: 4.9,
        totalReviews: coachProfile.testimonials?.length || 0,
        totalClients: 0,
        yearsExperience: coachProfile.yearsOfExperience || 0,
        shortBio: coachProfile.bio ? coachProfile.bio.substring(0, 150) + '...' : '',
        fullBio: coachProfile.bio || '',
        isAvailable: true,
        avgResponseTime: coachProfile.responseTime || 'within-4h',
        timezone: coachProfile.availability?.timezone || 'UTC',
        startingPrice: coachProfile.pricing?.individual || 0,
      }
    });
  } catch (error) {
    console.error('Error fetching public coach profile:', error);
    res.status(500).json({ error: 'Failed to fetch public profile' });
  }
};

module.exports = {
  getCoachProfile,
  updateCoachProfile,
  addItem,
  removeItem,
  uploadProfilePicture,
  getPublicCoachProfile
};
