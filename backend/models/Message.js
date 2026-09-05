const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  roomId: { type: mongoose.Schema.Types.ObjectId, ref: "Room" },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  message: String,
  file: String, // For file attachments
}, { timestamps: true });

module.exports = mongoose.model("Message", messageSchema);
