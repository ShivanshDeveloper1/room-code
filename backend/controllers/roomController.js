const Room = require('../models/Room');
const User = require('../models/User');
const crypto = require('crypto');

// Test function to check user avatar data
exports.testUserAvatars = async (req, res) => {
  try {
    const users = await User.find().select('name email avatar');
    console.log('=== USER AVATARS TEST ===');
    users.forEach(user => {
      console.log(`User: ${user.name}, Avatar: ${user.avatar || 'NO AVATAR'}`);
    });
    console.log('=== END USER TEST ===');
    res.json({ users });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.createRoom = async (req, res) => {
  try {
    // roomId should be unique; can be user provided or generated
    const { name, roomId } = req.body;
    if (!name) return res.status(400).json({ message: 'Room name required' });

    const rid = roomId ? roomId : crypto.randomBytes(4).toString('hex'); // 8 hex chars
    const exists = await Room.findOne({ roomId: rid });
    if (exists) return res.status(400).json({ message: 'RoomId already used, try another' });

    const room = new Room({
      name,
      roomId: rid,
      createdBy: req.user._id,
      participants: [req.user._id], // Add creator as first participant
      defaultMainSeats: 8,
      maxCapacity: 500
    });
    await room.save();

    // Populate the created room with complete user data
    const populatedRoom = await Room.findById(room._id)
      .populate('createdBy', 'name email phone role customerId avatar avatarFrame dob createdAt')
      .populate('participants', 'name email phone role customerId avatar avatarFrame dob createdAt');

    res.status(201).json({ message: 'Room created', room: populatedRoom });
  } catch (err) {
    console.error('Create Room Error:', err);
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Room ID already used, try another' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getRooms = async (req, res) => {
  try {
    const rooms = await Room.find()
      .populate('createdBy', 'name email phone role customerId avatar avatarFrame dob createdAt')
      .populate('participants', 'name email phone role customerId avatar avatarFrame dob createdAt')
      .populate('seats.userId', 'name avatar role');

    // Debug: Check avatar data specifically
    console.log('=== ROOMS DEBUG ===');
    rooms.forEach((room, index) => {
      console.log(`Room ${index + 1}: ${room.name}`);
      console.log('Creator avatar:', room.createdBy?.avatar || 'NO AVATAR');
      console.log('Participants avatars:', room.participants?.map(p => p.avatar || 'NO AVATAR'));
    });
    console.log('=== END DEBUG ===');

    res.json({ rooms });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getRoomById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Getting room by ID:', id);

    const room = await Room.findById(id)
      .populate('createdBy', 'name email phone role customerId avatar avatarFrame dob createdAt')
      .populate('participants', 'name email phone role customerId avatar avatarFrame dob createdAt')
      .populate('seats.userId', 'name avatar role');

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    console.log('Room found:', room.name);
    console.log('Participants count:', room.participants?.length || 0);
    console.log('Participants:', room.participants);

    // If no participants but has creator, add creator to participants
    if (room.participants.length === 0 && room.createdBy) {
      console.log('Adding creator to participants');
      room.participants.push(room.createdBy._id);
      await room.save();

      // Re-fetch with populated data
      const updatedRoom = await Room.findById(id)
        .populate('createdBy', 'name email phone role customerId avatar dob createdAt')
        .populate('participants', 'name email phone role customerId avatar dob createdAt');

      // Return room data in the format expected by frontend
      const roomData = {
        _id: updatedRoom._id,
        name: updatedRoom.name,
        roomId: updatedRoom.roomId,
        users: updatedRoom.participants, // Frontend expects 'users' not 'participants'
        createdBy: updatedRoom.createdBy,
        createdAt: updatedRoom.createdAt,
        maxCapacity: updatedRoom.maxCapacity
      };

      console.log('Returning updated room data with users:', roomData.users?.length);
      return res.json(roomData);
    }

    // Return room data in the format expected by frontend
    const roomData = {
      _id: room._id,
      name: room.name,
      roomId: room.roomId,
      users: room.participants, // Frontend expects 'users' not 'participants'
      seats: room.seats, // NEW: Include seats
      createdBy: room.createdBy,
      createdAt: room.createdAt,
      maxCapacity: room.maxCapacity
    };

    console.log('Returning room data with users:', roomData.users?.length);
    res.json(roomData);
  } catch (err) {
    console.error('Error in getRoomById:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.joinRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    const room = await Room.findOne({ roomId })
      .populate('createdBy', 'name email phone role customerId avatar avatarFrame dob createdAt')
      .populate('participants', 'name email phone role customerId avatar avatarFrame dob createdAt');
    if (!room) return res.status(404).json({ message: 'Room not found' });

    if (room.participants.length >= room.maxCapacity) {
      return res.status(403).json({ message: 'Room is full' });
    }
    // if already in participants, return
    if (!room.participants.some(p => p._id.toString() === req.user._id.toString())) {
      room.participants.push(req.user._id);
      await room.save();
      // Re-populate after adding participant
      const updatedRoom = await Room.findById(room._id)
        .populate('createdBy', 'name email phone role customerId avatar dob createdAt')
        .populate('participants', 'name email phone role customerId avatar dob createdAt');
      res.json({ message: 'Joined room', room: updatedRoom });
    } else {
      res.json({ message: 'Already in room', room });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.joinRoomById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Joining room by ID:', id, 'User:', req.user._id);

    const room = await Room.findById(id)
      .populate('createdBy', 'name email phone role customerId avatar avatarFrame dob createdAt')
      .populate('participants', 'name email phone role customerId avatar avatarFrame dob createdAt');

    if (!room) return res.status(404).json({ message: 'Room not found' });

    if (room.participants.length >= room.maxCapacity) {
      return res.status(403).json({ message: 'Room is full' });
    }

    // Check if already in participants
    const isAlreadyParticipant = room.participants.some(p => p._id.toString() === req.user._id.toString());

    if (!isAlreadyParticipant) {
      console.log('Adding user to room participants');
      room.participants.push(req.user._id);
      await room.save();

      // Re-populate after adding participant
      const updatedRoom = await Room.findById(room._id)
        .populate('createdBy', 'name email phone role customerId avatar dob createdAt')
        .populate('participants', 'name email phone role customerId avatar dob createdAt');

      console.log('User added. New participant count:', updatedRoom.participants.length);
      res.json({ message: 'Joined room', room: updatedRoom });
    } else {
      console.log('User already in room');
      res.json({ message: 'Already in room', room });
    }
  } catch (err) {
    console.error('Error in joinRoomById:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.leaveRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    const room = await Room.findOne({ roomId });
    if (!room) return res.status(404).json({ message: 'Room not found' });

    room.participants = room.participants.filter(p => p.toString() !== req.user._id.toString());
    await room.save();

    // Return updated room with populated data
    const updatedRoom = await Room.findById(room._id)
      .populate('createdBy', 'name email phone role customerId avatar avatarFrame dob createdAt')
      .populate('participants', 'name email phone role customerId avatar avatarFrame dob createdAt');

    res.json({ message: 'Left room', room: updatedRoom });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
