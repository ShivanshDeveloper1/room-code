const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

function genCustomerId() {
  // 12-digit random numeric string, ensure uniqueness in DB
  const n = () => Math.floor(Math.random() * 10);
  let id = "";
  for (let i = 0; i < 12; i++) id += n();
  return id;
}

async function ensureUniqueCustomerId() {
  let id = genCustomerId();
  while (await User.findOne({ customerId: id })) {
    id = genCustomerId();
  }
  return id;
}

exports.registerUser = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashed = await bcrypt.hash(password, 10);
    const customerId = await ensureUniqueCustomerId();

    const user = new User({
      name,
      email,
      password: hashed,
      customerId,
      phone: phone || "0000000000",
    });

    await user.save();

    return res.status(201).json({
      message: "User registered successfully",
      data: {
        id: user._id,
        customerId: user.customerId,
        name: user.name,
        email: user.email,
        phone: user.phone,
      },
    });
  } catch (error) {
    console.error("Register Error:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};



exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "Email and password required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });
    if (user.banned) return res.status(403).json({ message: "User is banned" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });

    res.json({
      error: false,
      message: "User login successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        customerId: user.customerId,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Admin register separate (protected or can be allowed via env secret)
exports.registerAdmin = async (req, res) => {
  try {
    const { name, email, password, adminSecret } = req.body;
    // adminSecret should be set in env and required to create admin
    if (adminSecret !== process.env.ADMIN_CREATION_SECRET)
      return res.status(403).json({ message: "Not allowed" });

    const existing = await User.findOne({ email });
    if (existing)
      return res.status(400).json({ message: "Email already exists" });
    const hashed = await bcrypt.hash(password, 10);

    const admin = new User({
      name,
      email,
      password: hashed,
      role: "admin",
      customerId: await ensureUniqueCustomerId(),
    });
    await admin.save();
    res.status(201).json({ message: "Admin created", adminId: admin._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
