// Core dependencies
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

// Routes
const authRoutes = require('./routes/auth');
const listingRoutes = require('./routes/listings');
const messageRoutes = require('./routes/messages');
const paymentRoutes = require('./routes/payments');
const userRoutes = require('./routes/users');
const adminRoutes = require('./routes/admin');
const shippingRoutes = require('./routes/shipping');

// Config
const { connectDB } = require('./config/database');
const { initializeSocket } = require('./config/socket');

// Initialize app
const app = express();
const PORT = process.env.PORT || 5000;

// ----------------------
// Middleware & Security
// ----------------------
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per window
    message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// CORS
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
app.use(morgan('combined'));

// ----------------------
// Healthcheck
// ----------------------
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

// ----------------------
// API Routes
// ----------------------
app.use('/api/auth', authRoutes);
app.use('/api/listings', listingRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/shipping', shippingRoutes);

// ----------------------
// Error Handling
// ----------------------
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
});

// ----------------------
// Serve React build (for production)
// ----------------------
if (process.env.NODE_ENV === 'production') {
    // Serve frontend static files
    app.use(express.static(path.join(__dirname, '..', 'client', 'dist')));

    // Send all other routes to React index.html
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '..', 'client', 'dist', 'index.html'));
    });
} else {
    // Fallback 404 for development
    app.use('*', (req, res) => {
        res.status(404).json({ message: 'Route not found' });
    });
}

// ----------------------
// Start Server
// ----------------------
const startServer = async () => {
    try {
        const PORT = process.env.PORT || 5000;

        // Try to connect to database, but don't fail if it's not available
        if (process.env.DATABASE_URL) {
            try {
                await connectDB();
            } catch (error) {
                console.warn('⚠️  Database connection failed, but server will continue:', error.message);
                console.warn('⚠️  Database-dependent features will not work until DATABASE_URL is configured');
            }
        } else {
            console.warn('⚠️  DATABASE_URL not configured. Database features will not be available.');
        }

        const server = app.listen(PORT, '0.0.0.0', () => {
            console.log(`🚀 Server running on port ${PORT}`);
            console.log(`📊 Environment: ${process.env.NODE_ENV}`);
            console.log(`🏥 Health check available at /health`);
        });

        // Initialize Socket.IO
        initializeSocket(server);
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
};

startServer();

module.exports = app;
