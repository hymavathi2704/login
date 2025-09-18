// Backend/src/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const sequelize = require('./config/db');
const authRoutes = require('./routes/auth');
const { UnauthorizedError } = require("express-jwt"); // Corrected import

const app = express();

// A more robust CORS configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Explicitly allow OPTIONS
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(helmet());
app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authRoutes);

// Error handling middleware for JWT errors
app.use((err, req, res, next) => {
  if (err instanceof UnauthorizedError) {
    console.error('JWT Unauthorized Error:', err.message);
    return res.status(401).json({ error: 'Unauthorized: Invalid or missing token' });
  }
  next(err);
});

app.get('/', (req, res) => res.send('CoachFlow auth API'));

const PORT = process.env.PORT || 4028;

(async () => {
  try {
    await sequelize.authenticate();
    console.log('DB connected');
    await sequelize.sync({ alter: true }); // Dev only
    app.listen(PORT, () => console.log(`Server running on ${PORT}`));
  } catch (err) {
    console.error('Failed to start', err);
  }
})();