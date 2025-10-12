const jwt = require('jsonwebtoken');
const { query } = require('../config/database');

// Verify JWT token
const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Access token required' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Get user from database to ensure they still exist
        const userResult = await query(
            'SELECT id, email, role, is_active FROM users WHERE id = $1',
            [decoded.userId]
        );

        if (userResult.rows.length === 0) {
            return res.status(401).json({ message: 'User not found' });
        }

        if (!userResult.rows[0].is_active) {
            return res.status(401).json({ message: 'Account is deactivated' });
        }

        req.user = userResult.rows[0];
        next();
    } catch (error) {
        return res.status(403).json({ message: 'Invalid or expired token' });
    }
};

// Check if user is admin
const requireAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Admin access required' });
    }
    next();
};

// Check if user is seller or admin
const requireSeller = (req, res, next) => {
    if (!['seller', 'admin'].includes(req.user.role)) {
        return res.status(403).json({ message: 'Seller access required' });
    }
    next();
};

// Optional authentication (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        req.user = null;
        return next();
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userResult = await query(
            'SELECT id, email, role, is_active FROM users WHERE id = $1',
            [decoded.userId]
        );

        if (userResult.rows.length > 0 && userResult.rows[0].is_active) {
            req.user = userResult.rows[0];
        } else {
            req.user = null;
        }
    } catch (error) {
        req.user = null;
    }

    next();
};

module.exports = {
    authenticateToken,
    requireAdmin,
    requireSeller,
    optionalAuth
};





