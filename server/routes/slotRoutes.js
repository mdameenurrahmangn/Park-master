const express = require('express');
const router = express.Router();
const {
    getSlots,
    createSlots,
    updateSlotStatus,
    deleteSlot
} = require('../controllers/slotController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, getSlots)
    .post(protect, createSlots);

router.route('/:id')
    .put(protect, updateSlotStatus)
    .delete(protect, deleteSlot);

module.exports = router;