const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { admin } = require("../middleware/adminMiddleware");
const {
    getAdminDashboardStats,
    getTotalRevenue,
    getOrderStats,
    getUserStats,
    getTopProducts,
    getSalesTrend,
    getPieChartData,
    getRecentOrders
} = require("../controllers/analyticsController");

router.get("/", protect, admin, getAdminDashboardStats);
router.get("/admin/dashboard", protect, admin, getAdminDashboardStats);
router.get("/revenue", protect, admin, getTotalRevenue);
router.get("/orders", protect, admin, getOrderStats);
router.get("/users", protect, admin, getUserStats);
router.get("/top-products", protect, admin, getTopProducts);
router.get("/sales-trend", protect, admin, getSalesTrend);
router.get("/pie-chart", protect, admin, getPieChartData);
router.get("/recent-orders", protect, admin, getRecentOrders);

module.exports = router;

