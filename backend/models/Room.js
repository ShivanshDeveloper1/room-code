const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  name: { type: String, required: true },
  roomId: { type: String, required: true, unique: true }, // unique string id
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  defaultMainSeats: { type: Number, default: 8 },
  maxCapacity: { type: Number, default: 500 },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  seats: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    position: { type: Number }
  }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Room', roomSchema);
