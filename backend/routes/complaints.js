const express = require('express');
const router = express.Router();
const complaintController = require('../controllers/complaintController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/multerConfig');

router.post('/', protect, upload.single('evidence'), complaintController.createComplaint);
router.get('/', protect, complaintController.getComplaints);
router.put('/:id/status', protect, complaintController.updateComplaintStatus);

module.exports = router;
