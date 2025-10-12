const express = require('express');
const bcrypt = require('bcryptjs');
const { query } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { validateReview, validateId, validatePagination } = require('../middleware/validation');

const router = express.Router();

// Get user profile
router.get('/profile', authenticateToken, async (req, res) => {
    try {
        const result = await query(`
      SELECT 
        u.id, u.email, u.first_name, u.last_name, u.role, u.created_at,
        COALESCE(AVG(r.rating), 0) as average_rating,
        COUNT(r.id) as review_count,
        COUNT(l.id) as listing_count,
        COUNT(o.id) as order_count
      FROM users u
      LEFT JOIN reviews r ON u.id = r.seller_id
      LEFT JOIN listings l ON u.id = l.seller_id AND l.is_active = true
      LEFT JOIN orders o ON (u.id = o.buyer_id OR u.id = o.seller_id)
      WHERE u.id = $1
      GROUP BY u.id
    `, [req.user.id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const user = result.rows[0];
        res.json({
            id: user.id,
            email: user.email,
            firstName: user.first_name,
            lastName: user.last_name,
            role: user.role,
            createdAt: user.created_at,
            stats: {
                averageRating: parseFloat(user.average_rating),
                reviewCount: parseInt(user.review_count),
                listingCount: parseInt(user.listing_count),
                orderCount: parseInt(user.order_count)
            }
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ message: 'Failed to fetch profile' });
    }
});

// Get public user profile
router.get('/:id', validateId, async (req, res) => {
    try {
        const { id } = req.params;

        const result = await query(`
      SELECT 
        u.id, u.first_name, u.last_name, u.created_at,
        COALESCE(AVG(r.rating), 0) as average_rating,
        COUNT(r.id) as review_count,
        COUNT(l.id) as listing_count
      FROM users u
      LEFT JOIN reviews r ON u.id = r.seller_id
      LEFT JOIN listings l ON u.id = l.seller_id AND l.is_active = true
      WHERE u.id = $1 AND u.is_active = true
      GROUP BY u.id
    `, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const user = result.rows[0];
        res.json({
            id: user.id,
            firstName: user.first_name,
            lastName: user.last_name,
            createdAt: user.created_at,
            stats: {
                averageRating: parseFloat(user.average_rating),
                reviewCount: parseInt(user.review_count),
                listingCount: parseInt(user.listing_count)
            }
        });
    } catch (error) {
        console.error('Get public profile error:', error);
        res.status(500).json({ message: 'Failed to fetch user profile' });
    }
});

// Update user profile
router.put('/profile', authenticateToken, async (req, res) => {
    try {
        const { firstName, lastName, currentPassword, newPassword } = req.body;

        let updateFields = [];
        let queryParams = [];
        let paramCount = 0;

        // Update basic info
        if (firstName) {
            paramCount++;
            updateFields.push(`first_name = $${paramCount}`);
            queryParams.push(firstName);
        }

        if (lastName) {
            paramCount++;
            updateFields.push(`last_name = $${paramCount}`);
            queryParams.push(lastName);
        }

        // Update password if provided
        if (currentPassword && newPassword) {
            // Verify current password
            const userResult = await query(
                'SELECT password FROM users WHERE id = $1',
                [req.user.id]
            );

            if (userResult.rows.length === 0) {
                return res.status(404).json({ message: 'User not found' });
            }

            const isValidPassword = await bcrypt.compare(currentPassword, userResult.rows[0].password);
            if (!isValidPassword) {
                return res.status(400).json({ message: 'Current password is incorrect' });
            }

            // Hash new password
            const saltRounds = 12;
            const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

            paramCount++;
            updateFields.push(`password = $${paramCount}`);
            queryParams.push(hashedPassword);
        }

        if (updateFields.length === 0) {
            return res.status(400).json({ message: 'No fields to update' });
        }

        // Add updated_at
        paramCount++;
        updateFields.push(`updated_at = $${paramCount}`);
        queryParams.push(new Date());

        // Add user ID
        paramCount++;
        queryParams.push(req.user.id);

        const result = await query(`
      UPDATE users 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING id, email, first_name, last_name, role, updated_at
    `, queryParams);

        const user = result.rows[0];
        res.json({
            message: 'Profile updated successfully',
            user: {
                id: user.id,
                email: user.email,
                firstName: user.first_name,
                lastName: user.last_name,
                role: user.role,
                updatedAt: user.updated_at
            }
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ message: 'Profile update failed' });
    }
});

// Get user's reviews
router.get('/:id/reviews', validateId, validatePagination, async (req, res) => {
    try {
        const { id } = req.params;
        const { page = 1, limit = 20 } = req.query;
        const offset = (page - 1) * limit;

        const result = await query(`
      SELECT 
        r.id, r.rating, r.comment, r.created_at,
        buyer.first_name as buyer_first_name,
        buyer.last_name as buyer_last_name,
        l.title as listing_title
      FROM reviews r
      JOIN users buyer ON r.buyer_id = buyer.id
      JOIN orders o ON r.order_id = o.id
      JOIN listings l ON o.listing_id = l.id
      WHERE r.seller_id = $1
      ORDER BY r.created_at DESC
      LIMIT $2 OFFSET $3
    `, [id, parseInt(limit), offset]);

        const reviews = result.rows.map(row => ({
            id: row.id,
            rating: row.rating,
            comment: row.comment,
            createdAt: row.created_at,
            buyer: {
                firstName: row.buyer_first_name,
                lastName: row.buyer_last_name
            },
            listing: {
                title: row.listing_title
            }
        }));

        res.json({ reviews });
    } catch (error) {
        console.error('Get user reviews error:', error);
        res.status(500).json({ message: 'Failed to fetch reviews' });
    }
});

// Create review
router.post('/:id/reviews', authenticateToken, validateId, validateReview, async (req, res) => {
    try {
        const { id } = req.params;
        const { rating, comment, orderId } = req.body;

        // Verify order exists and user is the buyer
        const orderResult = await query(`
      SELECT o.id, o.seller_id, l.title
      FROM orders o
      JOIN listings l ON o.listing_id = l.id
      WHERE o.id = $1 AND o.buyer_id = $2 AND o.status = 'completed'
    `, [orderId, req.user.id]);

        if (orderResult.rows.length === 0) {
            return res.status(404).json({ message: 'Order not found or not completed' });
        }

        const order = orderResult.rows[0];

        // Verify seller ID matches
        if (parseInt(id) !== order.seller_id) {
            return res.status(400).json({ message: 'Invalid seller ID' });
        }

        // Check if review already exists
        const existingReview = await query(
            'SELECT id FROM reviews WHERE order_id = $1 AND buyer_id = $2',
            [orderId, req.user.id]
        );

        if (existingReview.rows.length > 0) {
            return res.status(400).json({ message: 'Review already exists for this order' });
        }

        // Create review
        const reviewResult = await query(`
      INSERT INTO reviews (order_id, buyer_id, seller_id, rating, comment, created_at)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, rating, comment, created_at
    `, [orderId, req.user.id, id, rating, comment, new Date()]);

        const review = reviewResult.rows[0];
        res.status(201).json({
            message: 'Review created successfully',
            review: {
                id: review.id,
                rating: review.rating,
                comment: review.comment,
                createdAt: review.created_at
            }
        });
    } catch (error) {
        console.error('Create review error:', error);
        res.status(500).json({ message: 'Failed to create review' });
    }
});

// Get user's listings
router.get('/:id/listings', validateId, validatePagination, async (req, res) => {
    try {
        const { id } = req.params;
        const { page = 1, limit = 20 } = req.query;
        const offset = (page - 1) * limit;

        const result = await query(`
      SELECT 
        id, title, description, price, category, condition,
        make, model, year, images, shipping_info, is_active,
        created_at, updated_at
      FROM listings
      WHERE seller_id = $1
      ORDER BY created_at DESC
      LIMIT $2 OFFSET $3
    `, [id, parseInt(limit), offset]);

        const listings = result.rows.map(row => ({
            id: row.id,
            title: row.title,
            description: row.description,
            price: parseFloat(row.price),
            category: row.category,
            condition: row.condition,
            make: row.make,
            model: row.model,
            year: row.year,
            images: JSON.parse(row.images || '[]'),
            shippingInfo: row.shipping_info ? JSON.parse(row.shipping_info) : null,
            isActive: row.is_active,
            createdAt: row.created_at,
            updatedAt: row.updated_at
        }));

        res.json({ listings });
    } catch (error) {
        console.error('Get user listings error:', error);
        res.status(500).json({ message: 'Failed to fetch user listings' });
    }
});

// Deactivate user account
router.delete('/account', authenticateToken, async (req, res) => {
    try {
        const { password } = req.body;

        if (!password) {
            return res.status(400).json({ message: 'Password is required to deactivate account' });
        }

        // Verify password
        const userResult = await query(
            'SELECT password FROM users WHERE id = $1',
            [req.user.id]
        );

        if (userResult.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const isValidPassword = await bcrypt.compare(password, userResult.rows[0].password);
        if (!isValidPassword) {
            return res.status(400).json({ message: 'Invalid password' });
        }

        // Deactivate account
        await query(
            'UPDATE users SET is_active = false, updated_at = $1 WHERE id = $2',
            [new Date(), req.user.id]
        );

        // Deactivate all user's listings
        await query(
            'UPDATE listings SET is_active = false, updated_at = $1 WHERE seller_id = $2',
            [new Date(), req.user.id]
        );

        res.json({ message: 'Account deactivated successfully' });
    } catch (error) {
        console.error('Deactivate account error:', error);
        res.status(500).json({ message: 'Failed to deactivate account' });
    }
});

module.exports = router;





