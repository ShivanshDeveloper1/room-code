const express = require("express");
const cors = require("cors");
const connectToDb = require("./DB/db");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const paymentRoutes = require('./routes/payment')
const path = require("path");

const app = express();
app.set("trust proxy", 1);

// Connect to DB
connectToDb();

// Import routes
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const roomRoutes = require("./routes/rooms");
const adminRoutes = require("./routes/admin");
const complaintRoutes = require("./routes/complaints");
const chatRoutes = require("./routes/chatRoutes");
const voiceRoutes = require('./routes/voiceRoutes');

// Middlewares
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",

  process.env.CLIENT_URL
].filter(Boolean); // Remove undefined/null if CLIENT_URL is not set

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// Configure helmet to allow images
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginEmbedderPolicy: false
}));

app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (uploaded images) with CORS headers
app.use('/uploads', (req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  res.header('Access-Control-Allow-Methods', 'GET');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Access-Control-Allow-Credentials', 'true');
  next();
}, express.static('uploads'));

// Rate limiter
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // limit requests
});
app.use(limiter);
app.use('/api/voice', voiceRoutes);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/complaints", complaintRoutes);
app.use("/api/chats", chatRoutes);


app.use('/api/payment',paymentRoutes)

app.use((err, req, res, next) => {
  console.error("Global Error Log:", err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});


module.exports = app;
