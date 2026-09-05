const express = require('express');
const User = require('../models/User');
const PaymentRequest = require('../models/PaymentRequest');

const { protect, authorize } = require('../middleware/auth'); // Adjust path to your auth middleware

const router = express.Router()




// POST: User Submits Payment Verification Request
router.post('/submit-request', protect, async (req, res) => {
  try {
    const { email, phone, transactionId } = req.body;

    const request = await PaymentRequest.create({
      userId: req.user.id,
      email,
      phone,
      transactionId
    });

    await User.findByIdAndUpdate(req.user.id, { paymentStatus: 'pending' });

    res.status(201).json({ success: true, message: "Payment request submitted. Awaiting admin approval.", request });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET: Admin fetches all pending payment requests
router.get('/requests', protect, authorize('admin'),  async (req, res) => {
  try {
    const requests = await PaymentRequest.find()
      .populate('userId', 'name email customerId')
      .sort({ createdAt: -1 });

    res.json({ success: true, requests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST: Admin Approves Payment Request
router.post('/approve-payment', protect, authorize('admin'),async (req, res) => {
  try {
    const { requestId } = req.body;
    const paymentReq = await PaymentRequest.findById(requestId);

    if (!paymentReq) return res.status(404).json({ message: "Request not found" });

    paymentReq.status = 'approved';
    await paymentReq.save();

    // Automatically update user document: grant access and update paymentStatus
    await User.findByIdAndUpdate(paymentReq.userId, { 
      hasRoomAccess: true, 
      paymentStatus: 'approved' 
    });

    res.json({ success: true, message: "User access granted successfully!" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST: Admin Rejects Payment Request
router.post('/reject-payment', protect, authorize('admin'), async (req, res) => {
  try {
    const { requestId } = req.body;
    const paymentReq = await PaymentRequest.findById(requestId);

    if (!paymentReq) return res.status(404).json({ message: "Request not found" });

    paymentReq.status = 'rejected';
    await paymentReq.save();

    await User.findByIdAndUpdate(paymentReq.userId, { 
      hasRoomAccess: false, 
      paymentStatus: 'rejected' 
    });

    res.json({ success: true, message: "Payment request rejected." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});




module.exports = router;
