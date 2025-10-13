console.log('====================================');
console.log('🚀 FAYRELANE SERVER STARTING...');
console.log('====================================');
console.log('Node version:', process.version);
console.log('Working directory:', process.cwd());
console.log('====================================');

// Core dependencies
console.log('🔧 Loading core dependencies...');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();
console.log('✅ Core dependencies loaded');

// Config
console.log('🔧 Loading configuration...');
const { connectDB } = require('./config/database');
const { initializeSocket } = require('./config/socket');
console.log('✅ Configuration loaded');

// Routes
console.log('🔧 Loading routes...');
const authRoutes = require('./routes/auth');
const listingRoutes = require('./routes/listings');
const messageRoutes = require('./routes/messages');
const paymentRoutes = require('./routes/payments');
const userRoutes = require('./routes/users');
const adminRoutes = require('./routes/admin');
const shippingRoutes = require('./routes/shipping');
console.log('✅ All routes loaded');

// Initialize app
console.log('🔧 Initializing Express app...');
const app = express();
const PORT = process.env.PORT || 5000;
const SERVER_START_TIME = Date.now(); // Track server start time for uptime
console.log(`✅ Express app initialized. Port: ${PORT}`);
console.log(`📊 NODE_ENV: ${process.env.NODE_ENV || 'not set'}`);
console.log(`🔑 DATABASE_URL: ${process.env.DATABASE_URL ? 'configured' : 'not configured'}`);
console.log(`🔑 JWT_SECRET: ${process.env.JWT_SECRET ? 'configured' : 'not configured'}`);

// ----------------------
// Healthcheck (Before any middleware)
// ----------------------
app.get('/health', (req, res) => {
    const uptime = Math.floor((Date.now() - SERVER_START_TIME) / 1000);
    res.status(200).json({
        status: 'ok',
        uptime: uptime,
        timestamp: new Date().toISOString()
    });
});

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
const allowedOrigins = [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    'https://healthcheck.railway.app', // Railway healthcheck
    'http://healthcheck.railway.app'   // Railway healthcheck (http)
];

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps, Postman, or healthchecks)
        if (!origin) return callback(null, true);

        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(null, true); // Allow all in production for now
        }
    },
    credentials: true
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
app.use(morgan('combined'));

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
    console.log('====================================');
    console.log('📡 STARTING SERVER...');
    console.log('====================================');

    try {
        const PORT = process.env.PORT || 5000;
        console.log(`🔧 Using port: ${PORT}`);

        // Try to connect to database, but don't fail if it's not available
        if (process.env.DATABASE_URL) {
            console.log('🔧 Attempting database connection...');
            try {
                await connectDB();
            } catch (error) {
                console.warn('⚠️  Database connection failed, but server will continue:', error.message);
                console.warn('⚠️  Database-dependent features will not work until DATABASE_URL is configured');
            }
        } else {
            console.warn('⚠️  DATABASE_URL not configured. Database features will not be available.');
        }

        console.log(`🔧 Starting Express server on 0.0.0.0:${PORT}...`);
        const server = app.listen(PORT, '0.0.0.0', () => {
            console.log('====================================');
            console.log(`✅ SERVER SUCCESSFULLY STARTED!`);
            console.log(`🚀 Server running on port ${PORT}`);
            console.log(`📊 Environment: ${process.env.NODE_ENV}`);
            console.log(`🏥 Health check: http://0.0.0.0:${PORT}/health`);
            console.log('====================================');
        });

        // Initialize Socket.IO
        console.log('🔧 Initializing Socket.IO...');
        try {
            if (process.env.JWT_SECRET) {
                initializeSocket(server);
                console.log('✅ Socket.IO initialized');
            } else {
                console.warn('⚠️  JWT_SECRET not set. Socket.IO features disabled.');
            }
        } catch (error) {
            console.warn('⚠️  Socket.IO initialization failed:', error.message);
            console.warn('⚠️  Real-time messaging will not work');
        }
    } catch (error) {
        console.error('====================================');
        console.error('❌ FATAL ERROR: Failed to start server');
        console.error('====================================');
        console.error('Error details:', error);
        console.error('Stack trace:', error.stack);
        console.error('====================================');
        process.exit(1);
    }
};

console.log('🔧 Calling startServer()...');
startServer();

module.exports = app;
