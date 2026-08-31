const Order = require("../model/order");
const User = require("../model/User");
const Product = require("../model/Product");

// @desc    Get admin dashboard overall stats
// @route   GET /api/analytics/admin/dashboard
// @access  Private/Admin
const getAdminDashboardStats = async (req, res) => {
    try {
        const revenueResult = await Order.aggregate([
            { $group: { _id: null, totalRevenue: { $sum: "$totalAmount" } } }
        ]);
        const totalRevenue = revenueResult[0]?.totalRevenue || 0;

        const totalOrders = await Order.countDocuments();
        const totalUsers = await User.countDocuments();
        const totalProducts = await Product.countDocuments();

        const recentOrders = await Order.find()
            .populate("user", "name email")
            .sort({ createdAt: -1 })
            .limit(10);

        res.status(200).json({
            totalRevenue,
            totalOrders,
            totalUsers,
            totalProducts,
            recentOrders
        });
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch admin dashboard stats", error: error.message });
    }
};

// @desc    Get total revenue stats
// @route   GET /api/analytics/revenue
// @access  Private/Admin
const getTotalRevenue = async (req, res) => {
    try {
        const revenueResult = await Order.aggregate([
            { $group: { _id: null, totalRevenue: { $sum: "$totalAmount" } } }
        ]);
        res.status(200).json({ totalRevenue: revenueResult[0]?.totalRevenue || 0 });
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch total revenue", error: error.message });
    }
};

// @desc    Get order statistics (counts by status)
// @route   GET /api/analytics/orders
// @access  Private/Admin
const getOrderStats = async (req, res) => {
    try {
        const orderStats = await Order.aggregate([
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 }
                }
            }
        ]);
        res.status(200).json(orderStats);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch order stats", error: error.message });
    }
};

// @desc    Get user statistics
// @route   GET /api/analytics/users
// @access  Private/Admin
const getUserStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const userStats = await User.aggregate([
            {
                $group: {
                    _id: "$role",
                    count: { $sum: 1 }
                }
            }
        ]);
        res.status(200).json({ totalUsers, breakdown: userStats });
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch user stats", error: error.message });
    }
};

// @desc    Get top products
// @route   GET /api/analytics/top-products
// @access  Private/Admin
const getTopProducts = async (req, res) => {
    try {
        const topProducts = await Product.find()
            .sort({ rating: -1, numReviews: -1 })
            .limit(5);
        res.status(200).json(topProducts);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch top products", error: error.message });
    }
};

// @desc    Get sales trend (grouped by date)
// @route   GET /api/analytics/sales-trend
// @access  Private/Admin
const getSalesTrend = async (req, res) => {
    try {
        const salesTrend = await Order.aggregate([
            {
                $group: {
                    _id: {
                        $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
                    },
                    totalSales: { $sum: "$totalAmount" },
                    ordersCount: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);
        res.status(200).json(salesTrend);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch sales trend", error: error.message });
    }
};

// @desc    Get category-wise product distribution for pie chart
// @route   GET /api/analytics/pie-chart
// @access  Private/Admin
const getPieChartData = async (req, res) => {
    try {
        const categoryData = await Product.aggregate([
            {
                $group: {
                    _id: "$category",
                    count: { $sum: 1 }
                }
            }
        ]);
        res.status(200).json(categoryData);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch pie chart data", error: error.message });
    }
};

// @desc    Get recent orders
// @route   GET /api/analytics/recent-orders
// @access  Private/Admin
const getRecentOrders = async (req, res) => {
    try {
        const recentOrders = await Order.find()
            .populate("user", "name email")
            .sort({ createdAt: -1 })
            .limit(10);
        res.status(200).json(recentOrders);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch recent orders", error: error.message });
    }
};

module.exports = {
    getAdminDashboardStats,
    getTotalRevenue,
    getOrderStats,
    getUserStats,
    getTopProducts,
    getSalesTrend,
    getPieChartData,
    getRecentOrders
};