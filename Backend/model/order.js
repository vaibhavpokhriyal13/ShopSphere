const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    items: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product",
                required: false
            },
            name: { type: String },
            price: { type: Number },
            quantity: {
                type: Number,
                required: true,
                default: 1
            }
        }
    ],
    totalAmount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
        default: "pending"
    },
    address: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    state: {
        type: String,
        required: true
    },
    pin: {
        type: String,
        required: true
    },
    country: {
        type: String,
        required: true,
        default: "India"
    },
    phone: {
        type: String,
        required: true
    },
    paymentMethod: {
        type: String,
        default: "RAZORPAY"
    },
    paidAt: {
        type: Date
    },
    shippingDetails: {
        name: { type: String },
        phone: { type: String },
        email: { type: String },
        address: { type: String },
        city: { type: String },
        state: { type: String },
        pin: { type: String },
        country: { type: String, default: "India" }
    },
    paymentId: {
        type: String
    },
    paymentStatus: {
        type: String,
        enum: ["pending", "paid", "failed"],
        default: "pending"
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Order", orderSchema);