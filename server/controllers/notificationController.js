const asyncHandler = require('express-async-handler');
const Member = require('../models/Member');
const Vehicle = require('../models/Vehicle');
const ParkingSlot = require('../models/ParkingSlot');
const Payment = require('../models/Payment');

// @desc    Get system notifications (Pending payments, expiring vehicle docs, high occupancy, recent members)
// @route   GET /api/notifications
// @access  Private
const getNotifications = asyncHandler(async (req, res) => {
    const notifications = [];
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    // 1. Pending Payments Notification
    const paidThisMonth = await Payment.distinct('member', { month: currentMonth, year: currentYear, status: 'Paid' });
    const pendingMembers = await Member.find({ status: 'active', _id: { $nin: paidThisMonth } })
        .select('ownerName phone monthlyRent')
        .limit(10);

    if (pendingMembers.length > 0) {
        notifications.push({
            id: 'pending-payments-summary',
            type: 'payment',
            title: 'Pending Monthly Rent Payments',
            message: `${pendingMembers.length} active member(s) have unpaid rent for ${now.toLocaleString('default', { month: 'long' })}.`,
            link: '/payments',
            severity: 'warning',
            createdAt: new Date(),
            data: pendingMembers.map(m => ({ id: m._id, name: m.ownerName, rent: m.monthlyRent }))
        });
    }

    // 2. Expiring Vehicle Documents (Insurance / Pollution within 30 days)
    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() + 30);

    const expiringVehicles = await Vehicle.find({
        $or: [
            { insuranceExpiry: { $lte: thresholdDate, $gte: now } },
            { pollutionExpiry: { $lte: thresholdDate, $gte: now } }
        ]
    }).populate('member', 'ownerName').limit(5);

    expiringVehicles.forEach(v => {
        const isInsurance = v.insuranceExpiry && v.insuranceExpiry <= thresholdDate && v.insuranceExpiry >= now;
        const isPollution = v.pollutionExpiry && v.pollutionExpiry <= thresholdDate && v.pollutionExpiry >= now;
        const docType = isInsurance && isPollution ? 'Insurance & Pollution' : isInsurance ? 'Insurance' : 'Pollution';

        notifications.push({
            id: `expiry-${v._id}`,
            type: 'expiry',
            title: `${docType} Expiring Soon`,
            message: `Vehicle ${v.company} ${v.model} (${v.vehicleNumber || 'Unregistered'}) owned by ${v.member?.ownerName || 'Member'} has ${docType.toLowerCase()} expiring within 30 days.`,
            link: '/vehicles',
            severity: 'danger',
            createdAt: v.insuranceExpiry || v.pollutionExpiry || new Date()
        });
    });

    // 3. Parking Slot Occupancy Alert
    const totalSlots = await ParkingSlot.countDocuments();
    const occupiedSlots = await ParkingSlot.countDocuments({ status: 'occupied' });
    const occupancyRate = totalSlots > 0 ? Math.round((occupiedSlots / totalSlots) * 100) : 0;

    if (occupancyRate >= 85) {
        notifications.push({
            id: 'high-occupancy-alert',
            type: 'slot',
            title: 'High Parking Occupancy Alert',
            message: `Parking capacity is at ${occupancyRate}% (${occupiedSlots}/${totalSlots} slots filled).`,
            link: '/slots',
            severity: occupancyRate >= 95 ? 'danger' : 'warning',
            createdAt: new Date()
        });
    }

    // 4. New Members Added Recently (Last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const newMembers = await Member.find({ status: 'active', createdAt: { $gte: sevenDaysAgo } })
        .select('ownerName joiningDate')
        .sort({ createdAt: -1 })
        .limit(5);

    newMembers.forEach(m => {
        notifications.push({
            id: `new-member-${m._id}`,
            type: 'member',
            title: 'New Member Joined',
            message: `${m.ownerName} was registered as a new member.`,
            link: '/members',
            severity: 'info',
            createdAt: m.joiningDate || new Date()
        });
    });

    res.json({
        unreadCount: notifications.length,
        notifications
    });
});

module.exports = { getNotifications };
