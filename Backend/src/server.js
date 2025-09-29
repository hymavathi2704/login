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
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.use(helmet());
app.use(express.json());
app.use(cookieParser());

// ==========================================
// Model Associations (Defined once for clarity)
// ==========================================
User.hasOne(ClientProfile, { foreignKey: 'userId', onDelete: 'CASCADE' });
ClientProfile.belongsTo(User, { foreignKey: 'userId' });

User.hasOne(CoachProfile, { foreignKey: 'userId', onDelete: 'CASCADE' });
CoachProfile.belongsTo(User, { foreignKey: 'userId' });

// Event and Booking relationships
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
// JWT Unauthorized Error Handling
// ==========================================
app.use((err, req, res, next) => {
  if (err instanceof UnauthorizedError) {
    if (process.env.NODE_ENV === 'development') {
      console.error('JWT Unauthorized Error:', err);
    }
    return res.status(401).json({ error: 'Unauthorized: Invalid or missing token' });
  }
  
  // General error handling
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

    // This will DROP all tables and recreate them based on your models.
    // It's necessary for applying the CHAR(36) schema change.
    await sequelize.sync({ force: true });
    console.log('✅ Database tables reset and synchronized successfully.');
    
    // IMPORTANT: After the first successful run, change { force: true } 
    // to { alter: true } or { force: false } for safety.

    app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));
  } catch (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
})();