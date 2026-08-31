const nodemailer = require("nodemailer");

const sendEmail = async (to, subject, text, html) => {
    try {
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            console.log(`[Email Service - Simulated]\nTo: ${to}\nSubject: ${subject}\nText: ${text}`);
            return { success: true, simulated: true };
        }

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const info = await transporter.sendMail({
            from: `"ShopSphere" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            text,
            html: html || undefined
        });

        console.log(`[Email Sent] Message ID: ${info.messageId} to ${to}`);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error("Nodemailer error sending email:", error.message || error);
        return { success: false, error: error.message };
    }
};

module.exports = sendEmail;
