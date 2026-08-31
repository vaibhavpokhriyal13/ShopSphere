const sendEmail = require("../utils/sendEmail");

// @desc    Submit Contact Us message
// @route   POST /api/contact
// @access  Public
const submitContactForm = async (req, res) => {
    try {
        const { name, email, subject, message } = req.body || {};

        if (!name || !email || !subject || !message) {
            return res.status(400).json({ message: "Please fill in all required fields (Name, Email, Subject, Message)." });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: "Please provide a valid email address." });
        }

        // Send notification email to support team / user
        const supportSubject = `ShopSphere Inquiry: [${subject}] from ${name}`;
        const supportBody = `New customer contact submission:\n\nName: ${name}\nEmail: ${email}\nSubject: ${subject}\n\nMessage:\n${message}\n\nSent at: ${new Date().toLocaleString("en-IN")}`;

        try {
            await sendEmail(email, "We received your message - ShopSphere Support", `Hello ${name},\n\nThank you for reaching out to ShopSphere. We have received your inquiry regarding "${subject}" and our customer care team will respond within 24 business hours.\n\nBest regards,\nShopSphere India Team`);
        } catch (mailErr) {
            console.warn("Contact confirmation email skipped:", mailErr.message);
        }

        res.status(200).json({
            success: true,
            message: "Your message has been sent successfully. Our support team will get back to you shortly."
        });
    } catch (error) {
        console.error("Error submitting contact form:", error);
        res.status(500).json({ message: "Failed to send message. Please try again later." });
    }
};

module.exports = {
    submitContactForm
};
