const express = require("express");
const router = express.Router();
const messageController = require("../controllers/messageController");
const verifyToken = require("../middleware/authMiddleware");

// Get all conversations for the logged-in user
router.get("/conversations", verifyToken, messageController.getConversations);

// Start a new conversation (or return existing)
router.post("/conversations", verifyToken, messageController.createConversation);

// Get messages in a specific conversation
router.get("/conversations/:conversationId", verifyToken, messageController.getMessages);

// Mark messages as read in a conversation
router.patch("/conversations/:conversationId/read", verifyToken, messageController.markAsRead);

// Search users to start a new conversation with
router.get("/users/search", verifyToken, messageController.searchUsers);

// Get total unread message count
router.get("/unread-count", verifyToken, messageController.getUnreadCount);

module.exports = router;
