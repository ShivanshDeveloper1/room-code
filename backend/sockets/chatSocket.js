const Message = require("../models/Message");
const Room = require("../models/Room");
const User = require("../models/User");
const OnetoOneMessage = require("../models/OnetoOneMessage");

// Track online users per room with full user data
const onlineUsers = new Map(); // roomId -> Set of {userId, userData}
// Track global online users for OnetoOne chat
const globalOnlineUsers = new Set(); // Set of userIds
// Track socket connections per user to handle multiple tabs/devices
const userSockets = new Map(); // userId -> Set of socketIds

// exported function to attach to server
module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log('Socket connected', socket.id);

    // Send current online users list to newly connected client
    socket.emit('onlineUsersUpdate', Array.from(globalOnlineUsers));

    // Join a group/room
    socket.on('joinGroup', async (groupId) => {
      try {
        socket.join(groupId);
        socket.currentRoom = groupId;
        console.log(`Socket ${socket.id} joined group ${groupId}`);

        // Get user data if userId is set
        if (socket.userId) {
          const userData = await User.findById(socket.userId).select('name email avatar role');
          if (userData) {
            socket.userData = userData;

            // Add user to online users for this room
            if (!onlineUsers.has(groupId)) {
              onlineUsers.set(groupId, new Map());
            }
            onlineUsers.get(groupId).set(socket.userId, userData);

            // Emit updated online users list to all users in the room
            const roomUsersMap = onlineUsers.get(groupId) || new Map();
            const roomUsers = Array.from(roomUsersMap.values());
            io.to(groupId).emit('onlineUsers', roomUsers);

            console.log(`User ${userData.name} joined group ${groupId}. Online users:`, roomUsers.length);
          }
        }

        socket.emit('joinedGroup', { groupId, message: 'Successfully joined group' });

        // Emit current seats to the user who joined
        const room = await Room.findById(groupId).populate('seats.userId', 'name avatar role');
        if (room) {
          socket.emit('roomUpdate', { seats: room.seats });
          console.log(`Sent initial seat data for group ${groupId} to socket ${socket.id}`);
        }
      } catch (error) {
        console.error('Error joining group:', error);
        socket.emit('error', { message: 'Failed to join group' });
      }
    });

    // Send message to group
    socket.on('sendMessage', async ({ groupId, userId, content, fileUrl }) => {
      try {
        console.log('Received message:', { groupId, userId, content, fileUrl });

        // NEW: Check if user is on a seat before allowing message
        const room = await Room.findById(groupId);
        if (!room) {
          return socket.emit('error', { message: 'Room not found' });
        }

        const isSeated = room.seats.some(seat => seat.userId && seat.userId.toString() === userId);
        if (!isSeated) {
          return socket.emit('error', { message: 'You must be on a seat to send messages' });
        }

        // Save message to database
        const messageData = {
          roomId: groupId,
          sender: userId,
          message: content || '',
        };

        if (fileUrl) {
          messageData.file = fileUrl;
        }

        const message = await Message.create(messageData);
        const populatedMessage = await Message.findById(message._id)
          .populate('sender', 'name email avatar');

        console.log('Saved and populated message:', populatedMessage);

        // Emit message to all users in the group
        io.to(groupId).emit('receiveMessage', populatedMessage);

      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // NEW: Take Seat
    socket.on('takeSeat', async ({ groupId, userId, position }) => {
      try {
        console.log(`Attempting takeSeat: ${userId} at pos ${position} in group ${groupId}`);
        const room = await Room.findById(groupId);
        if (!room) {
          return socket.emit('error', { message: 'Room not found' });
        }

        // Initialize seats if undefined
        if (!room.seats) room.seats = [];

        // Check if user is already seated
        const existingSeat = room.seats.find(s => s.userId && s.userId.toString() === userId);
        if (existingSeat) {
          return socket.emit('error', { message: 'You are already on a seat' });
        }

        // Check if position is occupied
        const occupied = room.seats.find(s => s.position === position);
        if (occupied) {
          return socket.emit('error', { message: 'This seat is already occupied' });
        }

        // Add seat (limit 8 positions: 0-7)
        if (position >= 0 && position < 8) {
          room.seats.push({ userId, position });
          await room.save();
          console.log(`SUCCESS: User ${userId} took seat ${position}`);

          const updatedRoom = await Room.findById(groupId).populate('seats.userId', 'name avatar role');
          // Broadcast to all users in the room
          io.to(groupId).emit('roomUpdate', { seats: updatedRoom.seats });
        } else {
          socket.emit('error', { message: 'Invalid seat position' });
        }
      } catch (error) {
        console.error('Take seat error:', error);
        socket.emit('error', { message: 'Failed to take seat' });
      }
    });

    // NEW: Leave Seat
    socket.on('leaveSeat', async ({ groupId, userId }) => {
      try {
        console.log(`Attempting leaveSeat: ${userId} from group ${groupId}`);
        const room = await Room.findById(groupId);
        if (!room) return;

        room.seats = room.seats.filter(s => s.userId && s.userId.toString() !== userId);
        await room.save();
        console.log(`SUCCESS: User ${userId} left seat`);

        const updatedRoom = await Room.findById(groupId).populate('seats.userId', 'name avatar role');
        io.to(groupId).emit('roomUpdate', { seats: updatedRoom.seats });
      } catch (error) {
        console.error('Leave seat error:', error);
        socket.emit('error', { message: 'Failed to leave seat' });
      }
    });

    // Leave group
    socket.on('leaveGroup', (groupId) => {
      socket.leave(groupId);

      // Remove user from online users
      if (onlineUsers.has(groupId) && socket.userId) {
        onlineUsers.get(groupId).delete(socket.userId);

        // Emit updated online users list
        const roomUsersMap = onlineUsers.get(groupId) || new Map();
        const roomUsers = Array.from(roomUsersMap.values());
        io.to(groupId).emit('onlineUsers', roomUsers);

        console.log(`User left group ${groupId}. Remaining online users:`, roomUsers.length);
      }

      console.log(`Socket ${socket.id} left group ${groupId}`);
    });

    // Set user ID for this socket
    socket.on('setUserId', (userId) => {
      socket.userId = userId;

      // Track this socket for the user
      if (!userSockets.has(userId)) {
        userSockets.set(userId, new Set());
      }
      userSockets.get(userId).add(socket.id);

      // Add to global online users when setting userId
      globalOnlineUsers.add(userId);
      console.log(`Socket ${socket.id} set userId to ${userId}. Total online: ${globalOnlineUsers.size}`);

      // Broadcast updated online users list
      io.emit('onlineUsersUpdate', Array.from(globalOnlineUsers));
    });

    // Handle user coming online (for OnetoOne chat)
    socket.on('userOnline', (userId) => {
      globalOnlineUsers.add(userId);
      socket.userId = userId;

      // Track this socket for the user
      if (!userSockets.has(userId)) {
        userSockets.set(userId, new Set());
      }
      userSockets.get(userId).add(socket.id);

      console.log(`User ${userId} is now online. Total online: ${globalOnlineUsers.size}`);

      // Broadcast to all clients that user is online
      io.emit('onlineUsersUpdate', Array.from(globalOnlineUsers));
    });

    // Handle user going offline (for OnetoOne chat)
    socket.on('userOffline', (userId) => {
      // Remove this socket from user's socket list
      if (userSockets.has(userId)) {
        userSockets.get(userId).delete(socket.id);

        // If user has no more active sockets, mark as offline
        if (userSockets.get(userId).size === 0) {
          userSockets.delete(userId);
          globalOnlineUsers.delete(userId);
          console.log(`User ${userId} is now offline. Total online: ${globalOnlineUsers.size}`);

          // Broadcast to all clients that user is offline
          io.emit('onlineUsersUpdate', Array.from(globalOnlineUsers));
        }
      }
    });

    // Join OnetoOne chat room
    socket.on('joinOnetoOneChat', ({ user1, user2 }) => {
      const roomName = [user1, user2].sort().join('-');
      socket.join(roomName);
      socket.onetoOneRoom = roomName;
      console.log(`Socket ${socket.id} joined OnetoOne room: ${roomName}`);

      // Emit online status to the other user
      const otherUserId = user1 === socket.userId ? user2 : user1;
      socket.to(roomName).emit('userOnlineStatus', {
        userId: socket.userId,
        isOnline: true
      });

      socket.emit('joinedOnetoOneChat', { roomName, message: 'Successfully joined OnetoOne chat' });
    });

    // Send OnetoOne message
    socket.on('sendOnetoOneMessage', async ({ sender, receiver, content }) => {
      try {
        console.log('Received OnetoOne message:', { sender, receiver, content });

        // Save message to database
        const message = await OnetoOneMessage.create({
          sender,
          receiver,
          message: content
        });

        const populatedMessage = await OnetoOneMessage.findById(message._id)
          .populate('sender', 'name email avatar')
          .populate('receiver', 'name email avatar');

        console.log('Saved and populated OnetoOne message:', populatedMessage);

        // Create room name (consistent ordering)
        const roomName = [sender, receiver].sort().join('-');

        // Emit message to both users in the OnetoOne room
        io.to(roomName).emit('receiveOnetoOneMessage', populatedMessage);

      } catch (error) {
        console.error('Error sending OnetoOne message:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Leave OnetoOne chat room
    socket.on('leaveOnetoOneChat', ({ user1, user2 }) => {
      const roomName = [user1, user2].sort().join('-');
      socket.leave(roomName);

      // Emit offline status to the other user
      const otherUserId = user1 === socket.userId ? user2 : user1;
      socket.to(roomName).emit('userOnlineStatus', {
        userId: socket.userId,
        isOnline: false
      });

      console.log(`Socket ${socket.id} left OnetoOne room: ${roomName}`);
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log('Socket disconnect', socket.id);

      // Remove user from all online users lists
      if (socket.userId) {
        // Remove from group online users
        onlineUsers.forEach((usersMap, groupId) => {
          if (usersMap.has(socket.userId)) {
            usersMap.delete(socket.userId);
            // Emit updated online users list
            const roomUsers = Array.from(usersMap.values());
            io.to(groupId).emit('onlineUsers', roomUsers);
            console.log(`User disconnected from group ${groupId}. Remaining online users:`, roomUsers.length);
          }
        });

        // Handle OnetoOne room disconnect
        if (socket.onetoOneRoom) {
          socket.to(socket.onetoOneRoom).emit('userOnlineStatus', {
            userId: socket.userId,
            isOnline: false
          });
        }

        // Remove this socket from user's socket list
        if (userSockets.has(socket.userId)) {
          userSockets.get(socket.userId).delete(socket.id);

          // If user has no more active sockets, mark as offline
          if (userSockets.get(socket.userId).size === 0) {
            userSockets.delete(socket.userId);
            globalOnlineUsers.delete(socket.userId);
            console.log(`User ${socket.userId} disconnected. Total online: ${globalOnlineUsers.size}`);

            // Broadcast updated online users list
            io.emit('onlineUsersUpdate', Array.from(globalOnlineUsers));
          }
        }
      }
    });
  });
};