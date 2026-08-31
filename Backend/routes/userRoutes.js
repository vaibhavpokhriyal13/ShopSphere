const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
    getUserProfile,
    updateUserProfile,
    changePassword,
    getAddresses,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
    getPaymentPreferences,
    updatePaymentPreferences,
    getWishlist,
    toggleWishlist,
    getRecentlyViewed,
    addRecentlyViewed,
    clearRecentlyViewed
} = require("../controllers/userController");

// Profile & Password
router.route("/profile")
    .get(protect, getUserProfile)
    .put(protect, updateUserProfile);

router.route("/change-password")
    .put(protect, changePassword);

// Addresses
router.route("/addresses")
    .get(protect, getAddresses)
    .post(protect, addAddress);

router.route("/addresses/:id")
    .put(protect, updateAddress)
    .delete(protect, deleteAddress);

router.route("/addresses/:id/default")
    .put(protect, setDefaultAddress);

// Payment Preferences
router.route("/payment-preferences")
    .get(protect, getPaymentPreferences)
    .put(protect, updatePaymentPreferences);

// Wishlist
router.route("/wishlist")
    .get(protect, getWishlist);

router.route("/wishlist/toggle")
    .post(protect, toggleWishlist);

// Recently Viewed
router.route("/recently-viewed")
    .get(protect, getRecentlyViewed)
    .post(protect, addRecentlyViewed)
    .delete(protect, clearRecentlyViewed);

module.exports = router;
