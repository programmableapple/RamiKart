const express = require("express");
const router = express.Router();
const upload = require("../middleware/uploadMiddleware");
const listingController = require("../controllers/listingController");
const authMiddleware = require("../middleware/authMiddleware");
const verifyToken = require("../middleware/authMiddleware");

router.get("/mine", authMiddleware, listingController.getMyListings);
router.post("/", verifyToken,upload.array("images", 10), listingController.createListing);
router.get("/", listingController.getListings);
router.get("/:id", listingController.getListingById);
router.patch("/:id", authMiddleware, listingController.updateListing);
router.post("/:productId/reviews", authMiddleware, listingController.submitReview);


module.exports = router;
