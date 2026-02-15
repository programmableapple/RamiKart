const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const User = require("../models/User");
const logger = require("./logger");

/**
 * GET /api/messages/conversations
 * Get all conversations for the logged-in user, with participant info.
 */
exports.getConversations = async (req, res) => {
    try {
        const userId = req.user.id;

        const conversations = await Conversation.find({
            participants: userId,
        })
            .populate("participants", "name userName avatar email")
            .sort({ lastMessageAt: -1 });

        // Count unread messages per conversation
        const conversationsWithUnread = await Promise.all(
            conversations.map(async (conv) => {
                const unreadCount = await Message.countDocuments({
                    conversation: conv._id,
                    sender: { $ne: userId },
                    read: false,
                });
                return {
                    ...conv.toObject(),
                    unreadCount,
                };
            })
        );

        res.json({ conversations: conversationsWithUnread });
    } catch (err) {
        logger.error("Get Conversations Error: " + err.message);
        res.status(500).json({ message: "Server error" });
    }
};

/**
 * GET /api/messages/conversations/:conversationId
 * Get all messages in a specific conversation.
 */
exports.getMessages = async (req, res) => {
    try {
        const userId = req.user.id;
        const { conversationId } = req.params;

        // Verify user is part of the conversation
        const conversation = await Conversation.findOne({
            _id: conversationId,
            participants: userId,
        });

        if (!conversation) {
            return res.status(404).json({ message: "Conversation not found" });
        }

        const messages = await Message.find({ conversation: conversationId })
            .populate("sender", "name userName avatar")
            .sort({ createdAt: 1 });

        res.json({ messages });
    } catch (err) {
        logger.error("Get Messages Error: " + err.message);
        res.status(500).json({ message: "Server error" });
    }
};

/**
 * POST /api/messages/conversations
 * Start a new conversation with another user, or return existing one.
 * Body: { participantId: string }
 */
exports.createConversation = async (req, res) => {
    try {
        const userId = req.user.id;
        const { participantId } = req.body;

        if (!participantId) {
            return res.status(400).json({ message: "participantId is required" });
        }

        if (participantId === userId) {
            return res.status(400).json({ message: "Cannot start a conversation with yourself" });
        }

        // Check if participant exists
        const participant = await User.findById(participantId);
        if (!participant) {
            return res.status(404).json({ message: "User not found" });
        }

        // Check if conversation already exists between these two users
        let conversation = await Conversation.findOne({
            participants: { $all: [userId, participantId], $size: 2 },
        }).populate("participants", "name userName avatar email");

        if (conversation) {
            return res.json({ conversation, existing: true });
        }

        // Create new conversation
        conversation = await Conversation.create({
            participants: [userId, participantId],
        });

        conversation = await Conversation.findById(conversation._id)
            .populate("participants", "name userName avatar email");

        logger.info(`║ ✅ New conversation created between ${userId} and ${participantId}`);
        res.status(201).json({ conversation, existing: false });
    } catch (err) {
        logger.error("Create Conversation Error: " + err.message);
        res.status(500).json({ message: "Server error" });
    }
};

/**
 * PATCH /api/messages/conversations/:conversationId/read
 * Mark all messages in a conversation as read (for the current user).
 */
exports.markAsRead = async (req, res) => {
    try {
        const userId = req.user.id;
        const { conversationId } = req.params;

        // Verify user is part of the conversation
        const conversation = await Conversation.findOne({
            _id: conversationId,
            participants: userId,
        });

        if (!conversation) {
            return res.status(404).json({ message: "Conversation not found" });
        }

        // Mark all messages from the OTHER user as read
        await Message.updateMany(
            {
                conversation: conversationId,
                sender: { $ne: userId },
                read: false,
            },
            { read: true }
        );

        res.json({ message: "Messages marked as read" });
    } catch (err) {
        logger.error("Mark As Read Error: " + err.message);
        res.status(500).json({ message: "Server error" });
    }
};

/**
 * GET /api/messages/users/search?q=query
 * Search users to start a new conversation with.
 */
exports.searchUsers = async (req, res) => {
    try {
        const userId = req.user.id;
        const { q } = req.query;

        if (!q || q.trim().length < 2) {
            return res.json({ users: [] });
        }

        const users = await User.find({
            _id: { $ne: userId },
            $or: [
                { name: { $regex: q, $options: "i" } },
                { userName: { $regex: q, $options: "i" } },
                { email: { $regex: q, $options: "i" } },
            ],
        })
            .select("name userName avatar email")
            .limit(10);

        res.json({ users });
    } catch (err) {
        logger.error("Search Users Error: " + err.message);
        res.status(500).json({ message: "Server error" });
    }
};

/**
 * GET /api/messages/unread-count
 * Get total unread message count across all conversations.
 */
exports.getUnreadCount = async (req, res) => {
    try {
        const userId = req.user.id;

        // Get all conversations this user is part of
        const conversations = await Conversation.find({ participants: userId });
        const conversationIds = conversations.map((c) => c._id);

        // Count all unread messages sent by others in those conversations
        const unreadCount = await Message.countDocuments({
            conversation: { $in: conversationIds },
            sender: { $ne: userId },
            read: false,
        });

        res.json({ unreadCount });
    } catch (err) {
        logger.error("Get Unread Count Error: " + err.message);
        res.status(500).json({ message: "Server error" });
    }
};
