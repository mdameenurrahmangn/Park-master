const asyncHandler = require('express-async-handler');
const Member = require('../models/Member');
const Vehicle = require('../models/Vehicle');
const ParkingSlot = require('../models/ParkingSlot');
const Payment = require('../models/Payment');
const RemovedMember = require('../models/RemovedMember');

// @desc    Get Dashboard Stats & Charts
// @route   GET /api/dashboard
// @access  Private
const getDashboardData = asyncHandler(async (req, res) => {
    const now = new Date();
    const startOfToday = new Date(now.setHours(0, 0, 0, 0));
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // 1. Basic Counts (Cards)
    const [
        totalMembers,
        removedMembersCount,
        totalSlots,
        occupiedSlots,
        availableSlots,
        todayCollection,
        monthlyCollection,
        pendingPaymentsCount
    ] = await Promise.all([
        Member.countDocuments({ status: 'active' }),
        RemovedMember.countDocuments(),
        ParkingSlot.countDocuments(),
        ParkingSlot.countDocuments({ status: 'occupied' }),
        ParkingSlot.countDocuments({ status: 'available' }),
        Payment.aggregate([
            { $match: { status: 'Paid', paymentDate: { $gte: startOfToday } } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]),
        Payment.aggregate([
            { $match: { status: 'Paid', paymentDate: { $gte: startOfMonth } } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]),
        // Pending payments logic: Active members minus those who paid this month
        (async () => {
            const currentMonth = now.getMonth() + 1;
            const currentYear = now.getFullYear();
            const paidThisMonth = await Payment.distinct('member', { month: currentMonth, year: currentYear, status: 'Paid' });
            return Member.countDocuments({ status: 'active', _id: { $nin: paidThisMonth } });
        })()
    ]);

    // 2. Occupancy Rate
    const occupancyRate = totalSlots > 0 ? Math.round((occupiedSlots / totalSlots) * 100) : 0;

    // 3. Monthly Revenue Chart (Last 6 Months)
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    
    const revenueData = await Payment.aggregate([
        { $match: { status: 'Paid', paymentDate: { $gte: sixMonthsAgo } } },
        {
            $group: {
                _id: { month: { $month: '$paymentDate' }, year: { $year: '$paymentDate' } },
                total: { $sum: '$amount' },
                count: { $sum: 1 }
            }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Format chart data to ensure all 6 months are present (even if 0)
    const formattedRevenue = [];
    for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const month = d.getMonth() + 1;
        const year = d.getFullYear();
        
        const found = revenueData.find(r => r._id.month === month && r._id.year === year);
        formattedRevenue.push({
            month: d.toLocaleString('default', { month: 'short' }),
            year,
            revenue: found ? found.total : 0,
            payments: found ? found.count : 0
        });
    }

    // 4. Latest Members (Recent 5)
    const latestMembers = await Member.find({ status: 'active' })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('ownerName phone joiningDate profilePhoto')
        .populate('assignedSlot', 'slotNumber');

    // 5. Recent Payments (Recent 5)
    const recentPayments = await Payment.find({ status: 'Paid' })
        .sort({ paymentDate: -1 })
        .limit(5)
        .populate('member', 'ownerName')
        .select('amount paymentDate paymentMethod receiptNumber');

    res.json({
        cards: {
            currentParkedCars: occupiedSlots, // Assuming 1 car per occupied slot for simplicity
            availableSlots,
            occupiedSlots,
            totalMembers,
            removedMembers: removedMembersCount,
            todayCollection: todayCollection[0]?.total || 0,
            monthlyCollection: monthlyCollection[0]?.total || 0,
            pendingPayments: pendingPaymentsCount,
            occupancyRate
        },
        charts: {
            monthlyRevenue: formattedRevenue
        },
        lists: {
            latestMembers,
            recentPayments
        }
    });
});

module.exports = { getDashboardData };