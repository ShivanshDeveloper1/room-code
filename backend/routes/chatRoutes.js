const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.js');
const { sendMessage, getMessages, getUserMessages, getOnetoOneMessages, sendOnetoOneMessage } = require("../controllers/chatController.js");

// const router = express.Router();

router.post("/:roomId/messages", protect, sendMessage);
router.get("/:roomId/messages", protect, getMessages);
router.get("/my/history", protect, getUserMessages);

// OnetoOne chat routes
router.get("/onetoone/:userId", protect, getOnetoOneMessages);
router.post("/onetoone/:userId", protect, sendOnetoOneMessage);

module.exports = router;
