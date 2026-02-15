const mongoose = require('mongoose');

const ConversationSchema = new mongoose.Schema({
    participants: [
        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
    ],
    lastMessage: { type: String, default: '' },
    lastMessageAt: { type: Date, default: Date.now },
}, { timestamps: true });

// Ensure we can quickly find conversations for a user
ConversationSchema.index({ participants: 1 });
// Sort by most recent message
ConversationSchema.index({ lastMessageAt: -1 });

module.exports = mongoose.model('Conversation', ConversationSchema);
