const express = require('express');
const multer = require('multer');
// MIGRATED: AWS SDK v2 → v3 (2025-10-13)
// Old: const AWS = require('aws-sdk');
// New: Using modular @aws-sdk/client-s3 for better performance and smaller bundle size
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { query } = require('../config/database');
const { authenticateToken, requireSeller, optionalAuth } = require('../middleware/auth');
const { validateListing, validateId, validatePagination } = require('../middleware/validation');

const router = express.Router();

// Configure AWS S3 Client (v3)
// MIGRATED: AWS SDK v2 config → v3 client initialization
// v3 uses a more modular approach with explicit client configuration
const s3Client = new S3Client({
    region: process.env.AWS_REGION || 'us-east-1',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

// Configure multer for file uploads
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'), false);
        }
    }
});

// Upload image to S3
// MIGRATED: AWS SDK v2 s3.upload() → v3 PutObjectCommand (2025-10-13)
// v3 uses command-based architecture for better tree-shaking and modularity
const uploadToS3 = async (file, folder = 'listings') => {
    try {
        const key = `${folder}/${Date.now()}-${file.originalname}`;
        const params = {
            Bucket: process.env.AWS_S3_BUCKET,
            Key: key,
            Body: file.buffer,
            ContentType: file.mimetype,
            ACL: 'public-read'
        };

        // v3 uses client.send(new Command(params)) pattern
        await s3Client.send(new PutObjectCommand(params));

        // Construct the URL manually (v3 doesn't return Location by default)
        const region = process.env.AWS_REGION || 'us-east-1';
        const bucket = process.env.AWS_S3_BUCKET;
        const location = `https://${bucket}.s3.${region}.amazonaws.com/${key}`;

        return location;
    } catch (error) {
        console.error('S3 upload error:', error);
        throw new Error(`Failed to upload image to S3: ${error.message}`);
    }
};

// Get all listings with filters and pagination
router.get('/', optionalAuth, validatePagination, async (req, res) => {
    try {
        const {
            page = 1,
            limit = 20,
            category,
            make,
            model,
            year,
            minPrice,
            maxPrice,
            condition,
            search,
            sortBy = 'created_at',
            sortOrder = 'DESC'
        } = req.query;

        const offset = (page - 1) * limit;
        let whereConditions = ['l.is_active = true'];
        let queryParams = [];
        let paramCount = 0;

        // Build dynamic WHERE clause
        if (category) {
            paramCount++;
            whereConditions.push(`l.category = $${paramCount}`);
            queryParams.push(category);
        }

        if (make) {
            paramCount++;
            whereConditions.push(`LOWER(l.make) = LOWER($${paramCount})`);
            queryParams.push(make);
        }

        if (model) {
            paramCount++;
            whereConditions.push(`LOWER(l.model) = LOWER($${paramCount})`);
            queryParams.push(model);
        }

        if (year) {
            paramCount++;
            whereConditions.push(`l.year = $${paramCount}`);
            queryParams.push(parseInt(year));
        }

        if (minPrice) {
            paramCount++;
            whereConditions.push(`l.price >= $${paramCount}`);
            queryParams.push(parseFloat(minPrice));
        }

        if (maxPrice) {
            paramCount++;
            whereConditions.push(`l.price <= $${paramCount}`);
            queryParams.push(parseFloat(maxPrice));
        }

        if (condition) {
            paramCount++;
            whereConditions.push(`l.condition = $${paramCount}`);
            queryParams.push(condition);
        }

        if (search) {
            paramCount++;
            whereConditions.push(`(LOWER(l.title) LIKE LOWER($${paramCount}) OR LOWER(l.description) LIKE LOWER($${paramCount}))`);
            queryParams.push(`%${search}%`);
        }

        // Validate sort parameters
        const validSortColumns = ['created_at', 'price', 'title'];
        const validSortOrders = ['ASC', 'DESC'];
        const sortColumn = validSortColumns.includes(sortBy) ? sortBy : 'created_at';
        const sortDirection = validSortOrders.includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : 'DESC';

        const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

        // Get total count
        const countQuery = `
      SELECT COUNT(*) as total
      FROM listings l
      JOIN users u ON l.seller_id = u.id
      ${whereClause}
    `;

        const countResult = await query(countQuery, queryParams);
        const total = parseInt(countResult.rows[0].total);

        // Get listings
        const listingsQuery = `
      SELECT 
        l.id,
        l.title,
        l.description,
        l.price,
        l.category,
        l.condition,
        l.make,
        l.model,
        l.year,
        l.images,
        l.shipping_info,
        l.created_at,
        l.updated_at,
        u.id as seller_id,
        u.first_name as seller_first_name,
        u.last_name as seller_last_name,
        u.email as seller_email,
        COALESCE(AVG(r.rating), 0) as seller_rating,
        COUNT(r.id) as review_count
      FROM listings l
      JOIN users u ON l.seller_id = u.id
      LEFT JOIN reviews r ON u.id = r.seller_id
      ${whereClause}
      GROUP BY l.id, u.id
      ORDER BY l.${sortColumn} ${sortDirection}
      LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
    `;

        queryParams.push(parseInt(limit), offset);
        const listingsResult = await query(listingsQuery, queryParams);

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
            images: row.images || [],
            shippingInfo: row.shipping_info,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
            seller: {
                id: row.seller_id,
                firstName: row.seller_first_name,
                lastName: row.seller_last_name,
                email: row.seller_email,
                rating: parseFloat(row.seller_rating),
                reviewCount: parseInt(row.review_count)
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
        console.error('Get listings error:', error);
        res.status(500).json({ message: 'Failed to fetch listings' });
    }
});

// Get single listing
router.get('/:id', optionalAuth, validateId, async (req, res) => {
    try {
        const { id } = req.params;

        const result = await query(`
      SELECT 
        l.*,
        u.id as seller_id,
        u.first_name as seller_first_name,
        u.last_name as seller_last_name,
        u.email as seller_email,
        COALESCE(AVG(r.rating), 0) as seller_rating,
        COUNT(r.id) as review_count
      FROM listings l
      JOIN users u ON l.seller_id = u.id
      LEFT JOIN reviews r ON u.id = r.seller_id
      WHERE l.id = $1 AND l.is_active = true
      GROUP BY l.id, u.id
    `, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Listing not found' });
        }

        const listing = result.rows[0];
        res.json({
            id: listing.id,
            title: listing.title,
            description: listing.description,
            price: parseFloat(listing.price),
            category: listing.category,
            condition: listing.condition,
            make: listing.make,
            model: listing.model,
            year: listing.year,
            images: listing.images || [],
            shippingInfo: listing.shipping_info,
            createdAt: listing.created_at,
            updatedAt: listing.updated_at,
            seller: {
                id: listing.seller_id,
                firstName: listing.seller_first_name,
                lastName: listing.seller_last_name,
                email: listing.seller_email,
                rating: parseFloat(listing.seller_rating),
                reviewCount: parseInt(listing.review_count)
            }
        });
    } catch (error) {
        console.error('Get listing error:', error);
        res.status(500).json({ message: 'Failed to fetch listing' });
    }
});

// Create new listing
router.post('/', authenticateToken, requireSeller, upload.array('images', 10), validateListing, async (req, res) => {
    try {
        const {
            title,
            description,
            price,
            category,
            condition,
            make,
            model,
            year,
            shippingInfo
        } = req.body;

        // Upload images to S3
        const images = [];
        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                const imageUrl = await uploadToS3(file);
                images.push(imageUrl);
            }
        }

        const result = await query(`
      INSERT INTO listings (
        seller_id, title, description, price, category, condition,
        make, model, year, images, shipping_info, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING id, title, description, price, category, condition, make, model, year, images, shipping_info, created_at
    `, [
            req.user.id, title, description, parseFloat(price), category, condition,
            make, model, year ? parseInt(year) : null, JSON.stringify(images),
            shippingInfo ? JSON.stringify(shippingInfo) : null, new Date(), new Date()
        ]);

        const listing = result.rows[0];
        res.status(201).json({
            message: 'Listing created successfully',
            listing: {
                id: listing.id,
                title: listing.title,
                description: listing.description,
                price: parseFloat(listing.price),
                category: listing.category,
                condition: listing.condition,
                make: listing.make,
                model: listing.model,
                year: listing.year,
                images: JSON.parse(listing.images || '[]'),
                shippingInfo: listing.shipping_info ? JSON.parse(listing.shipping_info) : null,
                createdAt: listing.created_at
            }
        });
    } catch (error) {
        console.error('Create listing error:', error);
        res.status(500).json({ message: 'Failed to create listing' });
    }
});

// Update listing
router.put('/:id', authenticateToken, requireSeller, upload.array('images', 10), validateListing, async (req, res) => {
    try {
        const { id } = req.params;
        const {
            title,
            description,
            price,
            category,
            condition,
            make,
            model,
            year,
            shippingInfo
        } = req.body;

        // Check if listing exists and belongs to user
        const existingListing = await query(
            'SELECT id, images FROM listings WHERE id = $1 AND seller_id = $2',
            [id, req.user.id]
        );

        if (existingListing.rows.length === 0) {
            return res.status(404).json({ message: 'Listing not found or access denied' });
        }

        let images = JSON.parse(existingListing.rows[0].images || '[]');

        // Handle new image uploads
        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                const imageUrl = await uploadToS3(file);
                images.push(imageUrl);
            }
        }

        const result = await query(`
      UPDATE listings SET
        title = $1,
        description = $2,
        price = $3,
        category = $4,
        condition = $5,
        make = $6,
        model = $7,
        year = $8,
        images = $9,
        shipping_info = $10,
        updated_at = $11
      WHERE id = $12 AND seller_id = $13
      RETURNING id, title, description, price, category, condition, make, model, year, images, shipping_info, updated_at
    `, [
            title, description, parseFloat(price), category, condition,
            make, model, year ? parseInt(year) : null, JSON.stringify(images),
            shippingInfo ? JSON.stringify(shippingInfo) : null, new Date(), id, req.user.id
        ]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Listing not found or access denied' });
        }

        const listing = result.rows[0];
        res.json({
            message: 'Listing updated successfully',
            listing: {
                id: listing.id,
                title: listing.title,
                description: listing.description,
                price: parseFloat(listing.price),
                category: listing.category,
                condition: listing.condition,
                make: listing.make,
                model: listing.model,
                year: listing.year,
                images: JSON.parse(listing.images || '[]'),
                shippingInfo: listing.shipping_info ? JSON.parse(listing.shipping_info) : null,
                updatedAt: listing.updated_at
            }
        });
    } catch (error) {
        console.error('Update listing error:', error);
        res.status(500).json({ message: 'Failed to update listing' });
    }
});

// Delete listing
router.delete('/:id', authenticateToken, requireSeller, validateId, async (req, res) => {
    try {
        const { id } = req.params;

        const result = await query(
            'UPDATE listings SET is_active = false, updated_at = $1 WHERE id = $2 AND seller_id = $3 RETURNING id',
            [new Date(), id, req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Listing not found or access denied' });
        }

        res.json({ message: 'Listing deleted successfully' });
    } catch (error) {
        console.error('Delete listing error:', error);
        res.status(500).json({ message: 'Failed to delete listing' });
    }
});

// Get seller's listings
router.get('/seller/my-listings', authenticateToken, requireSeller, validatePagination, async (req, res) => {
    try {
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
    `, [req.user.id, parseInt(limit), offset]);

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
        console.error('Get seller listings error:', error);
        res.status(500).json({ message: 'Failed to fetch seller listings' });
    }
});

module.exports = router;





