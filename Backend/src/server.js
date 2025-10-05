// 🚀 IMPORTANT: Load environment variables at the very top
require('dotenv').config();

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
const Event = require('./models/Event');
const Booking = require('./models/Booking');
const Session = require('./models/Session'); // 👈 ADDED
const Testimonial = require('./models/Testimonial'); // 👈 ADDED

// ==========================================
// Route Imports
// ==========================================
const authRoutes = require('./routes/auth');
const eventRoutes = require('./routes/events');

const app = express();

// ==========================================
// Middlewares
// ==========================================
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
};

app.use(cors(corsOptions));

// Configure Helmet to be less restrictive with cross-origin requests
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);

app.use(express.json());
app.use(cookieParser());

// ==========================================
// Model Associations
// ==========================================
User.hasOne(ClientProfile, { foreignKey: 'userId', onDelete: 'CASCADE' });
ClientProfile.belongsTo(User, { foreignKey: 'userId' });

User.hasOne(CoachProfile, { foreignKey: 'userId', onDelete: 'CASCADE' });
CoachProfile.belongsTo(User, { foreignKey: 'userId' });

// 👇 ADDED new associations for Sessions and Testimonials
CoachProfile.hasMany(Session, { foreignKey: 'coachProfileId', onDelete: 'CASCADE' });
Session.belongsTo(CoachProfile, { foreignKey: 'coachProfileId' });

CoachProfile.hasMany(Testimonial, { foreignKey: 'coachProfileId', onDelete: 'CASCADE' });
Testimonial.belongsTo(CoachProfile, { foreignKey: 'coachProfileId' });
// 👆 END of new associations

User.hasMany(Event, { foreignKey: 'coachId' });
Event.belongsTo(User, { as: 'coach', foreignKey: 'coachId' });

User.hasMany(Booking, { foreignKey: 'clientId' });
Booking.belongsTo(User, { as: 'client', foreignKey: 'clientId' });

Event.hasMany(Booking, { foreignKey: 'eventId' });
Booking.belongsTo(Event, { foreignKey: 'eventId' });

// ==========================================
// API Routes
// ==========================================
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
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
    
    // Using { alter: true } is great for development as it tries to update
    // tables to match the models without dropping them.
    await sequelize.sync({ force: true }); 
    console.log('✅ Database synchronized');

    app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));
  } catch (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
})();