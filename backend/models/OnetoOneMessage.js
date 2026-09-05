const mongoose = require("mongoose");

const onetoOneMessageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  message: { type: String, required: true },
  file: String, // For file attachments
  isRead: { type: Boolean, default: false },
}, { timestamps: true });

// Create compound index for efficient querying
onetoOneMessageSchema.index({ sender: 1, receiver: 1, createdAt: -1 });

module.exports = mongoose.model("OnetoOneMessage", onetoOneMessageSchema);
