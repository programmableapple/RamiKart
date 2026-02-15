const express = require("express");
const router = express.Router();
const upload = require("../middleware/uploadMiddleware");
const listingController = require("../controllers/listingController");
const authMiddleware = require("../middleware/authMiddleware");
const verifyToken = require("../middleware/authMiddleware");
const isAdmin = require("../middleware/adminMiddleware");

router.get("/all", authMiddleware, isAdmin, listingController.getAllListings);

router.get("/mine", authMiddleware, listingController.getMyListings);
router.post("/", verifyToken, upload.array("images", 10), listingController.createListing);
router.get("/", listingController.getListings);
router.get("/:id", listingController.getListingById);
// Update a listing (requires authentication and handling file uploads)
router.patch("/:id", authMiddleware, upload.array("images", 10), listingController.updateListing);
router.post("/:productId/reviews", authMiddleware, listingController.submitReview);
router.delete("/:id", authMiddleware, listingController.deleteListing);


module.exports = router;
