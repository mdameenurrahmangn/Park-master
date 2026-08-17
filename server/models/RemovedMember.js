const mongoose = require('mongoose');

const removedMemberSchema = new mongoose.Schema({
    member: { type: mongoose.Schema.Types.ObjectId, ref: 'Member' },
    ownerName: { type: String },
    phone: { type: String },
    email: { type: String },
    vehicleModel: { type: String },
    leavingDate: { type: Date, default: Date.now },
    reason: { type: String, required: true },
    refundAmount: { type: Number, default: 0 },
    remarks: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('RemovedMember', removedMemberSchema);