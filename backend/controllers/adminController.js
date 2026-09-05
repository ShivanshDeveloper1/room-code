const User = require('../models/User');
const Complaint = require('../models/Complaint');

exports.getAllUsers = async (req, res) => {
  const users = await User.find().select('-password');
  res.json({ users });
};

exports.getComplaints = async (req, res) => {
  const complaints = await Complaint.find().populate('reportedBy', 'name email').populate('reportedUser','name email');
  res.json({ complaints });
};

exports.banUser = async (req, res) => {
  const { userId } = req.params;
  const user = await User.findByIdAndUpdate(userId, { banned: true }, { new: true }).select('-password');
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json({ message: 'User banned', user });
};

exports.unbanUser = async (req, res) => {
  const { userId } = req.params;
  const user = await User.findByIdAndUpdate(userId, { banned: false }, { new: true }).select('-password');
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json({ message: 'User unbanned', user });
};

exports.markResolved = async (req, res) => {
  const { complaintId } = req.params;
  const c = await Complaint.findByIdAndUpdate(complaintId, { status: 'resolved' }, { new: true });
  if (!c) return res.status(404).json({ message: 'Complaint not found' });
  res.json({ message: 'Marked resolved', complaint: c });
};
