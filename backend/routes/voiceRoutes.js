const express = require('express');
const router = express.Router();
const { generateVoiceToken } = require('../controllers/voiceController');
const  { protect } = require('../middleware/auth');

console.log("auth is:", typeof auth);
console.log("generateVoiceToken is:", typeof generateVoiceToken);

router.post('/generate-token', protect, generateVoiceToken);
module.exports = router;