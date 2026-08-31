const User = require("../model/User");
const Product = require("../model/Product");
const bcrypt = require("bcryptjs");

// @desc    Get user profile with addresses, payment preferences, etc.
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
            .select("-password -otp -otpExpires")
            .populate("wishlist", "name price originalPrice imageURL image category rating inStock")
            .populate("recentlyViewed", "name price originalPrice imageURL image category rating inStock");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json(user);
    } catch (error) {
        console.error("Error getting user profile:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// @desc    Update user profile (name, phone)
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (req.body.name) user.name = req.body.name.trim();
        if (req.body.phone !== undefined) user.phone = req.body.phone.trim();

        await user.save();

        res.status(200).json({
            message: "Profile updated successfully",
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                isVerified: user.isVerified
            }
        });
    } catch (error) {
        console.error("Error updating user profile:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// @desc    Change password
// @route   PUT /api/users/change-password
// @access  Private
const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body || {};

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: "Current password and new password are required" });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ message: "New password must be at least 6 characters long" });
        }

        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Current password does not match" });
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();

        res.status(200).json({ message: "Password changed successfully" });
    } catch (error) {
        console.error("Error changing password:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// ==================== ADDRESSES ====================

// @desc    Get user's saved addresses
// @route   GET /api/users/addresses
// @access  Private
const getAddresses = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select("addresses");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json(user.addresses || []);
    } catch (error) {
        console.error("Error getting addresses:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// @desc    Add new address
// @route   POST /api/users/addresses
// @access  Private
const addAddress = async (req, res) => {
    try {
        const { fullName, phone, street, apartment, city, state, pinCode, country, isDefault } = req.body || {};

        if (!fullName || !phone || !street || !city || !state || !pinCode) {
            return res.status(400).json({ message: "All required address fields must be provided" });
        }

        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // If this is the first address or marked isDefault, set others to false
        const shouldBeDefault = isDefault || user.addresses.length === 0;
        if (shouldBeDefault) {
            user.addresses.forEach(addr => { addr.isDefault = false; });
        }

        const newAddress = {
            fullName: fullName.trim(),
            phone: phone.trim(),
            street: street.trim(),
            apartment: apartment ? apartment.trim() : "",
            city: city.trim(),
            state: state.trim(),
            pinCode: pinCode.trim(),
            country: country ? country.trim() : "India",
            isDefault: shouldBeDefault
        };

        user.addresses.push(newAddress);
        await user.save();

        res.status(201).json({
            message: "Address added successfully",
            addresses: user.addresses,
            address: user.addresses[user.addresses.length - 1]
        });
    } catch (error) {
        console.error("Error adding address:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// @desc    Update an address
// @route   PUT /api/users/addresses/:id
// @access  Private
const updateAddress = async (req, res) => {
    try {
        const addressId = req.params.id;
        const { fullName, phone, street, apartment, city, state, pinCode, country, isDefault } = req.body || {};

        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const address = user.addresses.id(addressId);
        if (!address) {
            return res.status(404).json({ message: "Address not found" });
        }

        if (isDefault) {
            user.addresses.forEach(addr => { addr.isDefault = false; });
            address.isDefault = true;
        } else if (isDefault === false && address.isDefault && user.addresses.length > 1) {
            address.isDefault = false;
            // set another address as default
            const another = user.addresses.find(a => a._id.toString() !== addressId);
            if (another) another.isDefault = true;
        }

        if (fullName) address.fullName = fullName.trim();
        if (phone) address.phone = phone.trim();
        if (street) address.street = street.trim();
        if (apartment !== undefined) address.apartment = apartment.trim();
        if (city) address.city = city.trim();
        if (state) address.state = state.trim();
        if (pinCode) address.pinCode = pinCode.trim();
        if (country) address.country = country.trim();

        await user.save();

        res.status(200).json({
            message: "Address updated successfully",
            addresses: user.addresses
        });
    } catch (error) {
        console.error("Error updating address:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// @desc    Delete an address
// @route   DELETE /api/users/addresses/:id
// @access  Private
const deleteAddress = async (req, res) => {
    try {
        const addressId = req.params.id;
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const address = user.addresses.id(addressId);
        if (!address) {
            return res.status(404).json({ message: "Address not found" });
        }

        const wasDefault = address.isDefault;
        user.addresses.pull({ _id: addressId });

        // If deleted address was default, make the first remaining address default
        if (wasDefault && user.addresses.length > 0) {
            user.addresses[0].isDefault = true;
        }

        await user.save();

        res.status(200).json({
            message: "Address deleted successfully",
            addresses: user.addresses
        });
    } catch (error) {
        console.error("Error deleting address:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// @desc    Set default address
// @route   PUT /api/users/addresses/:id/default
// @access  Private
const setDefaultAddress = async (req, res) => {
    try {
        const addressId = req.params.id;
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        let found = false;
        user.addresses.forEach(addr => {
            if (addr._id.toString() === addressId) {
                addr.isDefault = true;
                found = true;
            } else {
                addr.isDefault = false;
            }
        });

        if (!found) {
            return res.status(404).json({ message: "Address not found" });
        }

        await user.save();

        res.status(200).json({
            message: "Default address updated",
            addresses: user.addresses
        });
    } catch (error) {
        console.error("Error setting default address:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// ==================== PAYMENT PREFERENCES ====================

// @desc    Get user payment preferences
// @route   GET /api/users/payment-preferences
// @access  Private
const getPaymentPreferences = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select("paymentPreferences");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json(user.paymentPreferences || { preferredMethod: "UPI", upiId: "" });
    } catch (error) {
        console.error("Error getting payment preferences:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// @desc    Update user payment preferences
// @route   PUT /api/users/payment-preferences
// @access  Private
const updatePaymentPreferences = async (req, res) => {
    try {
        const { preferredMethod, upiId } = req.body || {};

        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (!user.paymentPreferences) {
            user.paymentPreferences = {};
        }

        if (preferredMethod) {
            user.paymentPreferences.preferredMethod = preferredMethod;
        }
        if (upiId !== undefined) {
            user.paymentPreferences.upiId = upiId.trim();
        }

        await user.save();

        res.status(200).json({
            message: "Payment preferences updated",
            paymentPreferences: user.paymentPreferences
        });
    } catch (error) {
        console.error("Error updating payment preferences:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// ==================== WISHLIST ====================

// @desc    Get wishlist
// @route   GET /api/users/wishlist
// @access  Private
const getWishlist = async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
            .populate("wishlist", "name subtitle price originalPrice imageURL image category rating inStock features");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json(user.wishlist || []);
    } catch (error) {
        console.error("Error getting wishlist:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// @desc    Toggle item in wishlist
// @route   POST /api/users/wishlist/toggle
// @access  Private
const toggleWishlist = async (req, res) => {
    try {
        const { productId } = req.body || {};
        if (!productId) {
            return res.status(400).json({ message: "Product ID is required" });
        }

        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const index = user.wishlist.findIndex(id => id.toString() === productId.toString());
        let inWishlist = false;

        if (index > -1) {
            user.wishlist.splice(index, 1);
            inWishlist = false;
        } else {
            user.wishlist.push(productId);
            inWishlist = true;
        }

        await user.save();

        res.status(200).json({
            message: inWishlist ? "Product added to wishlist" : "Product removed from wishlist",
            inWishlist,
            wishlistCount: user.wishlist.length,
            wishlist: user.wishlist
        });
    } catch (error) {
        console.error("Error toggling wishlist:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// ==================== RECENTLY VIEWED ====================

// @desc    Get recently viewed products
// @route   GET /api/users/recently-viewed
// @access  Private
const getRecentlyViewed = async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
            .populate("recentlyViewed", "name subtitle price originalPrice imageURL image category rating inStock");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json(user.recentlyViewed || []);
    } catch (error) {
        console.error("Error getting recently viewed:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// @desc    Add product to recently viewed
// @route   POST /api/users/recently-viewed
// @access  Private
const addRecentlyViewed = async (req, res) => {
    try {
        const { productId } = req.body || {};
        if (!productId) {
            return res.status(400).json({ message: "Product ID is required" });
        }

        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Remove if exists to push to the front
        user.recentlyViewed = user.recentlyViewed.filter(id => id.toString() !== productId.toString());
        user.recentlyViewed.unshift(productId);

        // Keep maximum 20 items
        if (user.recentlyViewed.length > 20) {
            user.recentlyViewed = user.recentlyViewed.slice(0, 20);
        }

        await user.save();

        res.status(200).json({
            message: "Added to recently viewed",
            recentlyViewed: user.recentlyViewed
        });
    } catch (error) {
        console.error("Error adding recently viewed:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// @desc    Clear recently viewed
// @route   DELETE /api/users/recently-viewed
// @access  Private
const clearRecentlyViewed = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        user.recentlyViewed = [];
        await user.save();

        res.status(200).json({ message: "Recently viewed cleared" });
    } catch (error) {
        console.error("Error clearing recently viewed:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

module.exports = {
    getUserProfile,
    updateUserProfile,
    changePassword,
    getAddresses,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
    getPaymentPreferences,
    updatePaymentPreferences,
    getWishlist,
    toggleWishlist,
    getRecentlyViewed,
    addRecentlyViewed,
    clearRecentlyViewed
};
