const express = require("express");
const router = express.Router();
const favoritesController = require("../controllers/favoritesController");
const verifyToken = require("../middleware/authMiddleware");
const isAdmin = require("../middleware/adminMiddleware");

// User: get own favorites
router.get("/", verifyToken, favoritesController.getFavorites);

// User: toggle a product favorite
router.post("/toggle/:productId", verifyToken, favoritesController.toggleFavorite);

// Admin: get all users' favorites
router.get("/all", verifyToken, isAdmin, favoritesController.getAllFavorites);

module.exports = router;
