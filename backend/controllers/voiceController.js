const { generateToken04 } = require("../utils/Zegoserverassistant.js");

// Put these in your backend .env file — get them from the ZegoCloud console
// (Project -> your project -> Basic Info)
const APP_ID = Number(process.env.ZEGO_APP_ID);
const SERVER_SECRET = process.env.ZEGO_SERVER_SECRET; // must be exactly 32 characters

// Generate a token that lets this user log into a room AND publish audio
exports.generateVoiceToken = async (req, res) => {
  try {
    if (!APP_ID || !SERVER_SECRET) {
      return res.status(500).json({
        success: false,
        message: "ZEGO_APP_ID / ZEGO_SERVER_SECRET are missing from your .env file",
      });
    }

    // Prefer the authenticated user from your `auth` middleware if it sets req.user;
    // fall back to the body so this still works if it doesn't.
    const userId = String(req.user?.id || req.body.userId || "");
    const roomId = String(req.body.roomId || "");

    if (!userId || !roomId) {
      return res.status(400).json({ success: false, message: "userId and roomId are required" });
    }

    const effectiveTimeInSeconds = 3600; // token valid for 1 hour

    const payload = JSON.stringify({
      room_id: roomId,
      // 1 = loginRoom, 2 = publishStream — BOTH must be 1 or the user
      // can join the room but their mic will silently fail to publish.
      privilege: {
        1: 1,
        2: 1,
      },
      stream_id_list: null,
    });

    const token = generateToken04(APP_ID, userId, SERVER_SECRET, effectiveTimeInSeconds, payload);

    res.json({ success: true, token, appId: APP_ID, roomId, userId });
  } catch (error) {
    console.error("Token generation error:", error);
    res.status(500).json({ success: false, message: error.errorMessage || error.message || "Token generation failed" });
  }
};