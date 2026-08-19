const express = require('express');
const router = express.Router();
const { 
    getRemovedMembers, 
    deleteRemovedMember, 
    clearAllRemovedMembers 
} = require('../controllers/removedMemberController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, getRemovedMembers)
    .delete(protect, clearAllRemovedMembers);

router.route('/:id')
    .delete(protect, deleteRemovedMember);

module.exports = router;