const User = require("../models/User");
const logger = require("./logger");

/**
 * GET /api/favorites
 * Get the current user's favorites (populated with product data).
 */
exports.getFavorites = async (req, res) => {
    try {
        const user = await User.findById(req.user.id)
            .populate({
                path: 'favorites',
                populate: { path: 'seller', select: 'name userName email' }
            });
        if (!user) return res.status(404).json({ message: "User not found" });

        res.json({ favorites: user.favorites });
    } catch (err) {
        logger.error("Get Favorites Error: " + err.message);
        res.status(500).json({ message: "Server error" });
    }
};

/**
 * POST /api/favorites/toggle/:productId
 * Toggle a product in the current user's favorites.
 */
exports.toggleFavorite = async (req, res) => {
    try {
        const userId = req.user.id;
        const { productId } = req.params;

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        const index = user.favorites.indexOf(productId);
        let action;
        if (index === -1) {
            user.favorites.push(productId);
            action = "added";
        } else {
            user.favorites.splice(index, 1);
            action = "removed";
        }

        await user.save();

        logger.info(`║ ✅ Favorite ${action} for user ${user.email}: ${productId}`);
        res.json({
            message: `Product ${action} ${action === "added" ? "to" : "from"} favorites`,
            action,
            favorites: user.favorites,
        });
    } catch (err) {
        logger.error("Toggle Favorite Error: " + err.message);
        res.status(500).json({ message: "Server error" });
    }
};

/**
 * GET /api/favorites/all (admin only)
 * Get all users' favorites.
 */
exports.getAllFavorites = async (req, res) => {
    try {
        const users = await User.find({ favorites: { $exists: true, $ne: [] } })
            .select('name userName email favorites')
            .populate({
                path: 'favorites',
                populate: { path: 'seller', select: 'name userName email' }
            });

        res.json({ users });
    } catch (err) {
        logger.error("Get All Favorites Error: " + err.message);
        res.status(500).json({ message: "Server error" });
    }
};
