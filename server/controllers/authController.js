const asyncHandler = require('express-async-handler');
const Admin = require('../models/Admin');
const generateToken = require('../utils/generateToken');
const sendEmail = require('../utils/sendEmail');

// @desc    Register a new admin (Initial setup)
// @route   POST /api/auth/register
// @access  Public (Should be disabled or secured after first admin is created in production)
const registerAdmin = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        res.status(400);
        throw new Error('Please provide all required fields');
    }

    const adminExists = await Admin.findOne({ email });
    if (adminExists) {
        res.status(400);
        throw new Error('Admin already exists with this email');
    }

    const admin = await Admin.create({ name, email, password });

    if (admin) {
        res.status(201).json({
            _id: admin._id,
            name: admin.name,
            email: admin.email,
            role: admin.role,
            token: generateToken(admin._id, admin.role),
        });
    } else {
        res.status(400);
        throw new Error('Invalid admin data');
    }
});

// @desc    Auth admin & get token
// @route   POST /api/auth/login
// @access  Public
const loginAdmin = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });

    if (admin && (await admin.matchPassword(password))) {
        res.json({
            _id: admin._id,
            name: admin.name,
            email: admin.email,
            role: admin.role,
            token: generateToken(admin._id, admin.role),
        });
    } else {
        res.status(401);
        throw new Error('Invalid email or password');
    }
});

// @desc    Get admin profile
// @route   GET /api/auth/profile
// @access  Private
const getAdminProfile = asyncHandler(async (req, res) => {
    const admin = await Admin.findById(req.admin._id);

    if (admin) {
        res.json({
            _id: admin._id,
            name: admin.name,
            email: admin.email,
            role: admin.role,
        });
    } else {
        res.status(404);
        throw new Error('Admin not found');
    }
});

// @desc    Update admin profile
// @route   PUT /api/auth/profile
// @access  Private
const updateAdminProfile = asyncHandler(async (req, res) => {
    const admin = await Admin.findById(req.admin._id);

    if (admin) {
        admin.name = req.body.name || admin.name;
        admin.email = req.body.email || admin.email;

        if (req.body.password) {
            admin.password = req.body.password;
        }

        const updatedAdmin = await admin.save();

        res.json({
            _id: updatedAdmin._id,
            name: updatedAdmin.name,
            email: updatedAdmin.email,
            role: updatedAdmin.role,
            token: generateToken(updatedAdmin._id, updatedAdmin.role),
        });
    } else {
        res.status(404);
        throw new Error('Admin not found');
    }
});

// @desc    Request OTP for Password Reset
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPasswordOTP = asyncHandler(async (req, res) => {
    const { email } = req.body;

    if (!email) {
        res.status(400);
        throw new Error('Please provide your email address');
    }

    const admin = await Admin.findOne({ email: email.toLowerCase().trim() });

    if (!admin) {
        res.status(404);
        throw new Error('No admin account found with this email address');
    }

    // Generate 6-digit numeric OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 mins validity

    admin.resetOtp = otp;
    admin.resetOtpExpires = otpExpiry;
    await admin.save();

    const emailResult = await sendEmail({
        to: admin.email,
        subject: 'ParkMaster Security: Password Reset OTP',
        otp,
        text: `Your ParkMaster password reset OTP is ${otp}. It will expire in 15 minutes.`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; rounded-radius: 8px;">
                <h2 style="color: #4f46e5; text-align: center;">ParkMaster Security</h2>
                <p>Hello <strong>${admin.name}</strong>,</p>
                <p>You requested a password reset for your ParkMaster admin account. Use the OTP code below to verify your request:</p>
                <div style="text-align: center; margin: 24px 0;">
                    <span style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #4f46e5; background: #eef2ff; padding: 12px 24px; border-radius: 8px; border: 1px dashed #6366f1; display: inline-block;">
                        ${otp}
                    </span>
                </div>
                <p style="font-size: 13px; color: #64748b;">This OTP is valid for <strong>15 minutes</strong>. If you did not request a password reset, please ignore this email.</p>
                <hr style="border: none; border-top: 1px solid #e2e8f0; margin-top: 20px;" />
                <p style="font-size: 11px; color: #94a3b8; text-align: center;">&copy; ParkMaster Management System</p>
            </div>
        `
    });

    res.status(200).json({
        success: true,
        message: 'OTP has been sent to your email address.'
    });
});

// @desc    Verify OTP Code
// @route   POST /api/auth/verify-otp
// @access  Public
const verifyOTP = asyncHandler(async (req, res) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
        res.status(400);
        throw new Error('Please provide email and OTP');
    }

    const admin = await Admin.findOne({ email: email.toLowerCase().trim() });

    if (!admin) {
        res.status(404);
        throw new Error('Admin not found');
    }

    if (!admin.resetOtp || admin.resetOtp !== otp.trim()) {
        res.status(400);
        throw new Error('Invalid OTP code');
    }

    if (!admin.resetOtpExpires || admin.resetOtpExpires < new Date()) {
        res.status(400);
        throw new Error('OTP has expired. Please request a new one.');
    }

    res.status(200).json({
        success: true,
        message: 'OTP verified successfully'
    });
});

// @desc    Reset Password using OTP
// @route   POST /api/auth/reset-password-otp
// @access  Public
const resetPasswordWithOTP = asyncHandler(async (req, res) => {
    const { email, otp, newPassword, confirmPassword } = req.body;

    if (!email || !otp || !newPassword) {
        res.status(400);
        throw new Error('Please fill in all required fields');
    }

    if (confirmPassword && newPassword !== confirmPassword) {
        res.status(400);
        throw new Error('Passwords do not match');
    }

    if (newPassword.length < 6) {
        res.status(400);
        throw new Error('Password must be at least 6 characters');
    }

    const admin = await Admin.findOne({ email: email.toLowerCase().trim() });

    if (!admin) {
        res.status(404);
        throw new Error('Admin not found');
    }

    if (!admin.resetOtp || admin.resetOtp !== otp.trim()) {
        res.status(400);
        throw new Error('Invalid or expired OTP');
    }

    if (!admin.resetOtpExpires || admin.resetOtpExpires < new Date()) {
        res.status(400);
        throw new Error('OTP has expired. Please request a new one.');
    }

    admin.password = newPassword;
    admin.resetOtp = undefined;
    admin.resetOtpExpires = undefined;
    await admin.save();

    res.status(200).json({
        success: true,
        message: 'Password reset successfully! You can now log in with your new password.'
    });
});

// Legacy direct reset
const resetPasswordDirect = asyncHandler(async (req, res) => {
    const { email, newPassword, confirmPassword } = req.body;

    if (!email || !newPassword) {
        res.status(400);
        throw new Error('Please provide email and new password');
    }

    if (confirmPassword && newPassword !== confirmPassword) {
        res.status(400);
        throw new Error('Passwords do not match');
    }

    if (newPassword.length < 6) {
        res.status(400);
        throw new Error('Password must be at least 6 characters');
    }

    const admin = await Admin.findOne({ email: email.toLowerCase().trim() });

    if (!admin) {
        res.status(404);
        throw new Error('No admin account found with this email address');
    }

    admin.password = newPassword;
    await admin.save();

    res.status(200).json({
        success: true,
        message: 'Password reset successfully. You can now log in with your new password.'
    });
});

module.exports = {
    registerAdmin,
    loginAdmin,
    getAdminProfile,
    updateAdminProfile,
    forgotPasswordOTP,
    verifyOTP,
    resetPasswordWithOTP,
    resetPasswordDirect
};
