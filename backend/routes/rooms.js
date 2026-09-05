const express = require('express');
const router = express.Router();
const roomController = require('../controllers/roomController');
const { protect } = require('../middleware/auth');

// anyone can view rooms (no auth required)
router.get('/', roomController.getRooms);

// get specific room data
router.get('/getgroupdata/:id', protect, roomController.getRoomById);

// join room by MongoDB ID
router.post('/join/:id', protect, roomController.joinRoomById);

// leave room  
router.post('/leave/:roomId', protect, roomController.leaveRoom);

// create room
router.post('/create', protect, roomController.createRoom);

// test user avatars (for debugging)
router.get('/test-avatars', roomController.testUserAvatars);

module.exports = router;
