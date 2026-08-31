const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../model/User");
const { chatWithAI } = require("../controllers/aiController");

// Optional Auth Middleware (attaches req.user if Bearer token is provided, but does not block guests)
const optionalAuth = async (req, res, next) => {
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      const token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (decoded && decoded.id) {
        req.user = await User.findById(decoded.id).select("-password");
      }
    } catch (err) {
      // Guest mode on invalid token
      req.user = null;
    }
  }
  next();
};

router.post("/chat", optionalAuth, chatWithAI);

module.exports = router;
