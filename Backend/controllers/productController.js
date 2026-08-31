const fs = require("fs");
const Product = require("../model/Product");
const cloudinary = require("../config/cloudinary");

// Safe JSON parser helper for multipart/form-data inputs
const safeParse = (val, fallback = []) => {
    if (typeof val === "string") {
        try {
            return JSON.parse(val);
        } catch (e) {
            return fallback;
        }
    }
    return val || fallback;
};

// Get all Products
// @route GET /api/product
// @access Public
const getProducts = async (req, res) => {
    try {
        const { category, search, sort } = req.query;
        let query = {};

        if (category && category !== "all") {
            query.category = new RegExp(`^${category}$`, "i");
        }

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } },
                { brand: { $regex: search, $options: "i" } }
            ];
        }

        let sortOption = { createdAt: -1 };
        if (sort === "price-low") {
            sortOption = { price: 1 };
        } else if (sort === "price-high") {
            sortOption = { price: -1 };
        } else if (sort === "rating") {
            sortOption = { rating: -1 };
        }

        const products = await Product.find(query).sort(sortOption);
        res.status(200).json(products);
    } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Get a Single Product by ID
// @route GET /api/product/:id
// @access Public
const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (product) {
            res.status(200).json(product);
        } else {
            res.status(404).json({ message: "Product not found" });
        }
    } catch (error) {
        console.error("Error fetching product by ID:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Create a Product (Admin only)
// @route POST /api/product
// @access Private/Admin
const createProduct = async (req, res) => {
    try {
        const body = req.body || {};
        let finalImageUrl = body.imageURL || "";

        if (req.file) {
            const uploadResult = await cloudinary.uploader.upload(req.file.path);
            finalImageUrl = uploadResult.secure_url;
            if (fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }
        }

        const features = safeParse(body.features, []);
        const specifications = safeParse(body.specifications, []);
        const whatsInTheBox = safeParse(body.whatsInTheBox, []);
        const images = safeParse(body.images, []);
        const shippingInfo = typeof body.shippingInfo === "string" ? safeParse(body.shippingInfo, {}) : (body.shippingInfo || {});
        const returnPolicy = typeof body.returnPolicy === "string" ? safeParse(body.returnPolicy, {}) : (body.returnPolicy || {});

        const product = await Product.create({
            name: body.name,
            brand: body.brand || "ShopSphere",
            sku: body.sku || ("SKU-" + Math.floor(100000 + Math.random() * 900000)),
            price: Number(body.price),
            originalPrice: body.originalPrice ? Number(body.originalPrice) : undefined,
            discount: body.discount ? Number(body.discount) : 0,
            description: body.description,
            imageURL: finalImageUrl,
            images: Array.isArray(images) && images.length > 0 ? images : [finalImageUrl].filter(Boolean),
            category: body.category,
            countInStock: body.countInStock !== undefined ? Number(body.countInStock) : 0,
            rating: body.rating !== undefined ? Number(body.rating) : 4.8,
            numReviews: body.numReviews !== undefined ? Number(body.numReviews) : 0,
            features,
            specifications,
            whatsInTheBox,
            shippingInfo: {
                shippingCharge: shippingInfo.shippingCharge !== undefined ? Number(shippingInfo.shippingCharge) : 0,
                freeShipping: shippingInfo.freeShipping !== undefined ? Boolean(shippingInfo.freeShipping) : true,
                estimatedDelivery: shippingInfo.estimatedDelivery || "2-4 business days",
                codAvailable: shippingInfo.codAvailable !== undefined ? Boolean(shippingInfo.codAvailable) : true,
                deliveryRegions: shippingInfo.deliveryRegions || "Pan-India"
            },
            returnPolicy: {
                returnWindow: returnPolicy.returnWindow || "7-Day Returns & Exchange",
                warranty: returnPolicy.warranty || "1 Year Manufacturer Warranty",
                replacement: returnPolicy.replacement !== undefined ? Boolean(returnPolicy.replacement) : true
            },
            status: body.status || "active",
            user: req.user?._id
        });

        res.status(201).json({ message: "Product created successfully", product });
    } catch (error) {
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        console.error("Error creating product:", error);
        res.status(500).json({ message: error.message || "Internal server error" });
    }
};

// Update a Product (Admin only)
// @route PUT /api/product/:id
// @access Private/Admin
const updateProduct = async (req, res) => {
    try {
        const body = req.body || {};
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        let finalImageUrl = body.imageURL || product.imageURL;
        if (req.file) {
            const uploadResult = await cloudinary.uploader.upload(req.file.path);
            finalImageUrl = uploadResult.secure_url;
            if (fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }
        }

        // Update core fields
        if (body.name !== undefined) product.name = body.name;
        if (body.brand !== undefined) product.brand = body.brand;
        if (body.sku !== undefined) product.sku = body.sku;
        if (body.price !== undefined) product.price = Number(body.price);
        if (body.originalPrice !== undefined) product.originalPrice = Number(body.originalPrice);
        if (body.discount !== undefined) product.discount = Number(body.discount);
        if (body.description !== undefined) product.description = body.description;
        if (finalImageUrl) product.imageURL = finalImageUrl;
        if (body.category !== undefined) product.category = body.category;
        if (body.countInStock !== undefined) product.countInStock = Number(body.countInStock);
        if (body.status !== undefined) product.status = body.status;

        // Update parsed arrays/objects
        if (body.features !== undefined) {
            product.features = safeParse(body.features, product.features);
        }
        if (body.specifications !== undefined) {
            product.specifications = safeParse(body.specifications, product.specifications);
        }
        if (body.whatsInTheBox !== undefined) {
            product.whatsInTheBox = safeParse(body.whatsInTheBox, product.whatsInTheBox);
        }
        if (body.images !== undefined) {
            product.images = safeParse(body.images, product.images);
        }

        // Update shippingInfo
        if (body.shippingInfo !== undefined) {
            const parsedShip = typeof body.shippingInfo === "string" ? safeParse(body.shippingInfo, {}) : body.shippingInfo;
            product.shippingInfo = {
                shippingCharge: parsedShip.shippingCharge !== undefined ? Number(parsedShip.shippingCharge) : product.shippingInfo?.shippingCharge || 0,
                freeShipping: parsedShip.freeShipping !== undefined ? Boolean(parsedShip.freeShipping) : (product.shippingInfo?.freeShipping ?? true),
                estimatedDelivery: parsedShip.estimatedDelivery || product.shippingInfo?.estimatedDelivery || "2-4 business days",
                codAvailable: parsedShip.codAvailable !== undefined ? Boolean(parsedShip.codAvailable) : (product.shippingInfo?.codAvailable ?? true),
                deliveryRegions: parsedShip.deliveryRegions || product.shippingInfo?.deliveryRegions || "Pan-India"
            };
        }

        // Update returnPolicy
        if (body.returnPolicy !== undefined) {
            const parsedReturn = typeof body.returnPolicy === "string" ? safeParse(body.returnPolicy, {}) : body.returnPolicy;
            product.returnPolicy = {
                returnWindow: parsedReturn.returnWindow || product.returnPolicy?.returnWindow || "7-Day Returns & Exchange",
                warranty: parsedReturn.warranty || product.returnPolicy?.warranty || "1 Year Manufacturer Warranty",
                replacement: parsedReturn.replacement !== undefined ? Boolean(parsedReturn.replacement) : (product.returnPolicy?.replacement ?? true)
            };
        }

        const updatedProduct = await product.save();
        res.status(200).json({ message: "Product updated successfully", product: updatedProduct });
    } catch (error) {
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        console.error("Error updating product:", error);
        res.status(500).json({ message: error.message || "Internal server error" });
    }
};

// Delete a Product (Admin only)
// @route DELETE /api/product/:id
// @access Private/Admin
const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (product) {
            await product.deleteOne();
            res.status(200).json({ message: "Product deleted successfully" });
        } else {
            res.status(404).json({ message: "Product not found" });
        }
    } catch (error) {
        console.error("Error deleting product:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Add a Product Review
// @route POST /api/product/:id/review
// @access Private
const reviewProduct = async (req, res) => {
    try {
        const { rating, comment } = req.body || {};
        const product = await Product.findById(req.params.id);
        if (product) {
            const review = {
                user: req.user?._id,
                name: req.user?.name || "Verified Customer",
                rating: Number(rating) || 5,
                comment: comment || "Excellent product!"
            };
            product.reviews.unshift(review);
            product.numReviews = product.reviews.length;
            product.rating = Number((product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length).toFixed(1));
            await product.save();
            res.status(201).json({ message: "Review added successfully", reviews: product.reviews });
        } else {
            res.status(404).json({ message: "Product not found" });
        }
    } catch (error) {
        console.error("Error adding review:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

module.exports = {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    reviewProduct
};
