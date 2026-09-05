const Message = require("../models/Message");
const OnetoOneMessage = require("../models/OnetoOneMessage");

// Send message (REST API)
const sendMessage = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { message } = req.body;
    const msg = await Message.create({
      roomId,
      sender: req.user._id,
      message
    });
    const populatedMsg = await Message.findById(msg._id).populate("sender", "name email avatar");
    res.json(populatedMsg);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get messages of a room
const getMessages = async (req, res) => {
  try {
    const { roomId } = req.params;
    const messages = await Message.find({ roomId }).populate("sender", "name email avatar").sort({ createdAt: 1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get user's message history
const getUserMessages = async (req, res) => {
  try {
    const messages = await Message.find({ sender: req.user._id }).populate("sender", "name email avatar").sort({ createdAt: -1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get OnetoOne messages between two users
const getOnetoOneMessages = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user._id;
    
    const messages = await OnetoOneMessage.find({
      $or: [
        { sender: currentUserId, receiver: userId },
        { sender: userId, receiver: currentUserId }
      ]
    })
    .populate("sender", "name email avatar")
    .populate("receiver", "name email avatar")
    .sort({ createdAt: 1 });
    
    res.json({ messages });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Send OnetoOne message
const sendOnetoOneMessage = async (req, res) => {
  try {
    const { userId } = req.params;
    const { message } = req.body;
    
    const newMessage = await OnetoOneMessage.create({
      sender: req.user._id,
      receiver: userId,
      message
    });
    
    const populatedMessage = await OnetoOneMessage.findById(newMessage._id)
      .populate("sender", "name email avatar")
      .populate("receiver", "name email avatar");
    
    res.json(populatedMessage);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  sendMessage,
  getMessages,
  getUserMessages,
  getOnetoOneMessages,
  sendOnetoOneMessage
};