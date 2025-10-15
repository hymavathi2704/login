// 🚀 Load environment variables first
require('dotenv').config();
const path = require('path'); 
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const { UnauthorizedError } = require('express-jwt');
const sequelize = require('./config/db.js');

// ==========================================
// Model Imports
// ==========================================
const User = require('./models/user');
const CoachProfile = require('./models/CoachProfile');
const ClientProfile = require('./models/ClientProfile');
// 🚨 REMOVED: const Event = require('./models/Event'); 
const Booking = require('./models/Booking');
const Session = require('./models/Session');
const Testimonial = require('./models/Testimonial');
const Follow = require('./models/Follow'); 

// ==========================================
// Route Imports
// ==========================================
const authRoutes = require('./routes/auth');
const eventRoutes = require('./routes/events');
const coachProfileRoutes = require('./routes/coachProfile');
const profileRoutes = require('./routes/fetchCoachProfiles');
const clientProfileRoutes = require('./routes/clientProfile'); 

const app = express();



// ==========================================

// Middlewares

// ==========================================

const corsOptions = {

    origin: process.env.FRONTEND_URL || 'http://localhost:5173',

    credentials: true,

    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],

    allowedHeaders: ['Content-Type', 'Authorization'],

};

app.use(cors(corsOptions));



app.use(

    helmet({

        crossOriginResourcePolicy: false,

    })

);



app.use(express.json({ limit: '5mb' }));



app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));



app.use(cookieParser());


// ==========================================
// Model Associations (Cleaned for Sessions-Only)
// ==========================================
// User <-> ClientProfile
User.hasOne(ClientProfile, { foreignKey: 'userId', onDelete: 'CASCADE', as: 'ClientProfile' });
ClientProfile.belongsTo(User, { foreignKey: 'userId', as: 'ClientProfile' });

// User <-> CoachProfile
User.hasOne(CoachProfile, { foreignKey: 'userId', onDelete: 'CASCADE', as: 'CoachProfile' });
CoachProfile.belongsTo(User, { foreignKey: 'userId', as: 'user' }); 

// CoachProfile <-> Session (Services offered)
CoachProfile.hasMany(Session, { foreignKey: 'coachProfileId', onDelete: 'CASCADE', as: 'sessions' });
Session.belongsTo(CoachProfile, { foreignKey: 'coachProfileId', as: 'coachProfile' });

// Session <-> Booking (CRITICAL NEW ASSOCIATION)
Session.hasMany(Booking, { foreignKey: 'sessionId', onDelete: 'CASCADE', as: 'bookings' });
Booking.belongsTo(Session, { foreignKey: 'sessionId', as: 'Session' }); 

// CoachProfile <-> Testimonial (Testimonials RECEIVED)
CoachProfile.hasMany(Testimonial, { foreignKey: 'coachProfileId', onDelete: 'CASCADE', as: 'testimonials' });
Testimonial.belongsTo(CoachProfile, { foreignKey: 'coachProfileId', as: 'coachProfile' });

// NEW ASSOCIATION: User <-> Testimonial (Testimonials WRITTEN by client)
User.hasMany(Testimonial, { foreignKey: 'clientId', onDelete: 'SET NULL', as: 'writtenTestimonials' }); 
Testimonial.belongsTo(User, { foreignKey: 'clientId', as: 'clientUser' });

// 🚨 REMOVED: Event associations (User <-> Event and Event <-> Booking)

// User <-> Booking (Client's bookings)
User.hasMany(Booking, { foreignKey: 'clientId', as: 'bookings' });
Booking.belongsTo(User, { foreignKey: 'clientId', as: 'client' });

// NEW ASSOCIATIONS: User <-> Follow (Client follows Coach)
User.hasMany(Follow, { foreignKey: 'followerId', onDelete: 'CASCADE', as: 'followingRecords' });
Follow.belongsTo(User, { foreignKey: 'followerId', as: 'followerUser' });

User.hasMany(Follow, { foreignKey: 'followingId', onDelete: 'CASCADE', as: 'followedByRecords' });
Follow.belongsTo(User, { foreignKey: 'followingId', as: 'followingCoach' });

// ==========================================
// API Routes
// ==========================================
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes); // Route kept for backwards compatibility of client bookings route
app.use('/api/coach', coachProfileRoutes);
app.use('/api/profiles', profileRoutes);

// 🌟 NEW: Mount the client-specific routes here
app.use('/api/client', clientProfileRoutes); 

app.get('/', (req, res) => res.send('CoachFlow API running 🚀'));

// ==========================================
// Error Handling
// ==========================================
app.use((err, req, res, next) => {
    if (err instanceof UnauthorizedError) {
        console.error('JWT Unauthorized Error:', err);
        return res.status(401).json({ error: 'Unauthorized: Invalid or missing token' });
    }

    console.error('Unexpected Error:', err);
    return res.status(500).json({ error: 'Internal server error' });
});

// ==========================================
// Start Server and Sync Database
// ==========================================
const PORT = process.env.PORT || 4028;

(async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ Database connected');

        // 🚨 CRITICAL ACTION: Dropping old tables to fix the foreign key conflict.
        // REMOVE { force: true } AFTER THE FIRST SUCCESSFUL RUN!
        await sequelize.sync(); 
        console.log('✅ Database synchronized (FORCED)');

        app.listen(PORT, "0.0.0.0", () => console.log(`🚀 Server running at http://65.1.126.156:${PORT}`));

    } catch (err) {
        console.error('❌ Failed to start server:', err);
        process.exit(1);
    }
})();