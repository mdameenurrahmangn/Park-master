const asyncHandler = require('express-async-handler');
const Payment = require('../models/Payment');
const Member = require('../models/Member');

// @desc    Get all payments (with filters)
// @route   GET /api/payments
// @access  Private
const getPayments = asyncHandler(async (req, res) => {
    const pageSize = Number(req.query.pageSize) || 10;
    const page = Number(req.query.page) || 1;
    const { memberId, status, month, year } = req.query;

    const query = {};
    if (memberId) query.member = memberId;
    if (status) query.status = status;
    if (month) query.month = Number(month);
    if (year) query.year = Number(year);

    const count = await Payment.countDocuments(query);
    const payments = await Payment.find(query)
        .populate('member', 'ownerName phone')
        .populate('vehicle', 'vehicleNumber model')
        .sort({ paymentDate: -1 })
        .limit(pageSize)
        .skip(pageSize * (page - 1));

    res.json({
        payments,
        page,
        pages: Math.ceil(count / pageSize),
        total: count,
    });
});

// @desc    Create a payment
// @route   POST /api/payments
// @access  Private
const createPayment = asyncHandler(async (req, res) => {
    const { member, vehicle, amount, month, year, paymentMethod, status } = req.body;

    const vehicleId = (vehicle && vehicle !== '' && vehicle !== 'undefined') ? vehicle : null;

    // Fetch member details for name/phone snapshot
    const memberObj = member ? await Member.findById(member) : null;
    const memberName = memberObj ? memberObj.ownerName : '';
    const memberPhone = memberObj ? memberObj.phone : '';

    // Check if payment record already exists for this member, month, and year
    const existingPayment = await Payment.findOne({ member, month, year });
    if (existingPayment) {
        if (existingPayment.status === 'Paid') {
            res.status(400);
            throw new Error(`Payment for this member already exists for month ${month}/${year}`);
        } else {
            // Update existing pending payment record
            existingPayment.status = status || 'Paid';
            existingPayment.amount = amount;
            existingPayment.paymentMethod = paymentMethod;
            existingPayment.paymentDate = new Date();
            if (memberName) existingPayment.memberName = memberName;
            if (memberPhone) existingPayment.memberPhone = memberPhone;
            if (vehicleId) existingPayment.vehicle = vehicleId;
            await existingPayment.save();

            const populatedPayment = await Payment.findById(existingPayment._id)
                .populate('member', 'ownerName phone address')
                .populate('vehicle', 'vehicleNumber model');

            return res.json(populatedPayment);
        }
    }

    // Generate unique receipt number
    const receiptNumber = `RCPT-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const payment = await Payment.create({
        member,
        memberName,
        memberPhone,
        vehicle: vehicleId,
        amount,
        month,
        year,
        paymentMethod,
        status: status || 'Paid',
        receiptNumber
    });

    const populatedPayment = await Payment.findById(payment._id)
        .populate('member', 'ownerName phone address')
        .populate('vehicle', 'vehicleNumber model');

    res.status(201).json(populatedPayment);
});

// @desc    Get payment by ID (For Receipt)
// @route   GET /api/payments/:id
// @access  Private
const getPaymentById = asyncHandler(async (req, res) => {
    const payment = await Payment.findById(req.params.id)
        .populate('member', 'ownerName phone address email')
        .populate('vehicle', 'vehicleNumber company model color');

    if (payment) {
        res.json(payment);
    } else {
        res.status(404);
        throw new Error('Payment not found');
    }
});

// @desc    Get pending payments
// @route   GET /api/payments/pending
// @access  Private
const getPendingPayments = asyncHandler(async (req, res) => {
    // Logic to find active members who haven't paid for the current month
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    const paidMembersThisMonth = await Payment.distinct('member', {
        month: currentMonth,
        year: currentYear,
        status: 'Paid'
    });

    const pendingMembers = await Member.find({
        _id: { $nin: paidMembersThisMonth },
        status: 'active'
    }).select('ownerName phone monthlyRent');

    res.json(pendingMembers);
});

// @desc    Delete single payment record by ID
// @route   DELETE /api/payments/:id
// @access  Private
const deletePayment = asyncHandler(async (req, res) => {
    const payment = await Payment.findById(req.params.id);

    if (!payment) {
        res.status(404);
        throw new Error('Payment record not found');
    }

    await payment.deleteOne();
    res.json({ message: 'Payment record deleted successfully' });
});

// @desc    Clear all payment records
// @route   DELETE /api/payments
// @access  Private
const clearAllPayments = asyncHandler(async (req, res) => {
    await Payment.deleteMany({});
    res.json({ message: 'All payment records cleared successfully' });
});

module.exports = {
    getPayments,
    createPayment,
    getPaymentById,
    getPendingPayments,
    deletePayment,
    clearAllPayments
};