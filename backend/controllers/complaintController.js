const Complaint = require('../models/Complaint');

exports.createComplaint = async (req, res) => {
  try {
    const { reason } = req.body;
    if (!reason) return res.status(400).json({ message: 'Reason required' });

    const complaint = new Complaint({
      reportedBy: req.user._id,
      reason,
      image: req.file ? '/uploads/' + req.file.filename : undefined,
    });
    await complaint.save();
    res.status(201).json({ message: 'Complaint submitted', complaint });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find()
      .populate('reportedBy', 'name email customerId')
      .sort({ createdAt: -1 });
    res.json({ complaints });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateComplaintStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;
    
    if (!['open', 'resolved'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const complaint = await Complaint.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).populate('reportedBy', 'name email customerId');

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    res.json({ message: 'Status updated', complaint });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
