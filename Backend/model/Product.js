const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    name: {
        type: String,
        required: true
    },
    rating: {
        type: Number,
        required: true
    },
    comment: {
        type: String,
        required: true
    }
}, { timestamps: true });

const specificationSchema = new mongoose.Schema({
    key: { type: String, required: true },
    value: { type: String, required: true }
}, { _id: false });

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    brand: {
        type: String,
        default: "ShopSphere"
    },
    sku: {
        type: String
    },
    price: {
        type: Number,
        required: true
    },
    originalPrice: {
        type: Number
    },
    discount: {
        type: Number,
        default: 0
    },
    description: {
        type: String,
        required: true
    },
    imageURL: {
        type: String,
        required: true
    },
    images: {
        type: [String],
        default: []
    },
    category: {
        type: String,
        required: true
    },
    countInStock: {
        type: Number,
        required: true,
        default: 0
    },
    rating: {
        type: Number,
        required: true,
        default: 0
    },
    numReviews: {
        type: Number,
        required: true,
        default: 0
    },
    features: {
        type: [String],
        default: []
    },
    specifications: {
        type: [specificationSchema],
        default: []
    },
    whatsInTheBox: {
        type: [String],
        default: []
    },
    shippingInfo: {
        shippingCharge: { type: Number, default: 0 },
        freeShipping: { type: Boolean, default: true },
        estimatedDelivery: { type: String, default: "2-4 business days" },
        codAvailable: { type: Boolean, default: true },
        deliveryRegions: { type: String, default: "Pan-India" }
    },
    returnPolicy: {
        returnWindow: { type: String, default: "7-Day Returns & Exchange" },
        warranty: { type: String, default: "1 Year Manufacturer Warranty" },
        replacement: { type: Boolean, default: true }
    },
    status: {
        type: String,
        enum: ["active", "draft", "out_of_stock", "archived"],
        default: "active"
    },
    reviews: [reviewSchema],
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }
}, { timestamps: true });

const Product = mongoose.model("Product", productSchema);

module.exports = Product;