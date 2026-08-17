const asyncHandler = require('express-async-handler');
const Member = require('../models/Member');
const Vehicle = require('../models/Vehicle');
const ParkingSlot = require('../models/ParkingSlot');
const RemovedMember = require('../models/RemovedMember');
const Payment = require('../models/Payment');

// @desc    Get all members (with search, pagination, sorting, filtering)
// @route   GET /api/members
// @access  Private
const getMembers = asyncHandler(async (req, res) => {
    const pageSize = Number(req.query.pageSize) || 10;
    const page = Number(req.query.page) || 1;
    const search = req.query.search || '';
    const status = req.query.status || '';
    const sortBy = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.sortOrder === 'desc' ? -1 : 1;

    const query = {};

    // Search logic
    if (search) {
        query.$or = [
            { ownerName: { $regex: search, $options: 'i' } },
            { phone: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } },
            { aadharNumber: { $regex: search, $options: 'i' } }
        ];
    }

    // Filter by status
    if (status) {
        query.status = status;
    }

    const count = await Member.countDocuments(query);
    const members = await Member.find(query)
        .populate('assignedSlot', 'slotNumber zone')
        .sort({ [sortBy]: sortOrder })
        .limit(pageSize)
        .skip(pageSize * (page - 1));

    res.json({
        members,
        page,
        pages: Math.ceil(count / pageSize),
        total: count,
    });
});

// @desc    Get member by ID
// @route   GET /api/members/:id
// @access  Private
const getMemberById = asyncHandler(async (req, res) => {
    const member = await Member.findById(req.params.id).populate('assignedSlot');
    
    if (member) {
        res.json(member);
    } else {
        res.status(404);
        throw new Error('Member not found');
    }
});

// @desc    Create a member
// @route   POST /api/members
// @access  Private
const createMember = asyncHandler(async (req, res) => {
    const { ownerName, phone, assignedSlotId } = req.body;

    // Check if slot is already occupied
    if (assignedSlotId) {
        const slot = await ParkingSlot.findById(assignedSlotId);
        if (!slot) {
            res.status(404);
            throw new Error('Parking slot not found');
        }
        if (slot.status === 'occupied') {
            res.status(400);
            throw new Error('Selected parking slot is already occupied');
        }
    }

    const member = new Member({
        ...req.body,
        profilePhoto: req.file ? `/uploads/profiles/${req.file.filename}` : null,
        assignedSlot: assignedSlotId || null
    });

    const createdMember = await member.save();

    // Update slot status if assigned
    if (assignedSlotId) {
        await ParkingSlot.findByIdAndUpdate(assignedSlotId, {
            status: 'occupied',
            assignedMember: createdMember._id
        });
    }

    res.status(201).json(createdMember);
});

// @desc    Update a member
// @route   PUT /api/members/:id
// @access  Private
const updateMember = asyncHandler(async (req, res) => {
    const member = await Member.findById(req.params.id);

    if (member) {
        const { assignedSlotId, ...updateData } = req.body;

        // Handle profile photo update
        if (req.file) {
            updateData.profilePhoto = `/uploads/profiles/${req.file.filename}`;
        }

        // Handle slot transfer logic
        if (assignedSlotId && assignedSlotId !== member.assignedSlot?.toString()) {
            // Free old slot
            if (member.assignedSlot) {
                await ParkingSlot.findByIdAndUpdate(member.assignedSlot, {
                    status: 'available',
                    assignedMember: null
                });
            }

            // Check and assign new slot
            const newSlot = await ParkingSlot.findById(assignedSlotId);
            if (!newSlot) {
                res.status(404);
                throw new Error('New parking slot not found');
            }
            if (newSlot.status === 'occupied') {
                res.status(400);
                throw new Error('New parking slot is already occupied');
            }

            await ParkingSlot.findByIdAndUpdate(assignedSlotId, {
                status: 'occupied',
                assignedMember: member._id
            });
            
            updateData.assignedSlot = assignedSlotId;
        }

        Object.assign(member, updateData);
        const updatedMember = await member.save();
        res.json(updatedMember);
    } else {
        res.status(404);
        throw new Error('Member not found');
    }
});

// @desc    Remove a member (Soft Delete)
// @route   POST /api/members/:id/remove
// @access  Private
const removeMember = asyncHandler(async (req, res) => {
    const member = await Member.findById(req.params.id);

    if (!member) {
        res.status(404);
        throw new Error('Member not found');
    }

    const { reason, refundAmount, remarks, leavingDate } = req.body;
    const parsedLeavingDate = leavingDate ? new Date(leavingDate) : new Date();

    // Find associated vehicle for vehicle model snapshot
    const vehicle = await Vehicle.findOne({ member: member._id });
    const vehicleModelStr = vehicle ? `${vehicle.company || ''} ${vehicle.model || ''}`.trim() : '';

    // 1. Create Removed Member Record with snapshot details
    const removedRecord = await RemovedMember.create({
        member: member._id,
        ownerName: member.ownerName,
        phone: member.phone,
        email: member.email,
        vehicleModel: vehicleModelStr,
        leavingDate: parsedLeavingDate,
        reason: reason || 'Member left parking',
        refundAmount: refundAmount || 0,
        remarks: remarks || ''
    });

    // 2. Free the parking slot
    if (member.assignedSlot) {
        await ParkingSlot.findByIdAndUpdate(member.assignedSlot, {
            status: 'available',
            assignedMember: null
        });
    }

    // 3. Update member status to inactive and record leaving date
    member.status = 'inactive';
    member.leavingDate = parsedLeavingDate;
    member.assignedSlot = null;
    await member.save();

    res.json({ message: 'Member removed successfully', removedRecord });
});

// @desc    Delete a member permanently
// @route   DELETE /api/members/:id
// @access  Private
const deleteMember = asyncHandler(async (req, res) => {
    const member = await Member.findById(req.params.id);

    if (!member) {
        res.status(404);
        throw new Error('Member not found');
    }

    // Find associated vehicle for vehicle model snapshot
    const vehicle = await Vehicle.findOne({ member: member._id });
    const vehicleModelStr = vehicle ? `${vehicle.company || ''} ${vehicle.model || ''}`.trim() : '';

    // 1. Free the assigned parking slot if any
    if (member.assignedSlot) {
        await ParkingSlot.findByIdAndUpdate(member.assignedSlot, {
            status: 'available',
            assignedMember: null
        });
    }

    // 2. Preserve payment records: backfill snapshot member info if missing
    await Payment.updateMany(
        { member: member._id, $or: [{ memberName: { $exists: false } }, { memberName: null }, { memberName: '' }] },
        { $set: { memberName: member.ownerName, memberPhone: member.phone } }
    );

    // 3. Preserve or create RemovedMember record so report history retains removed details
    const existingRemovedRecord = await RemovedMember.findOne({ member: member._id });
    if (!existingRemovedRecord) {
        await RemovedMember.create({
            member: member._id,
            ownerName: member.ownerName,
            phone: member.phone,
            email: member.email,
            vehicleModel: vehicleModelStr,
            leavingDate: member.leavingDate || new Date(),
            reason: 'Deleted by Admin',
            refundAmount: 0,
            remarks: 'Member account deleted'
        });
    } else {
        // Backfill snapshot details on existing RemovedMember record if missing
        if (!existingRemovedRecord.ownerName) existingRemovedRecord.ownerName = member.ownerName;
        if (!existingRemovedRecord.phone) existingRemovedRecord.phone = member.phone;
        if (!existingRemovedRecord.vehicleModel && vehicleModelStr) existingRemovedRecord.vehicleModel = vehicleModelStr;
        await existingRemovedRecord.save();
    }

    // 4. Clean up vehicle documents
    await Vehicle.deleteMany({ member: member._id });

    // Note: Payment records and RemovedMember records are preserved for accounting and reports history.

    // 5. Delete the member document
    await member.deleteOne();

    res.json({ message: 'Member deleted successfully. Historical records preserved.' });
});

module.exports = {
    getMembers,
    getMemberById,
    createMember,
    updateMember,
    removeMember,
    deleteMember
};