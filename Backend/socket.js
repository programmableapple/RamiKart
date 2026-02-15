const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const Conversation = require("./models/Conversation");
const Message = require("./models/Message");
const logger = require("./controllers/logger");

// Map to track online users: userId -> Set of socketIds (multiple tabs/devices)
const onlineUsers = new Map();

function initializeSocket(httpServer, allowedOrigins) {
    const io = new Server(httpServer, {
        cors: {
            origin: function (origin, callback) {
                if (!origin) return callback(null, true);
                if (allowedOrigins.indexOf(origin) === -1) {
                    return callback(new Error("CORS not allowed"), false);
                }
                return callback(null, true);
            },
            credentials: true,
        },
    });

    // Authenticate socket connections using JWT
    io.use((socket, next) => {
        const token = socket.handshake.auth.token;
        if (!token) {
            return next(new Error("Authentication token required"));
        }

        try {
            const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
            socket.userId = decoded.id;
            next();
        } catch (err) {
            return next(new Error("Invalid token"));
        }
    });

    io.on("connection", (socket) => {
        const userId = socket.userId;
        logger.info(`║ 🔌 Socket connected: user ${userId} (socket ${socket.id})`);

        // Track this user as online
        if (!onlineUsers.has(userId)) {
            onlineUsers.set(userId, new Set());
        }
        onlineUsers.get(userId).add(socket.id);

        // Broadcast online status to all connected users
        io.emit("userOnline", userId);

        // Send the current list of online users to the newly connected socket
        const onlineUserIds = Array.from(onlineUsers.keys());
        socket.emit("onlineUsers", onlineUserIds);

        // Join the user to their own room for targeted messages
        socket.join(userId);

        /**
         * Handle sending a message
         * Payload: { conversationId, content }
         */
        socket.on("sendMessage", async (data, callback) => {
            try {
                const { conversationId, content } = data;

                if (!conversationId || !content || !content.trim()) {
                    return callback?.({ error: "conversationId and content are required" });
                }

                // Verify user is part of the conversation
                const conversation = await Conversation.findOne({
                    _id: conversationId,
                    participants: userId,
                });

                if (!conversation) {
                    return callback?.({ error: "Conversation not found" });
                }

                // Save the message to the database
                const message = await Message.create({
                    conversation: conversationId,
                    sender: userId,
                    content: content.trim(),
                });

                // Update conversation's last message info
                conversation.lastMessage = content.trim();
                conversation.lastMessageAt = new Date();
                await conversation.save();

                // Populate sender info for the response
                const populatedMessage = await Message.findById(message._id)
                    .populate("sender", "name userName avatar");

                // Find the other participant(s) and emit to them
                const otherParticipants = conversation.participants.filter(
                    (p) => p.toString() !== userId
                );

                otherParticipants.forEach((participantId) => {
                    io.to(participantId.toString()).emit("newMessage", {
                        message: populatedMessage,
                        conversationId,
                    });
                });

                // Also send back to the sender (for multi-tab sync)
                socket.emit("messageSent", {
                    message: populatedMessage,
                    conversationId,
                });

                callback?.({ success: true, message: populatedMessage });
            } catch (err) {
                logger.error("Socket sendMessage Error: " + err.message);
                callback?.({ error: "Failed to send message" });
            }
        });

        /**
         * Handle typing indicator
         * Payload: { conversationId, isTyping }
         */
        socket.on("typing", async (data) => {
            try {
                const { conversationId, isTyping } = data;

                const conversation = await Conversation.findOne({
                    _id: conversationId,
                    participants: userId,
                });

                if (!conversation) return;

                const otherParticipants = conversation.participants.filter(
                    (p) => p.toString() !== userId
                );

                otherParticipants.forEach((participantId) => {
                    io.to(participantId.toString()).emit("userTyping", {
                        conversationId,
                        userId,
                        isTyping,
                    });
                });
            } catch (err) {
                logger.error("Socket typing Error: " + err.message);
            }
        });

        /**
         * Handle marking messages as read via socket
         * Payload: { conversationId }
         */
        socket.on("markRead", async (data) => {
            try {
                const { conversationId } = data;

                await Message.updateMany(
                    {
                        conversation: conversationId,
                        sender: { $ne: userId },
                        read: false,
                    },
                    { read: true }
                );

                // Notify the other user that their messages were read
                const conversation = await Conversation.findById(conversationId);
                if (conversation) {
                    const otherParticipants = conversation.participants.filter(
                        (p) => p.toString() !== userId
                    );

                    otherParticipants.forEach((participantId) => {
                        io.to(participantId.toString()).emit("messagesRead", {
                            conversationId,
                            readBy: userId,
                        });
                    });
                }
            } catch (err) {
                logger.error("Socket markRead Error: " + err.message);
            }
        });

        // Handle disconnection
        socket.on("disconnect", () => {
            logger.info(`║ 🔌 Socket disconnected: user ${userId} (socket ${socket.id})`);

            if (onlineUsers.has(userId)) {
                onlineUsers.get(userId).delete(socket.id);
                // Only mark as offline if no more sockets are connected for this user
                if (onlineUsers.get(userId).size === 0) {
                    onlineUsers.delete(userId);
                    io.emit("userOffline", userId);
                }
            }
        });
    });

    return io;
}

module.exports = { initializeSocket };
