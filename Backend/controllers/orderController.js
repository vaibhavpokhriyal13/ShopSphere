const mongoose = require("mongoose");
const Order = require("../model/order");
const sendEmail = require("../utils/sendEmail");

const createOrder = async (req, res) => {
    try {
        const {
            items,
            totalAmount,
            address,
            city,
            state,
            pin,
            country,
            phone,
            paymentMethod,
            paidAt,
            shippingDetails,
            paymentId,
            paymentStatus
        } = req.body || {};

        if (!items || !items.length || !totalAmount) {
            return res.status(400).json({ message: "Items and total amount are required" });
        }

        // Seamless fallback between shippingDetails and top-level fields
        const orderAddress = address || shippingDetails?.address || "";
        const orderCity = city || shippingDetails?.city || "";
        const orderState = state || shippingDetails?.state || "";
        const orderPin = pin || shippingDetails?.pin || "";
        const orderCountry = country || shippingDetails?.country || "India";
        const orderPhone = phone || shippingDetails?.phone || "";

        const orderShippingDetails = shippingDetails || {
            name: req.user?.name || "Customer",
            phone: orderPhone,
            email: req.user?.email || "",
            address: orderAddress,
            city: orderCity,
            state: orderState,
            pin: orderPin,
            country: orderCountry
        };

        // Sanitize items so invalid MongoDB ObjectIds don't crash the query
        const sanitizedItems = items.map((it) => {
            const rawId = it.product?._id || it.product || it.id || it._id;
            const validObjectId = mongoose.Types.ObjectId.isValid(rawId) ? rawId : undefined;
            return {
                ...(validObjectId ? { product: validObjectId } : {}),
                name: it.name || it.product?.name || "Product Item",
                price: Number(it.price || it.product?.price || 0),
                quantity: Number(it.quantity) || 1
            };
        });

        const resolvedPaymentId = paymentId || (paymentMethod === "COD" ? `COD_${Date.now()}` : `pay_${Date.now()}`);

        const newOrder = new Order({
            user: req.user._id,
            items: sanitizedItems,
            totalAmount: Number(totalAmount),
            address: orderAddress,
            city: orderCity,
            state: orderState,
            pin: orderPin,
            country: orderCountry,
            phone: orderPhone,
            paymentMethod: paymentMethod || "RAZORPAY",
            paidAt: paidAt || (paymentMethod !== "COD" ? new Date() : undefined),
            shippingDetails: orderShippingDetails,
            paymentId: resolvedPaymentId,
            paymentStatus: paymentStatus || (paymentMethod === "COD" ? "pending" : "paid")
        });
        await newOrder.save();

        if (req.user && req.user.email) {
            try {
                await sendEmail(
                    req.user.email,
                    "Order Confirmation - ShopSphere",
                    `Hello ${req.user?.name || "Customer"},\n\nYour order #${newOrder._id} has been placed successfully!\nTotal Amount: ₹${newOrder.totalAmount}\nPayment Method: ${newOrder.paymentMethod}\nStatus: ${newOrder.paymentStatus}\n\nThank you for shopping with ShopSphere!`
                );
            } catch (mailErr) {
                console.warn("Email notification skipped:", mailErr.message);
            }
        }

        const message = `Dear ${req.user?.name || "Customer"}, your order has been placed successfully`;
        res.status(201).json({ message, order: newOrder });
    } catch (error) {
        console.error("Error creating order:", error);
        res.status(500).json({ message: error.message || "Internal server error" });
    }
};

const myOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id })
            .populate("items.product", "name price imageURL category")
            .sort({ createdAt: -1 });
        res.status(200).json(orders);
    } catch (error) {
        console.error("Error getting orders:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

const getOrders = async (req, res) => {
    try {
        const allOrders = await Order.find()
            .populate("user", "name email")
            .populate("items.product", "name price imageURL")
            .sort({ createdAt: -1 });
        res.status(200).json(allOrders);
    } catch (error) {
        console.error("Error getting orders:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

const getOrderById = async (req, res) => {
    try {
        const orderId = req.params.id;
        const foundOrder = await Order.findById(orderId)
            .populate("user", "name email")
            .populate("items.product", "name price imageURL");
        if (!foundOrder) {
            return res.status(404).json({ message: "Order not found" });
        }
        res.status(200).json(foundOrder);
    } catch (error) {
        console.error("Error getting order:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

const updateOrderStatus = async (req, res) => {
    try {
        const orderId = req.params.id;
        const foundOrder = await Order.findById(orderId);
        if (!foundOrder) {
            return res.status(404).json({ message: "Order not found" });
        }
        foundOrder.status = req.body.status || foundOrder.status;
        if (req.body.paymentStatus) {
            foundOrder.paymentStatus = req.body.paymentStatus;
        }
        await foundOrder.save();
        res.status(200).json({ message: "Order status updated successfully", order: foundOrder });
    } catch (error) {
        console.error("Error updating order:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

const cancelOrder = async (req, res) => {
    try {
        const orderId = req.params.id;
        const foundOrder = await Order.findById(orderId);
        if (!foundOrder) {
            return res.status(404).json({ message: "Order not found" });
        }

        // Only allow order owner or admin to cancel
        if (foundOrder.user.toString() !== req.user._id.toString() && req.user.role !== "admin") {
            return res.status(403).json({ message: "Not authorized to cancel this order" });
        }

        if (foundOrder.status === "delivered") {
            return res.status(400).json({ message: "Delivered orders cannot be cancelled" });
        }

        if (foundOrder.status === "cancelled") {
            return res.status(400).json({ message: "Order is already cancelled" });
        }

        foundOrder.status = "cancelled";
        await foundOrder.save();

        res.status(200).json({ message: "Order cancelled successfully", order: foundOrder });
    } catch (error) {
        console.error("Error cancelling order:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

module.exports = {
    createOrder,
    myOrders,
    getOrders,
    getOrderById,
    updateOrderStatus,
    cancelOrder
};