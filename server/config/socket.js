const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

let io;

const initializeSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: process.env.FRONTEND_URL || 'http://localhost:3000',
            methods: ['GET', 'POST']
        }
    });

    // Authentication middleware for socket
    io.use((socket, next) => {
        const token = socket.handshake.auth.token;
        if (!token) {
            return next(new Error('Authentication error'));
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            socket.userId = decoded.userId;
            next();
        } catch (err) {
            next(new Error('Authentication error'));
        }
    });

    io.on('connection', (socket) => {
        console.log(`User ${socket.userId} connected`);

        // Join user to their personal room
        socket.join(`user_${socket.userId}`);

        // Handle joining conversation rooms
        socket.on('join_conversation', (conversationId) => {
            socket.join(`conversation_${conversationId}`);
        });

        // Handle leaving conversation rooms
        socket.on('leave_conversation', (conversationId) => {
            socket.leave(`conversation_${conversationId}`);
        });

        // Handle new messages
        socket.on('send_message', (data) => {
            const { conversationId, message } = data;
            socket.to(`conversation_${conversationId}`).emit('new_message', {
                ...message,
                timestamp: new Date().toISOString()
            });
        });

        // Handle typing indicators
        socket.on('typing_start', (conversationId) => {
            socket.to(`conversation_${conversationId}`).emit('user_typing', {
                userId: socket.userId,
                isTyping: true
            });
        });

        socket.on('typing_stop', (conversationId) => {
            socket.to(`conversation_${conversationId}`).emit('user_typing', {
                userId: socket.userId,
                isTyping: false
            });
        });

        socket.on('disconnect', () => {
            console.log(`User ${socket.userId} disconnected`);
        });
    });

    return io;
};

// Helper function to emit to specific user
const emitToUser = (userId, event, data) => {
    if (io) {
        io.to(`user_${userId}`).emit(event, data);
    }
};

// Helper function to emit to conversation
const emitToConversation = (conversationId, event, data) => {
    if (io) {
        io.to(`conversation_${conversationId}`).emit(event, data);
    }
};

module.exports = {
    initializeSocket,
    emitToUser,
    emitToConversation
};





