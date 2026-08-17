const express = require('express');
const router = express.Router();
const { getRemovedMembers } = require('../controllers/removedMemberController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').get(protect, getRemovedMembers);

module.exports = router;