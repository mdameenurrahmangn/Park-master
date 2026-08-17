const express = require('express');
const router = express.Router();
const { getSettings, updateSettings } = require('../controllers/settingController');
const { protect } = require('../middleware/authMiddleware');
const { uploadProfile } = require('../middleware/uploadMiddleware');

router.route('/')
    .get(protect, getSettings)
    .put(protect, uploadProfile.single('logo'), updateSettings);

module.exports = router;