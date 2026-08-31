const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer({ dest: 'uploads/' });

const { protect } = require("../middleware/authMiddleware");
const { admin } = require("../middleware/adminMiddleware");

const {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    reviewProduct
} = require("../controllers/productController");


// @desc Auth user/register
// @route POST /api/auth
// @access Public


//all products and create product
router.route("/").get(getProducts).post(protect, admin, upload.single("image"), createProduct);

// specific product and update product and delete product
router.route("/:id").get(getProductById).put(protect, admin, upload.single("image"), updateProduct).delete(protect, admin, deleteProduct);

// product review
router.route("/:id/review").post(protect, reviewProduct);

module.exports = router;