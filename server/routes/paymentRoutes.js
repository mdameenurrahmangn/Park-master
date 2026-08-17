const express = require('express');
const router = express.Router();
const {
    getPayments,
    createPayment,
    getPaymentById,
    getPendingPayments,
    deletePayment,
    clearAllPayments
} = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, getPayments)
    .post(protect, createPayment)
    .delete(protect, clearAllPayments);

router.get('/pending', protect, getPendingPayments);

router.route('/:id')
    .get(protect, getPaymentById)
    .delete(protect, deletePayment);

module.exports = router;