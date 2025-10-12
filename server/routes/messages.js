const express = require('express');
const { query } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { validateMessage, validateId, validatePagination } = require('../middleware/validation');
const { emitToConversation } = require('../config/socket');

const router = express.Router();

// Get user's conversations
router.get('/conversations', authenticateToken, validatePagination, async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const offset = (page - 1) * limit;

        const result = await query(`
      SELECT DISTINCT
        c.id as conversation_id,
        c.listing_id,
        c.created_at as conversation_created_at,
        l.title as listing_title,
        l.price as listing_price,
        l.images as listing_images,
        CASE 
          WHEN c.user1_id = $1 THEN u2.id
          ELSE u1.id
        END as other_user_id,
        CASE 
          WHEN c.user1_id = $1 THEN u2.first_name
          ELSE u1.first_name
        END as other_user_first_name,
        CASE 
          WHEN c.user1_id = $1 THEN u2.last_name
          ELSE u1.last_name
        END as other_user_last_name,
        CASE 
          WHEN c.user1_id = $1 THEN u2.email
          ELSE u1.email
        END as other_user_email,
        m.id as last_message_id,
        m.content as last_message_content,
        m.created_at as last_message_created_at,
        m.is_read as last_message_read,
        m.sender_id as last_message_sender_id
      FROM conversations c
      JOIN listings l ON c.listing_id = l.id
      JOIN users u1 ON c.user1_id = u1.id
      JOIN users u2 ON c.user2_id = u2.id
      LEFT JOIN LATERAL (
        SELECT id, content, created_at, is_read, sender_id
        FROM messages
        WHERE conversation_id = c.id
        ORDER BY created_at DESC
        LIMIT 1
      ) m ON true
      WHERE (c.user1_id = $1 OR c.user2_id = $1)
      ORDER BY COALESCE(m.created_at, c.created_at) DESC
      LIMIT $2 OFFSET $3
    `, [req.user.id, parseInt(limit), offset]);

        const conversations = result.rows.map(row => ({
            id: row.conversation_id,
            listing: {
                id: row.listing_id,
                title: row.listing_title,
                price: parseFloat(row.listing_price),
                images: JSON.parse(row.listing_images || '[]')
            },
            otherUser: {
                id: row.other_user_id,
                firstName: row.other_user_first_name,
                lastName: row.other_user_last_name,
                email: row.other_user_email
            },
            lastMessage: row.last_message_id ? {
                id: row.last_message_id,
                content: row.last_message_content,
                createdAt: row.last_message_created_at,
                isRead: row.last_message_read,
                senderId: row.last_message_sender_id
            } : null,
            createdAt: row.conversation_created_at
        }));

        res.json({ conversations });
    } catch (error) {
        console.error('Get conversations error:', error);
        res.status(500).json({ message: 'Failed to fetch conversations' });
    }
});

// Get or create conversation
router.post('/conversations', authenticateToken, async (req, res) => {
    try {
        const { listingId, sellerId } = req.body;

        if (!listingId || !sellerId) {
            return res.status(400).json({ message: 'Listing ID and seller ID are required' });
        }

        // Check if user is trying to message themselves
        if (parseInt(sellerId) === req.user.id) {
            return res.status(400).json({ message: 'Cannot message yourself' });
        }

        // Check if listing exists and is active
        const listingResult = await query(
            'SELECT id, title, price, images, seller_id FROM listings WHERE id = $1 AND is_active = true',
            [listingId]
        );

        if (listingResult.rows.length === 0) {
            return res.status(404).json({ message: 'Listing not found' });
        }

        const listing = listingResult.rows[0];

        // Verify seller ID matches listing
        if (parseInt(sellerId) !== listing.seller_id) {
            return res.status(400).json({ message: 'Invalid seller ID' });
        }

        // Check if conversation already exists
        const existingConversation = await query(`
      SELECT id FROM conversations 
      WHERE listing_id = $1 AND ((user1_id = $2 AND user2_id = $3) OR (user1_id = $3 AND user2_id = $2))
    `, [listingId, req.user.id, sellerId]);

        if (existingConversation.rows.length > 0) {
            return res.json({
                conversationId: existingConversation.rows[0].id,
                message: 'Conversation already exists'
            });
        }

        // Create new conversation
        const conversationResult = await query(`
      INSERT INTO conversations (listing_id, user1_id, user2_id, created_at)
      VALUES ($1, $2, $3, $4)
      RETURNING id
    `, [listingId, req.user.id, sellerId, new Date()]);

        const conversationId = conversationResult.rows[0].id;

        res.status(201).json({
            conversationId,
            message: 'Conversation created successfully'
        });
    } catch (error) {
        console.error('Create conversation error:', error);
        res.status(500).json({ message: 'Failed to create conversation' });
    }
});

// Get messages in a conversation
router.get('/conversations/:id/messages', authenticateToken, validateId, validatePagination, async (req, res) => {
    try {
        const { id } = req.params;
        const { page = 1, limit = 50 } = req.query;
        const offset = (page - 1) * limit;

        // Verify user is part of the conversation
        const conversationResult = await query(`
      SELECT id FROM conversations 
      WHERE id = $1 AND (user1_id = $2 OR user2_id = $2)
    `, [id, req.user.id]);

        if (conversationResult.rows.length === 0) {
            return res.status(404).json({ message: 'Conversation not found' });
        }

        // Get messages
        const result = await query(`
      SELECT 
        m.id,
        m.content,
        m.created_at,
        m.is_read,
        m.sender_id,
        u.first_name as sender_first_name,
        u.last_name as sender_last_name
      FROM messages m
      JOIN users u ON m.sender_id = u.id
      WHERE m.conversation_id = $1
      ORDER BY m.created_at ASC
      LIMIT $2 OFFSET $3
    `, [id, parseInt(limit), offset]);

        const messages = result.rows.map(row => ({
            id: row.id,
            content: row.content,
            createdAt: row.created_at,
            isRead: row.is_read,
            sender: {
                id: row.sender_id,
                firstName: row.sender_first_name,
                lastName: row.sender_last_name
            }
        }));

        res.json({ messages });
    } catch (error) {
        console.error('Get messages error:', error);
        res.status(500).json({ message: 'Failed to fetch messages' });
    }
});

// Send message
router.post('/conversations/:id/messages', authenticateToken, validateId, validateMessage, async (req, res) => {
    try {
        const { id } = req.params;
        const { content } = req.body;

        // Verify user is part of the conversation
        const conversationResult = await query(`
      SELECT id, user1_id, user2_id FROM conversations 
      WHERE id = $1 AND (user1_id = $2 OR user2_id = $2)
    `, [id, req.user.id]);

        if (conversationResult.rows.length === 0) {
            return res.status(404).json({ message: 'Conversation not found' });
        }

        const conversation = conversationResult.rows[0];

        // Create message
        const messageResult = await query(`
      INSERT INTO messages (conversation_id, sender_id, content, created_at)
      VALUES ($1, $2, $3, $4)
      RETURNING id, content, created_at, sender_id
    `, [id, req.user.id, content, new Date()]);

        const message = messageResult.rows[0];

        // Emit message to conversation participants via Socket.IO
        emitToConversation(id, 'new_message', {
            id: message.id,
            content: message.content,
            createdAt: message.created_at,
            senderId: message.sender_id,
            conversationId: id
        });

        res.status(201).json({
            message: 'Message sent successfully',
            data: {
                id: message.id,
                content: message.content,
                createdAt: message.created_at,
                senderId: message.sender_id
            }
        });
    } catch (error) {
        console.error('Send message error:', error);
        res.status(500).json({ message: 'Failed to send message' });
    }
});

// Mark messages as read
router.put('/conversations/:id/read', authenticateToken, validateId, async (req, res) => {
    try {
        const { id } = req.params;

        // Verify user is part of the conversation
        const conversationResult = await query(`
      SELECT id FROM conversations 
      WHERE id = $1 AND (user1_id = $2 OR user2_id = $2)
    `, [id, req.user.id]);

        if (conversationResult.rows.length === 0) {
            return res.status(404).json({ message: 'Conversation not found' });
        }

        // Mark all messages in conversation as read (except user's own messages)
        await query(`
      UPDATE messages 
      SET is_read = true 
      WHERE conversation_id = $1 AND sender_id != $2
    `, [id, req.user.id]);

        res.json({ message: 'Messages marked as read' });
    } catch (error) {
        console.error('Mark messages read error:', error);
        res.status(500).json({ message: 'Failed to mark messages as read' });
    }
});

// Get unread message count
router.get('/unread-count', authenticateToken, async (req, res) => {
    try {
        const result = await query(`
      SELECT COUNT(*) as unread_count
      FROM messages m
      JOIN conversations c ON m.conversation_id = c.id
      WHERE (c.user1_id = $1 OR c.user2_id = $1)
      AND m.sender_id != $1
      AND m.is_read = false
    `, [req.user.id]);

        const unreadCount = parseInt(result.rows[0].unread_count);

        res.json({ unreadCount });
    } catch (error) {
        console.error('Get unread count error:', error);
        res.status(500).json({ message: 'Failed to get unread count' });
    }
});

module.exports = router;





