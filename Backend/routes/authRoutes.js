const express = require("express");
const router = express.Router();
const {
    registerUser,
    verifyEmail,
    resendOTP,
    loginUser,
    logoutUser,
    getUsers
} = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");
const { admin } = require("../middleware/adminMiddleware");

// Authentication routes
router.post("/register", registerUser);
router.post("/verify-email", verifyEmail);
router.post("/resend-otp", resendOTP);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.get("/users", protect, admin, getUsers);

module.exports = router;