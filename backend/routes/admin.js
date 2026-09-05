const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.use(authorize('admin'));

// user management
router.get('/users', adminController.getAllUsers);
router.post('/ban/:userId', adminController.banUser);
router.post('/unban/:userId', adminController.unbanUser);

// complaints
router.get('/complaints', adminController.getComplaints);
router.post('/complaints/:complaintId/resolve', adminController.markResolved);

module.exports = router;
