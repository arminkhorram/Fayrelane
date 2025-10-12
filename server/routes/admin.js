const express = require('express');
const { query } = require('../config/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { validateId, validatePagination } = require('../middleware/validation');

const router = express.Router();

// Apply admin authentication to all routes
router.use(authenticateToken, requireAdmin);

// Get dashboard stats
router.get('/dashboard', async (req, res) => {
    try {
        // Get total users
        const usersResult = await query(`
      SELECT 
        COUNT(*) as total_users,
        COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as new_users_30d,
        COUNT(CASE WHEN role = 'buyer' THEN 1 END) as buyers,
        COUNT(CASE WHEN role = 'seller' THEN 1 END) as sellers
      FROM users
      WHERE is_active = true
    `);

        // Get total listings
        const listingsResult = await query(`
      SELECT 
        COUNT(*) as total_listings,
        COUNT(CASE WHEN is_active = true THEN 1 END) as active_listings,
        COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as new_listings_30d
      FROM listings
    `);

        // Get total orders and revenue
        const ordersResult = await query(`
      SELECT 
        COUNT(*) as total_orders,
        COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as orders_30d,
        COALESCE(SUM(amount), 0) as total_revenue,
        COALESCE(SUM(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '30 days' THEN amount ELSE 0 END), 0) as revenue_30d
      FROM orders
      WHERE status = 'completed'
    `);

        // Get recent activity
        const recentActivity = await query(`
      SELECT 
        'user_registration' as type,
        u.first_name || ' ' || u.last_name as description,
        u.created_at as timestamp
      FROM users u
      WHERE u.created_at >= CURRENT_DATE - INTERVAL '7 days'
      
      UNION ALL
      
      SELECT 
        'listing_created' as type,
        l.title as description,
        l.created_at as timestamp
      FROM listings l
      WHERE l.created_at >= CURRENT_DATE - INTERVAL '7 days'
      
      UNION ALL
      
      SELECT 
        'order_completed' as type,
        'Order #' || o.id as description,
        o.created_at as timestamp
      FROM orders o
      WHERE o.created_at >= CURRENT_DATE - INTERVAL '7 days'
      
      ORDER BY timestamp DESC
      LIMIT 20
    `);

        const stats = {
            users: {
                total: parseInt(usersResult.rows[0].total_users),
                new30d: parseInt(usersResult.rows[0].new_users_30d),
                buyers: parseInt(usersResult.rows[0].buyers),
                sellers: parseInt(usersResult.rows[0].sellers)
            },
            listings: {
                total: parseInt(listingsResult.rows[0].total_listings),
                active: parseInt(listingsResult.rows[0].active_listings),
                new30d: parseInt(listingsResult.rows[0].new_listings_30d)
            },
            orders: {
                total: parseInt(ordersResult.rows[0].total_orders),
                total30d: parseInt(ordersResult.rows[0].orders_30d),
                revenue: parseFloat(ordersResult.rows[0].total_revenue),
                revenue30d: parseFloat(ordersResult.rows[0].revenue_30d)
            },
            recentActivity: recentActivity.rows.map(row => ({
                type: row.type,
                description: row.description,
                timestamp: row.timestamp
            }))
        };

        res.json({ stats });
    } catch (error) {
        console.error('Get dashboard stats error:', error);
        res.status(500).json({ message: 'Failed to fetch dashboard stats' });
    }
});

// Get all users with pagination
router.get('/users', validatePagination, async (req, res) => {
    try {
        const { page = 1, limit = 20, search, role, status } = req.query;
        const offset = (page - 1) * limit;

        let whereConditions = [];
        let queryParams = [];
        let paramCount = 0;

        if (search) {
            paramCount++;
            whereConditions.push(`(u.first_name ILIKE $${paramCount} OR u.last_name ILIKE $${paramCount} OR u.email ILIKE $${paramCount})`);
            queryParams.push(`%${search}%`);
        }

        if (role) {
            paramCount++;
            whereConditions.push(`u.role = $${paramCount}`);
            queryParams.push(role);
        }

        if (status === 'active') {
            whereConditions.push(`u.is_active = true`);
        } else if (status === 'inactive') {
            whereConditions.push(`u.is_active = false`);
        }

        const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

        // Get total count
        const countResult = await query(`
      SELECT COUNT(*) as total
      FROM users u
      ${whereClause}
    `, queryParams);

        const total = parseInt(countResult.rows[0].total);

        // Get users
        const usersResult = await query(`
      SELECT 
        u.id, u.email, u.first_name, u.last_name, u.role, u.is_active,
        u.created_at, u.updated_at,
        COUNT(l.id) as listing_count,
        COUNT(o.id) as order_count
      FROM users u
      LEFT JOIN listings l ON u.id = l.seller_id
      LEFT JOIN orders o ON (u.id = o.buyer_id OR u.id = o.seller_id)
      ${whereClause}
      GROUP BY u.id
      ORDER BY u.created_at DESC
      LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
    `, [...queryParams, parseInt(limit), offset]);

        const users = usersResult.rows.map(row => ({
            id: row.id,
            email: row.email,
            firstName: row.first_name,
            lastName: row.last_name,
            role: row.role,
            isActive: row.is_active,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
            stats: {
                listingCount: parseInt(row.listing_count),
                orderCount: parseInt(row.order_count)
            }
        }));

        res.json({
            users,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ message: 'Failed to fetch users' });
    }
});

// Get user details
router.get('/users/:id', validateId, async (req, res) => {
    try {
        const { id } = req.params;

        const userResult = await query(`
      SELECT 
        u.id, u.email, u.first_name, u.last_name, u.role, u.is_active,
        u.created_at, u.updated_at,
        COUNT(l.id) as listing_count,
        COUNT(o.id) as order_count,
        COALESCE(AVG(r.rating), 0) as average_rating,
        COUNT(r.id) as review_count
      FROM users u
      LEFT JOIN listings l ON u.id = l.seller_id
      LEFT JOIN orders o ON (u.id = o.buyer_id OR u.id = o.seller_id)
      LEFT JOIN reviews r ON u.id = r.seller_id
      WHERE u.id = $1
      GROUP BY u.id
    `, [id]);

        if (userResult.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const user = userResult.rows[0];
        res.json({
            id: user.id,
            email: user.email,
            firstName: user.first_name,
            lastName: user.last_name,
            role: user.role,
            isActive: user.is_active,
            createdAt: user.created_at,
            updatedAt: user.updated_at,
            stats: {
                listingCount: parseInt(user.listing_count),
                orderCount: parseInt(user.order_count),
                averageRating: parseFloat(user.average_rating),
                reviewCount: parseInt(user.review_count)
            }
        });
    } catch (error) {
        console.error('Get user details error:', error);
        res.status(500).json({ message: 'Failed to fetch user details' });
    }
});

// Update user status
router.put('/users/:id/status', validateId, async (req, res) => {
    try {
        const { id } = req.params;
        const { isActive } = req.body;

        if (typeof isActive !== 'boolean') {
            return res.status(400).json({ message: 'isActive must be a boolean' });
        }

        const result = await query(`
      UPDATE users 
      SET is_active = $1, updated_at = $2
      WHERE id = $3
      RETURNING id, email, first_name, last_name, role, is_active, updated_at
    `, [isActive, new Date(), id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const user = result.rows[0];
        res.json({
            message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
            user: {
                id: user.id,
                email: user.email,
                firstName: user.first_name,
                lastName: user.last_name,
                role: user.role,
                isActive: user.is_active,
                updatedAt: user.updated_at
            }
        });
    } catch (error) {
        console.error('Update user status error:', error);
        res.status(500).json({ message: 'Failed to update user status' });
    }
});

// Get all listings with admin filters
router.get('/listings', validatePagination, async (req, res) => {
    try {
        const { page = 1, limit = 20, search, category, status } = req.query;
        const offset = (page - 1) * limit;

        let whereConditions = [];
        let queryParams = [];
        let paramCount = 0;

        if (search) {
            paramCount++;
            whereConditions.push(`(l.title ILIKE $${paramCount} OR l.description ILIKE $${paramCount})`);
            queryParams.push(`%${search}%`);
        }

        if (category) {
            paramCount++;
            whereConditions.push(`l.category = $${paramCount}`);
            queryParams.push(category);
        }

        if (status === 'active') {
            whereConditions.push(`l.is_active = true`);
        } else if (status === 'inactive') {
            whereConditions.push(`l.is_active = false`);
        }

        const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

        // Get total count
        const countResult = await query(`
      SELECT COUNT(*) as total
      FROM listings l
      JOIN users u ON l.seller_id = u.id
      ${whereClause}
    `, queryParams);

        const total = parseInt(countResult.rows[0].total);

        // Get listings
        const listingsResult = await query(`
      SELECT 
        l.id, l.title, l.description, l.price, l.category, l.condition,
        l.make, l.model, l.year, l.images, l.is_active, l.created_at, l.updated_at,
        u.id as seller_id, u.first_name as seller_first_name, u.last_name as seller_last_name, u.email as seller_email
      FROM listings l
      JOIN users u ON l.seller_id = u.id
      ${whereClause}
      ORDER BY l.created_at DESC
      LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
    `, [...queryParams, parseInt(limit), offset]);

        const listings = listingsResult.rows.map(row => ({
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
            isActive: row.is_active,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
            seller: {
                id: row.seller_id,
                firstName: row.seller_first_name,
                lastName: row.seller_last_name,
                email: row.seller_email
            }
        }));

        res.json({
            listings,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get admin listings error:', error);
        res.status(500).json({ message: 'Failed to fetch listings' });
    }
});

// Update listing status
router.put('/listings/:id/status', validateId, async (req, res) => {
    try {
        const { id } = req.params;
        const { isActive } = req.body;

        if (typeof isActive !== 'boolean') {
            return res.status(400).json({ message: 'isActive must be a boolean' });
        }

        const result = await query(`
      UPDATE listings 
      SET is_active = $1, updated_at = $2
      WHERE id = $3
      RETURNING id, title, is_active, updated_at
    `, [isActive, new Date(), id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Listing not found' });
        }

        const listing = result.rows[0];
        res.json({
            message: `Listing ${isActive ? 'activated' : 'deactivated'} successfully`,
            listing: {
                id: listing.id,
                title: listing.title,
                isActive: listing.is_active,
                updatedAt: listing.updated_at
            }
        });
    } catch (error) {
        console.error('Update listing status error:', error);
        res.status(500).json({ message: 'Failed to update listing status' });
    }
});

// Get all orders
router.get('/orders', validatePagination, async (req, res) => {
    try {
        const { page = 1, limit = 20, status } = req.query;
        const offset = (page - 1) * limit;

        let whereConditions = [];
        let queryParams = [];
        let paramCount = 0;

        if (status) {
            paramCount++;
            whereConditions.push(`o.status = $${paramCount}`);
            queryParams.push(status);
        }

        const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

        // Get total count
        const countResult = await query(`
      SELECT COUNT(*) as total
      FROM orders o
      ${whereClause}
    `, queryParams);

        const total = parseInt(countResult.rows[0].total);

        // Get orders
        const ordersResult = await query(`
      SELECT 
        o.id, o.amount, o.currency, o.status, o.created_at,
        l.title as listing_title,
        buyer.first_name as buyer_first_name, buyer.last_name as buyer_last_name, buyer.email as buyer_email,
        seller.first_name as seller_first_name, seller.last_name as seller_last_name, seller.email as seller_email
      FROM orders o
      JOIN listings l ON o.listing_id = l.id
      JOIN users buyer ON o.buyer_id = buyer.id
      JOIN users seller ON o.seller_id = seller.id
      ${whereClause}
      ORDER BY o.created_at DESC
      LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
    `, [...queryParams, parseInt(limit), offset]);

        const orders = ordersResult.rows.map(row => ({
            id: row.id,
            amount: parseFloat(row.amount),
            currency: row.currency,
            status: row.status,
            createdAt: row.created_at,
            listing: {
                title: row.listing_title
            },
            buyer: {
                firstName: row.buyer_first_name,
                lastName: row.buyer_last_name,
                email: row.buyer_email
            },
            seller: {
                firstName: row.seller_first_name,
                lastName: row.seller_last_name,
                email: row.seller_email
            }
        }));

        res.json({
            orders,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get admin orders error:', error);
        res.status(500).json({ message: 'Failed to fetch orders' });
    }
});

// Get disputes
router.get('/disputes', validatePagination, async (req, res) => {
    try {
        const { page = 1, limit = 20, status } = req.query;
        const offset = (page - 1) * limit;

        let whereConditions = [];
        let queryParams = [];
        let paramCount = 0;

        if (status) {
            paramCount++;
            whereConditions.push(`d.status = $${paramCount}`);
            queryParams.push(status);
        }

        const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

        // Get total count
        const countResult = await query(`
      SELECT COUNT(*) as total
      FROM disputes d
      ${whereClause}
    `, queryParams);

        const total = parseInt(countResult.rows[0].total);

        // Get disputes
        const disputesResult = await query(`
      SELECT 
        d.id, d.reason, d.description, d.status, d.created_at, d.resolved_at,
        o.id as order_id, o.amount,
        l.title as listing_title,
        buyer.first_name as buyer_first_name, buyer.last_name as buyer_last_name,
        seller.first_name as seller_first_name, seller.last_name as seller_last_name
      FROM disputes d
      JOIN orders o ON d.order_id = o.id
      JOIN listings l ON o.listing_id = l.id
      JOIN users buyer ON o.buyer_id = buyer.id
      JOIN users seller ON o.seller_id = seller.id
      ${whereClause}
      ORDER BY d.created_at DESC
      LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
    `, [...queryParams, parseInt(limit), offset]);

        const disputes = disputesResult.rows.map(row => ({
            id: row.id,
            reason: row.reason,
            description: row.description,
            status: row.status,
            createdAt: row.created_at,
            resolvedAt: row.resolved_at,
            order: {
                id: row.order_id,
                amount: parseFloat(row.amount),
                listingTitle: row.listing_title
            },
            buyer: {
                firstName: row.buyer_first_name,
                lastName: row.buyer_last_name
            },
            seller: {
                firstName: row.seller_first_name,
                lastName: row.seller_last_name
            }
        }));

        res.json({
            disputes,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get disputes error:', error);
        res.status(500).json({ message: 'Failed to fetch disputes' });
    }
});

// Resolve dispute
router.put('/disputes/:id/resolve', validateId, async (req, res) => {
    try {
        const { id } = req.params;
        const { resolution, status } = req.body;

        if (!['resolved', 'rejected'].includes(status)) {
            return res.status(400).json({ message: 'Status must be resolved or rejected' });
        }

        const result = await query(`
      UPDATE disputes 
      SET status = $1, resolution = $2, resolved_at = $3, resolved_by = $4
      WHERE id = $5
      RETURNING id, status, resolution, resolved_at
    `, [status, resolution, new Date(), req.user.id, id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Dispute not found' });
        }

        const dispute = result.rows[0];
        res.json({
            message: 'Dispute resolved successfully',
            dispute: {
                id: dispute.id,
                status: dispute.status,
                resolution: dispute.resolution,
                resolvedAt: dispute.resolved_at
            }
        });
    } catch (error) {
        console.error('Resolve dispute error:', error);
        res.status(500).json({ message: 'Failed to resolve dispute' });
    }
});

module.exports = router;





