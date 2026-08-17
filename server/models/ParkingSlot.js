const mongoose = require('mongoose');

const parkingSlotSchema = new mongoose.Schema({
    slotNumber: { type: String, required: true, unique: true }, // e.g., A1, B2
    zone: { type: String, required: true }, // e.g., A, B
    status: { type: String, enum: ['available', 'occupied', 'maintenance'], default: 'available' },
    assignedMember: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', default: null }
}, { timestamps: true });

module.exports = mongoose.model('ParkingSlot', parkingSlotSchema);