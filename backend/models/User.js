const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  phone: { type: String, default: "0000000000" }, // Phone number field
  gender: { type: String, enum: ['male', 'female', 'other'] }, // Gender field
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  customerId: { type: String, unique: true }, // 12 digit
  avatar: { type: String }, // image path
  avatarFrame: { type: String, default: "" }, // frame name or path
  dob: { type: Date },
  banned: { type: Boolean, default: false },
  hasRoomAccess:{type:Boolean, default:false},
paymentStatus: { 
    type: String, 
    enum: ['none', 'pending', 'approved', 'rejected'], 
    default: 'none' 
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
