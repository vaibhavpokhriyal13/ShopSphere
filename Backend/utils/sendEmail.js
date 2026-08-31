const nodemailer = require("nodemailer");

const sendEmail = async (to, subject, text) => {
    try {
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            console.log(`[Email Mock] To: ${to} | Subject: ${subject} | Text: ${text}`);
            return;
        }

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
        await transporter.sendMail({ to, subject, text });
    } catch (error) {
        console.error("Error sending email:", error.message || error);
    }
};

module.exports = sendEmail;
