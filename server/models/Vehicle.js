const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
    member: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true },
    vehicleNumber: { type: String, required: false, uppercase: true, trim: true },
    company: { type: String, required: true },
    model: { type: String, required: true },
    color: { type: String, required: true },
    vehicleType: { type: String, enum: ['Car', 'SUV', 'Sedan', 'Hatchback', 'Two-Wheeler', 'Other'], required: true },
    fuelType: { type: String, enum: ['Petrol', 'Diesel', 'EV', 'Hybrid', 'CNG'], required: true },
    registrationNumber: { type: String },
    insuranceExpiry: { type: Date },
    pollutionExpiry: { type: Date },
    vehiclePhoto: { type: String },
    rcUpload: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Vehicle', vehicleSchema);