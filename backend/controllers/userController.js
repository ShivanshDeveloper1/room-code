const User = require('../models/User');

exports.getProfile = async (req, res) => {
  try {
    // Ensure user has gender field, if not add it
    if (!req.user.gender || req.user.gender === undefined || req.user.gender === null) {
      await User.findByIdAndUpdate(req.user._id, {
        gender: '',
        updatedAt: new Date()
      });
      req.user.gender = '';
    }

    res.json({ user: req.user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.user._id } })
      .select('name email phone gender role customerId avatar avatarFrame dob createdAt updatedAt')
      .sort({ name: 1 });
    res.json({ users });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId)
      .select('name email phone gender role customerId avatar avatarFrame dob createdAt updatedAt');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Ensure user has gender field, if not add it
    if (!user.gender || user.gender === undefined || user.gender === null) {
      await User.findByIdAndUpdate(userId, {
        gender: '',
        updatedAt: new Date()
      });
      user.gender = '';
    }

    res.json({ user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const updates = {};

    if (req.body.name) updates.name = req.body.name;
    if (req.body.phone) updates.phone = req.body.phone;
    if (req.body.gender && req.body.gender.trim()) updates.gender = req.body.gender.trim();
    if (req.body.dob) updates.dob = req.body.dob;
    if (req.body.avatarFrame !== undefined) updates.avatarFrame = req.body.avatarFrame;

    // Handle Cloudinary URL from request body or file upload
    if (req.body.avatar) {
      updates.avatar = req.body.avatar; // Direct Cloudinary link (e.g., https://res.cloudinary.com/...)
    } else if (req.file) {
      updates.avatar = '/uploads/' + req.file.filename;
    }

    updates.updatedAt = new Date();

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true })
      .select('name email phone gender role customerId avatar avatarFrame dob createdAt updatedAt');

    res.json({ message: 'Profile updated', user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Migration function to add gender field to existing users
exports.migrateGenderField = async (req, res) => {
  try {
    // Find all users who don't have gender field or have empty gender
    const usersWithoutGender = await User.find({
      $or: [
        { gender: { $exists: false } },
        { gender: '' },
        { gender: null }
      ]
    });

    console.log(`Found ${usersWithoutGender.length} users without gender field`);

    // Update all users to have default empty gender field
    const updateResult = await User.updateMany(
      {
        $or: [
          { gender: { $exists: false } },
          { gender: '' },
          { gender: null }
        ]
      },
      {
        $set: {
          gender: '',
          updatedAt: new Date()
        }
      }
    );

    console.log(`Updated ${updateResult.modifiedCount} users with gender field`);

    res.json({
      message: 'Gender field migration completed',
      usersFound: usersWithoutGender.length,
      usersUpdated: updateResult.modifiedCount
    });
  } catch (err) {
    console.error('Migration error:', err);
    res.status(500).json({ message: 'Migration failed', error: err.message });
  }
};
