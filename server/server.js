const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// Load environment variables
dotenv.config();

// Connect to Database
connectDB();

const app = express();

// Middleware
// In server.js
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173', // Will be your vercel.app URL
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static folder for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ================= API ROUTES =================

// Auth
app.use('/api/auth', require('./routes/authRoutes'));

// Core Modules
app.use('/api/members', require('./routes/memberRoutes'));
app.use('/api/vehicles', require('./routes/vehicleRoutes'));
app.use('/api/slots', require('./routes/slotRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));

// Secondary Modules
app.use('/api/removed-members', require('./routes/removedMemberRoutes'));
app.use('/api/settings', require('./routes/settingRoutes'));

// Analytics, Notifications & Reporting
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));

// ==============================================

// Root route
app.get('/', (req, res) => {
    res.status(200).json({
        status: 'OK',
        message: 'ParkMaster API Server is running',
        clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
        healthCheck: '/api/health'
    });
});

// Health Check
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'OK', message: 'ParkMaster API is running' });
});

// Error Handling Middleware (Must be after routes)
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`[ParkMaster] Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});