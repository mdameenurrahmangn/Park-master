const asyncHandler = require('express-async-handler');
const ParkingSlot = require('../models/ParkingSlot');

// @desc    Get all parking slots (for visual grid)
// @route   GET /api/slots
// @access  Private
const getSlots = asyncHandler(async (req, res) => {
    const slots = await ParkingSlot.find().populate('assignedMember', 'ownerName phone monthlyRent joiningDate');
    
    // Group by zone for easier frontend grid rendering
    const groupedSlots = slots.reduce((acc, slot) => {
        if (!acc[slot.zone]) {
            acc[slot.zone] = [];
        }
        acc[slot.zone].push(slot);
        return acc;
    }, {});

    res.json({ slots, groupedSlots });
});

// @desc    Create parking slots (Bulk or Single)
// @route   POST /api/slots
// @access  Private
const createSlots = asyncHandler(async (req, res) => {
    const { slots } = req.body; // Expecting an array of { slotNumber, zone }

    if (!Array.isArray(slots) || slots.length === 0) {
        res.status(400);
        throw new Error('Please provide an array of slots to create');
    }

    const createdSlots = await ParkingSlot.insertMany(slots);
    res.status(201).json(createdSlots);
});

// @desc    Update slot status (e.g., to maintenance)
// @route   PUT /api/slots/:id
// @access  Private
const updateSlotStatus = asyncHandler(async (req, res) => {
    const { status } = req.body;
    const slot = await ParkingSlot.findById(req.params.id);

    if (!slot) {
        res.status(404);
        throw new Error('Slot not found');
    }

    // Prevent changing status to 'occupied' manually without a member
    if (status === 'occupied' && !slot.assignedMember) {
        res.status(400);
        throw new Error('Cannot mark slot as occupied without assigning a member');
    }

    // If changing from occupied to available, clear member
    if (status === 'available' && slot.assignedMember) {
        slot.assignedMember = null;
    }

    slot.status = status;
    const updatedSlot = await slot.save();
    
    res.json(updatedSlot);
});

// @desc    Delete a slot (Only if available)
// @route   DELETE /api/slots/:id
// @access  Private
const deleteSlot = asyncHandler(async (req, res) => {
    const slot = await ParkingSlot.findById(req.params.id);

    if (!slot) {
        res.status(404);
        throw new Error('Slot not found');
    }

    if (slot.status === 'occupied') {
        res.status(400);
        throw new Error('Cannot delete an occupied slot. Remove the member first.');
    }

    await slot.deleteOne();
    res.json({ message: 'Slot deleted successfully' });
});

module.exports = {
    getSlots,
    createSlots,
    updateSlotStatus,
    deleteSlot
};