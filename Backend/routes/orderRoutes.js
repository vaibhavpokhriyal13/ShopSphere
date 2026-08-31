const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const { admin } = require("../middleware/adminMiddleware");
const {
    createOrder,
    getOrders,
    myOrders,
    getOrderById,
    updateOrderStatus,
    cancelOrder
} = require("../controllers/orderController");

router.route("/")
    .post(protect, createOrder)
    .get(protect, admin, getOrders);

router.route("/myorders")
    .get(protect, myOrders);

router.route("/:id")
    .get(protect, getOrderById);

router.route("/:id/cancel")
    .put(protect, cancelOrder);

router.route("/:id/status")
    .put(protect, admin, updateOrderStatus);

module.exports = router;
