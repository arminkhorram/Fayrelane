const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { query } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { validateId } = require('../middleware/validation');

const router = express.Router();

// Create payment intent
router.post('/create-intent', authenticateToken, async (req, res) => {
    try {
        const { listingId, amount, currency = 'usd' } = req.body;

        if (!listingId || !amount) {
            return res.status(400).json({ message: 'Listing ID and amount are required' });
        }

        // Verify listing exists and get details
        const listingResult = await query(`
      SELECT l.id, l.title, l.price, l.seller_id, u.email as seller_email
      FROM listings l
      JOIN users u ON l.seller_id = u.id
      WHERE l.id = $1 AND l.is_active = true
    `, [listingId]);

        if (listingResult.rows.length === 0) {
            return res.status(404).json({ message: 'Listing not found' });
        }

        const listing = listingResult.rows[0];

        // Check if user is trying to buy their own listing
        if (listing.seller_id === req.user.id) {
            return res.status(400).json({ message: 'Cannot purchase your own listing' });
        }

        // Verify amount matches listing price
        if (parseFloat(amount) !== parseFloat(listing.price)) {
            return res.status(400).json({ message: 'Amount does not match listing price' });
        }

        // Create payment intent
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(parseFloat(amount) * 100), // Convert to cents
            currency: currency.toLowerCase(),
            metadata: {
                listingId: listingId,
                buyerId: req.user.id,
                sellerId: listing.seller_id
            },
            description: `Payment for ${listing.title}`,
            automatic_payment_methods: {
                enabled: true,
            },
        });

        // Store payment intent in database
        await query(`
      INSERT INTO payment_intents (
        id, listing_id, buyer_id, seller_id, amount, currency, status, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `, [
            paymentIntent.id,
            listingId,
            req.user.id,
            listing.seller_id,
            parseFloat(amount),
            currency,
            'requires_payment_method',
            new Date()
        ]);

        res.json({
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id
        });
    } catch (error) {
        console.error('Create payment intent error:', error);
        res.status(500).json({ message: 'Failed to create payment intent' });
    }
});

// Confirm payment
router.post('/confirm', authenticateToken, async (req, res) => {
    try {
        const { paymentIntentId } = req.body;

        if (!paymentIntentId) {
            return res.status(400).json({ message: 'Payment intent ID is required' });
        }

        // Get payment intent from database
        const paymentResult = await query(`
      SELECT pi.*, l.title as listing_title, l.seller_id
      FROM payment_intents pi
      JOIN listings l ON pi.listing_id = l.id
      WHERE pi.id = $1 AND pi.buyer_id = $2
    `, [paymentIntentId, req.user.id]);

        if (paymentResult.rows.length === 0) {
            return res.status(404).json({ message: 'Payment intent not found' });
        }

        const payment = paymentResult.rows[0];

        // Retrieve payment intent from Stripe
        const stripePaymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

        if (stripePaymentIntent.status !== 'succeeded') {
            return res.status(400).json({
                message: 'Payment not completed',
                status: stripePaymentIntent.status
            });
        }

        // Update payment intent status
        await query(`
      UPDATE payment_intents 
      SET status = 'succeeded', updated_at = $1
      WHERE id = $2
    `, [new Date(), paymentIntentId]);

        // Create order record
        const orderResult = await query(`
      INSERT INTO orders (
        listing_id, buyer_id, seller_id, payment_intent_id, amount, currency, status, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id, status, created_at
    `, [
            payment.listing_id,
            payment.buyer_id,
            payment.seller_id,
            paymentIntentId,
            payment.amount,
            payment.currency,
            'completed',
            new Date()
        ]);

        const order = orderResult.rows[0];

        // Mark listing as sold
        await query(`
      UPDATE listings 
      SET is_active = false, updated_at = $1
      WHERE id = $2
    `, [new Date(), payment.listing_id]);

        res.json({
            message: 'Payment confirmed successfully',
            order: {
                id: order.id,
                status: order.status,
                createdAt: order.created_at
            }
        });
    } catch (error) {
        console.error('Confirm payment error:', error);
        res.status(500).json({ message: 'Failed to confirm payment' });
    }
});

// Get user's orders
router.get('/orders', authenticateToken, async (req, res) => {
    try {
        const { type = 'all' } = req.query; // 'bought' or 'sold' or 'all'

        let whereClause = '';
        if (type === 'bought') {
            whereClause = 'WHERE o.buyer_id = $1';
        } else if (type === 'sold') {
            whereClause = 'WHERE o.seller_id = $1';
        } else {
            whereClause = 'WHERE (o.buyer_id = $1 OR o.seller_id = $1)';
        }

        const result = await query(`
      SELECT 
        o.id,
        o.amount,
        o.currency,
        o.status,
        o.created_at,
        l.title as listing_title,
        l.images as listing_images,
        l.category as listing_category,
        buyer.first_name as buyer_first_name,
        buyer.last_name as buyer_last_name,
        buyer.email as buyer_email,
        seller.first_name as seller_first_name,
        seller.last_name as seller_last_name,
        seller.email as seller_email
      FROM orders o
      JOIN listings l ON o.listing_id = l.id
      JOIN users buyer ON o.buyer_id = buyer.id
      JOIN users seller ON o.seller_id = seller.id
      ${whereClause}
      ORDER BY o.created_at DESC
    `, [req.user.id]);

        const orders = result.rows.map(row => ({
            id: row.id,
            amount: parseFloat(row.amount),
            currency: row.currency,
            status: row.status,
            createdAt: row.created_at,
            listing: {
                title: row.listing_title,
                images: JSON.parse(row.listing_images || '[]'),
                category: row.listing_category
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

        res.json({ orders });
    } catch (error) {
        console.error('Get orders error:', error);
        res.status(500).json({ message: 'Failed to fetch orders' });
    }
});

// Get single order
router.get('/orders/:id', authenticateToken, validateId, async (req, res) => {
    try {
        const { id } = req.params;

        const result = await query(`
      SELECT 
        o.id,
        o.amount,
        o.currency,
        o.status,
        o.created_at,
        l.id as listing_id,
        l.title as listing_title,
        l.description as listing_description,
        l.images as listing_images,
        l.category as listing_category,
        l.condition as listing_condition,
        l.make as listing_make,
        l.model as listing_model,
        l.year as listing_year,
        l.shipping_info as listing_shipping_info,
        buyer.id as buyer_id,
        buyer.first_name as buyer_first_name,
        buyer.last_name as buyer_last_name,
        buyer.email as buyer_email,
        seller.id as seller_id,
        seller.first_name as seller_first_name,
        seller.last_name as seller_last_name,
        seller.email as seller_email
      FROM orders o
      JOIN listings l ON o.listing_id = l.id
      JOIN users buyer ON o.buyer_id = buyer.id
      JOIN users seller ON o.seller_id = seller.id
      WHERE o.id = $1 AND (o.buyer_id = $2 OR o.seller_id = $2)
    `, [id, req.user.id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Order not found' });
        }

        const order = result.rows[0];
        res.json({
            id: order.id,
            amount: parseFloat(order.amount),
            currency: order.currency,
            status: order.status,
            createdAt: order.created_at,
            listing: {
                id: order.listing_id,
                title: order.listing_title,
                description: order.listing_description,
                images: JSON.parse(order.listing_images || '[]'),
                category: order.listing_category,
                condition: order.listing_condition,
                make: order.listing_make,
                model: order.listing_model,
                year: order.listing_year,
                shippingInfo: order.listing_shipping_info ? JSON.parse(order.listing_shipping_info) : null
            },
            buyer: {
                id: order.buyer_id,
                firstName: order.buyer_first_name,
                lastName: order.buyer_last_name,
                email: order.buyer_email
            },
            seller: {
                id: order.seller_id,
                firstName: order.seller_first_name,
                lastName: order.seller_last_name,
                email: order.seller_email
            }
        });
    } catch (error) {
        console.error('Get order error:', error);
        res.status(500).json({ message: 'Failed to fetch order' });
    }
});

// Stripe webhook handler
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        console.error('Webhook signature verification failed:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
        case 'payment_intent.succeeded':
            const paymentIntent = event.data.object;
            console.log('PaymentIntent succeeded:', paymentIntent.id);

            // Update payment intent status in database
            await query(`
        UPDATE payment_intents 
        SET status = 'succeeded', updated_at = $1
        WHERE id = $2
      `, [new Date(), paymentIntent.id]);
            break;

        case 'payment_intent.payment_failed':
            const failedPayment = event.data.object;
            console.log('PaymentIntent failed:', failedPayment.id);

            // Update payment intent status in database
            await query(`
        UPDATE payment_intents 
        SET status = 'failed', updated_at = $1
        WHERE id = $2
      `, [new Date(), failedPayment.id]);
            break;

        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
});

module.exports = router;





