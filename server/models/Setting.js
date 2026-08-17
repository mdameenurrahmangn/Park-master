const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema({
    parkingName: { type: String, required: true, default: 'ParkMaster Parking' },
    address: { type: String },
    phone: { type: String },
    logo: { type: String },
    defaultMonthlyRent: { type: Number, default: 1000 },
    // Note: Admin password is managed in the Admin model for security. 
    // This field is for a general "access code" if needed, or we omit it for strict JWT auth.
}, { timestamps: true });

module.exports = mongoose.model('Setting', settingSchema);