const express = require('express');
const router = express.Router();
const {
    getMembers,
    getMemberById,
    createMember,
    updateMember,
    removeMember,
    deleteMember
} = require('../controllers/memberController');
const { protect } = require('../middleware/authMiddleware');
const { uploadProfile } = require('../middleware/uploadMiddleware');

router.route('/')
    .get(protect, getMembers)
    .post(protect, uploadProfile.single('profilePhoto'), createMember);

router.route('/:id')
    .get(protect, getMemberById)
    .put(protect, uploadProfile.single('profilePhoto'), updateMember)
    .delete(protect, deleteMember);

router.post('/:id/remove', protect, removeMember);

module.exports = router;