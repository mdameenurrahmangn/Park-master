const asyncHandler = require('express-async-handler');
const RemovedMember = require('../models/RemovedMember');

// @desc    Get all removed members
// @route   GET /api/removed-members
// @access  Private
const getRemovedMembers = asyncHandler(async (req, res) => {
    const pageSize = Number(req.query.pageSize) || 10;
    const page = Number(req.query.page) || 1;
    const search = req.query.search || '';

    const query = {};

    if (search) {
        query.$or = [
            { ownerName: { $regex: search, $options: 'i' } },
            { phone: { $regex: search, $options: 'i' } },
            { vehicleModel: { $regex: search, $options: 'i' } },
            { reason: { $regex: search, $options: 'i' } },
            { remarks: { $regex: search, $options: 'i' } }
        ];
    }

    const count = await RemovedMember.countDocuments(query);
    const records = await RemovedMember.find(query)
        .populate('member', 'ownerName phone email address monthlyRent')
        .sort({ leavingDate: -1 })
        .limit(pageSize)
        .skip(pageSize * (page - 1));

    const removedMembers = records.map(r => {
        const obj = r.toObject();
        return {
            ...obj,
            ownerName: obj.ownerName || obj.member?.ownerName || 'Former Member',
            phone: obj.phone || obj.member?.phone || '—',
            email: obj.email || obj.member?.email || '—',
            vehicleModel: obj.vehicleModel || '—'
        };
    });

    res.json({
        removedMembers,
        page,
        pages: Math.ceil(count / pageSize),
        total: count,
    });
});

module.exports = { getRemovedMembers };