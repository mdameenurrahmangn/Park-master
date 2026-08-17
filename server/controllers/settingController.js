const asyncHandler = require('express-async-handler');
const Setting = require('../models/Setting');

// @desc    Get parking settings
// @route   GET /api/settings
// @access  Private
const getSettings = asyncHandler(async (req, res) => {
    // We only expect one settings document. If it doesn't exist, create a default one.
    let settings = await Setting.findOne();
    
    if (!settings) {
        settings = await Setting.create({
            parkingName: 'ParkMaster Parking',
            address: '',
            phone: '',
            defaultMonthlyRent: 1000
        });
    }

    res.json(settings);
});

// @desc    Update parking settings
// @route   PUT /api/settings
// @access  Private
const updateSettings = asyncHandler(async (req, res) => {
    let settings = await Setting.findOne();

    if (!settings) {
        settings = new Setting({});
    }

    if (req.body.parkingName !== undefined) settings.parkingName = req.body.parkingName;
    if (req.body.address !== undefined) settings.address = req.body.address;
    if (req.body.phone !== undefined) settings.phone = req.body.phone;
    if (req.body.defaultMonthlyRent !== undefined) settings.defaultMonthlyRent = Number(req.body.defaultMonthlyRent);
    
    if (req.file) {
        settings.logo = `/uploads/profiles/${req.file.filename}`;
    }

    const updatedSettings = await settings.save();
    res.json(updatedSettings);
});

module.exports = { getSettings, updateSettings };