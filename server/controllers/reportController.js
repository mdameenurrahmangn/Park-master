const asyncHandler = require('express-async-handler');
const Payment = require('../models/Payment');
const Member = require('../models/Member');
const RemovedMember = require('../models/RemovedMember');

// @desc    Get detailed reports based on date range
// @route   GET /api/reports
// @access  Private
const getReports = asyncHandler(async (req, res) => {
    const { startDate, endDate, type } = req.query;

    if (!startDate || !endDate) {
        res.status(400);
        throw new Error('Start date and end date are required');
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999); // Include the whole end day

    let reportData = {};

    if (type === 'collection') {
        const payments = await Payment.find({
            paymentDate: { $gte: start, $lte: end },
            status: 'Paid'
        })
        .populate('member', 'ownerName phone')
        .populate('vehicle', 'vehicleNumber')
        .sort({ paymentDate: -1 });

        const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0);

        reportData = {
            title: 'Collection Report',
            totalAmount,
            totalTransactions: payments.length,
            data: payments
        };
    } 
    else if (type === 'members') {
        const newMembers = await Member.find({
            joiningDate: { $gte: start, $lte: end },
            status: 'active'
        }).select('ownerName phone joiningDate monthlyRent');

        reportData = {
            title: 'New Members Report',
            totalNewMembers: newMembers.length,
            data: newMembers
        };
    }
    else if (type === 'pending') {
        // Find members who joined before end date, are active, and haven't paid in the range
        // (Simplified logic for pending in a specific range)
        const pending = await Member.find({
            status: 'active',
            joiningDate: { $lte: end }
        }).select('ownerName phone monthlyRent');

        reportData = {
            title: 'Pending Payments Report',
            data: pending
        };
    }
    else if (type === 'removed') {
        const removedRecords = await RemovedMember.find({
            leavingDate: { $gte: start, $lte: end }
        })
        .populate('member', 'ownerName phone email')
        .sort({ leavingDate: -1 });

        const totalRefund = removedRecords.reduce((sum, r) => sum + (r.refundAmount || 0), 0);

        const data = removedRecords.map(r => {
            const obj = r.toObject();
            return {
                ...obj,
                ownerName: obj.ownerName || obj.member?.ownerName || 'Former Member',
                phone: obj.phone || obj.member?.phone || '—',
                vehicleModel: obj.vehicleModel || '—'
            };
        });

        reportData = {
            title: 'Removed Members Report',
            totalRemoved: data.length,
            totalRefund,
            data
        };
    }
    else {
        res.status(400);
        throw new Error('Invalid report type');
    }

    res.json(reportData);
});

module.exports = { getReports };