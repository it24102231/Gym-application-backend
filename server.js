require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');
const connectDB = require('./config/db');

const app = express();

// Connect to Database
connectDB();

// ── CORS — allow all origins (required for Expo/mobile + Railway) ──
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Bypass-Tunnel-Reminder'],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Base Route
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Gym Management API is running', db: mongoose.connection.readyState === 1 ? 'connected' : 'connecting' });
});

// Health check for Railway
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Import Routes
const authRoutes       = require('./routes/authRoutes');
const packageRoutes    = require('./routes/packageRoutes');
const membershipRoutes = require('./routes/membershipRoutes');
const complaintRoutes  = require('./routes/complaintRoutes');
const feedbackRoutes   = require('./routes/feedbackRoutes');
const profileRoutes    = require('./routes/profileRoutes');
const trainerRoutes    = require('./routes/trainerRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const classRoutes = require('./routes/classRoutes');

// Use Routes
app.use('/api/auth',        authRoutes);
app.use('/api/packages',    packageRoutes);
app.use('/api/memberships', membershipRoutes);
app.use('/api/complaints',  complaintRoutes);
app.use('/api/feedback',    feedbackRoutes);
app.use('/api/profile',     profileRoutes);
app.use('/api/trainers',    trainerRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/classes',       classRoutes);

// Error Handler Middleware
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
