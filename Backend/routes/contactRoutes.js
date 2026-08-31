const express = require("express");
const router = express.Router();
const { submitContactForm } = require("../controllers/contactController");

router.route("/")
    .post(submitContactForm);

module.exports = router;
