const Razorpay = require("razorpay");
const crypto = require("crypto");
const Order = require("../model/order");
const dotenv = require("dotenv").config();

// Lazy initializer for Razorpay instance to prevent server crash if env keys are missing at startup
const getRazorpayInstance = () => {
    const keyId = process.env.RAZORPAY_KEY_ID ? process.env.RAZORPAY_KEY_ID.trim() : null;
    const keySecret = process.env.RAZORPAY_KEY_SECRET ? process.env.RAZORPAY_KEY_SECRET.trim() : null;
    if (!keyId || !keySecret) {
        return null;
    }
    return new Razorpay({
        key_id: keyId,
        key_secret: keySecret,
    });
};


// @desc    Create Razorpay Order
// @route   POST /api/payment/order
// @access  Private
const createOrder = async (req, res) => {
    try {
        const razorpayInstance = getRazorpayInstance();
        if (!razorpayInstance) {
            return res.status(500).json({
                message: "Razorpay keys (RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET) are not configured in .env"
            });
        }

        const { amount, currency, receipt, notes } = req.body;

        if (!amount) {
            return res.status(400).json({ message: "Amount is required" });
        }

        const options = {
            amount: Math.round(Number(amount) * 100), // amount in smallest currency unit (paise)
            currency: currency || "INR",
            receipt: receipt || `receipt_${Date.now()}`,
            notes: notes || {}
        };

        const razorpayOrder = await razorpayInstance.orders.create(options);
        res.status(200).json(razorpayOrder);
    } catch (error) {
        console.error("Error creating Razorpay order:", error);
        res.status(500).json({ message: error.message || "Internal server error" });
    }
};

// @desc    Verify Razorpay Payment Signature with HMAC SHA256 Digest
// @route   POST /api/payment/verify
// @access  Private
const verifyPayment = async (req, res) => {
    try {
        const {
            razorpayOrderId,
            razorpayPaymentId,
            razorpaySignature,
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            orderId // Optional: MongoDB Order ID to automatically update payment status
        } = req.body;

        const order_id = razorpayOrderId || razorpay_order_id;
        const payment_id = razorpayPaymentId || razorpay_payment_id;
        const signature = razorpaySignature || razorpay_signature;

        if (!order_id || !payment_id || !signature) {
            return res.status(400).json({
                success: false,
                message: "Missing payment verification parameters (order_id, payment_id, signature)"
            });
        }

        if (!process.env.RAZORPAY_KEY_SECRET) {
            return res.status(500).json({
                success: false,
                message: "RAZORPAY_KEY_SECRET is not configured in .env"
            });
        }

        // Generate HMAC SHA256 digest
        const payload = `${order_id}|${payment_id}`;
        const generatedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(payload)
            .digest("hex");

        // Compare signatures
        const isAuthentic = generatedSignature === signature;

        if (isAuthentic) {
            // If MongoDB orderId was supplied, update order status in DB
            if (orderId) {
                const dbOrder = await Order.findById(orderId);
                if (dbOrder) {
                    dbOrder.paymentStatus = "paid";
                    dbOrder.paymentId = payment_id;
                    dbOrder.paidAt = new Date();
                    await dbOrder.save();
                }
            }

            return res.status(200).json({
                success: true,
                message: "Payment verified successfully",
                paymentId: payment_id,
                orderId: order_id
            });
        } else {
            return res.status(400).json({
                success: false,
                message: "Invalid payment signature (HMAC digest mismatch)"
            });
        }
    } catch (error) {
        console.error("Error verifying payment:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// @desc    Razorpay Webhook verification with HMAC digest
// @route   POST /api/payment/webhook
// @access  Public (Razorpay server)
const verifyWebhook = async (req, res) => {
    try {
        const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET;

        if (!webhookSecret) {
            return res.status(500).json({ message: "Webhook secret is not configured" });
        }

        const webhookSignature = req.headers["x-razorpay-signature"];
        if (!webhookSignature) {
            return res.status(400).json({ message: "Missing x-razorpay-signature header" });
        }

        const expectedSignature = crypto
            .createHmac("sha256", webhookSecret)
            .update(JSON.stringify(req.body))
            .digest("hex");

        if (expectedSignature === webhookSignature) {
            const event = req.body.event;

            if (event === "payment.captured" || event === "order.paid") {
                const paymentEntity = req.body.payload?.payment?.entity;
                if (paymentEntity) {
                    const dbOrder = await Order.findOne({ paymentId: paymentEntity.id });
                    if (dbOrder) {
                        dbOrder.paymentStatus = "paid";
                        dbOrder.paidAt = new Date();
                        await dbOrder.save();
                    }
                }
            }

            return res.status(200).json({ status: "ok" });
        } else {
            return res.status(400).json({ message: "Invalid webhook signature" });
        }
    } catch (error) {
        console.error("Error handling webhook:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// @desc    Get payment details from Razorpay
// @route   GET /api/payment/:paymentId
// @access  Private
const getPaymentDetails = async (req, res) => {
    try {
        const razorpayInstance = getRazorpayInstance();
        if (!razorpayInstance) {
            return res.status(500).json({ message: "Razorpay keys not configured" });
        }

        const payment = await razorpayInstance.payments.fetch(req.params.paymentId);
        if (!payment) {
            return res.status(404).json({ message: "Payment not found" });
        }

        res.status(200).json(payment);
    } catch (error) {
        console.error("Error fetching payment details:", error);
        res.status(500).json({ message: error.message || "Internal server error" });
    }
};

module.exports = {
    createOrder,
    verifyPayment,
    verifyWebhook,
    getPaymentDetails
};