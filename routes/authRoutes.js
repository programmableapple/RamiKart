const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const  verifyToken  = require("../middleware/authMiddleware");

router.post("/login",  authController.login);
router.post("/logout", authController.logout);
router.post("/refresh", authController.refreshToken);
router.post('/register', authController.register);
router.post('/changepassword' ,verifyToken , authController.changePassword);
module.exports = router;
