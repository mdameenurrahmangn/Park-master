const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

const sendEmail = async ({ to, subject, html, text, otp }) => {
    // Reload env to ensure fresh credentials after user edits .env
    dotenv.config();

    const smtpHost = process.env.SMTP_HOST || process.env.EMAIL_HOST || 'smtp.gmail.com';
    const smtpPort = process.env.SMTP_PORT || process.env.EMAIL_PORT || 465;
    const smtpUser = process.env.SMTP_USER || process.env.EMAIL_USER;
    const smtpPass = process.env.SMTP_PASS || process.env.EMAIL_PASS;
    const fromAddress = process.env.EMAIL_FROM || (smtpUser ? `"ParkMaster Security" <${smtpUser}>` : '"ParkMaster Security" <no-reply@parkmaster.com>');

    if (!smtpUser || !smtpPass) {
        console.error(`[ParkMaster Email Error] Cannot send real email to ${to}: SMTP_USER or SMTP_PASS is missing in server/.env`);
        throw new Error('Email service credentials are missing. Please configure SMTP_USER and SMTP_PASS (e.g., Gmail App Password) in server/.env.');
    }

    try {
        const transporter = nodemailer.createTransport({
            host: smtpHost,
            port: Number(smtpPort),
            secure: Number(smtpPort) === 465,
            auth: {
                user: smtpUser,
                pass: smtpPass,
            },
        });

        const mailOptions = {
            from: fromAddress,
            to,
            subject,
            text,
            html,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`[ParkMaster Email] Email sent successfully to ${to}! Message ID: ${info.messageId}`);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error(`[ParkMaster Email Error] Failed to send email via SMTP: ${error.message}`);
        throw new Error(`Failed to send email to ${to}: ${error.message}`);
    }
};

module.exports = sendEmail;
