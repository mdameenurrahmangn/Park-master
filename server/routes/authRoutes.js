const express = require('express');
const router = express.Router();
const {
    registerAdmin,
    loginAdmin,
    getAdminProfile,
    updateAdminProfile,
    forgotPasswordOTP,
    verifyOTP,
    resetPasswordWithOTP,
    resetPasswordDirect
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', registerAdmin);
router.post('/login', loginAdmin);
router.post('/forgot-password', forgotPasswordOTP);
router.post('/verify-otp', verifyOTP);
router.post('/reset-password-otp', resetPasswordWithOTP);
router.post('/reset-password', resetPasswordDirect);
router.route('/profile').get(protect, getAdminProfile).put(protect, updateAdminProfile);

module.exports = router;