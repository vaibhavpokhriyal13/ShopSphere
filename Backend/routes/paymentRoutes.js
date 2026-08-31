const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const {
    createOrder,
    verifyPayment,
    verifyWebhook,
    getPaymentDetails
} = require("../controllers/paymentController");
const router = express.Router();

router.post("/order", protect, createOrder);
router.post("/verify", protect, verifyPayment);
router.post("/webhook", verifyWebhook);
router.get("/:paymentId", protect, getPaymentDetails);

module.exports = router;
