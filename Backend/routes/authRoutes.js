const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const verifyToken = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

router.post("/login", authController.login);
router.post("/logout", authController.logout);
router.post("/refresh", authController.refreshToken);
router.post('/register', authController.register);
router.post('/changepassword', verifyToken, authController.changePassword);
router.get('/settings', verifyToken, authController.getSettings);
router.patch('/settings', verifyToken, authController.updateSettings);
router.get('/profile', verifyToken, authController.getProfile);
router.patch('/profile', verifyToken, upload.single('avatar'), authController.updateProfile);
module.exports = router;
