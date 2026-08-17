const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    member: { type: mongoose.Schema.Types.ObjectId, ref: 'Member' },
    memberName: { type: String },
    memberPhone: { type: String },
    vehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle' },
    amount: { type: Number, required: true },
    month: { type: Number, required: true, min: 1, max: 12 }, // 1-12
    year: { type: Number, required: true },
    paymentDate: { type: Date, default: Date.now },
    paymentMethod: { type: String, enum: ['Cash', 'UPI', 'Bank', 'Cheque'], required: true },
    status: { type: String, enum: ['Paid', 'Pending'], default: 'Pending' },
    receiptNumber: { type: String, unique: true }
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);