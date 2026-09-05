const mongoose = require('mongoose');

const paymentRequestSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  email: { type: String, required: true, lowercase: true },
  phone: { type: String, required: true },
  transactionId: { type: String, default: '' }, // Optional UTR / Reference ID
  amount: { type: Number, default: 200 },
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected'], 
    default: 'pending' 
  },
  adminNotes: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('PaymentRequest', paymentRequestSchema);