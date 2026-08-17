const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
    ownerName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, unique: true },
    altPhone: { type: String },
    email: { type: String, lowercase: true, trim: true },
    address: { type: String, required: true },
    aadharNumber: { type: String, required: true, unique: true },
    joiningDate: { type: Date, default: Date.now },
    leavingDate: { type: Date },
    monthlyRent: { type: Number, required: true },
    advanceAmount: { type: Number, default: 0 },
    assignedSlot: { type: mongoose.Schema.Types.ObjectId, ref: 'ParkingSlot' },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    profilePhoto: { type: String } // URL or path
}, { timestamps: true });

module.exports = mongoose.model('Member', memberSchema);