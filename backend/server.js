require("dotenv").config();

const http = require("http");
const app = require("./app");
const socketSetup = require("./sockets/chatSocket");

const { Server } = require("socket.io");

const port = process.env.PORT || 3000;

// Create HTTP server
const server = http.createServer(app);

// Attach Socket.IO to server
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      "http://localhost:3000",
    
   
      process.env.CLIENT_URL
    ].filter(Boolean),
    methods: ["GET", "POST"],
    credentials: true
  },
});

// Setup sockets
socketSetup(io);

// Start server
server.listen(port, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${port}`);
});
