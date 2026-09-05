/**
 * ZegoCloud server-side token (Token04) generator.
 *
 * IMPORTANT: There is no real npm package called "@zegocloud/zego-server-assistant".
 * ZegoCloud ships this as sample source code you copy into your own backend,
 * from: https://github.com/ZEGOCLOUD/zego_server_assistant
 * (path: token/nodejs/server/zegoServerAssistant.js)
 *
 * It only depends on Node's built-in "crypto" module — no install needed.
 */

"use strict";
const crypto = require("crypto");

const ErrorCode = {
  success: 0,
  appIDInvalid: 1,
  userIDInvalid: 3,
  secretInvalid: 5,
  effectiveTimeInSecondsInvalid: 6,
};

function RndNum(a, b) {
  return Math.ceil((a + (b - a)) * Math.random());
}

function makeRandomIv() {
  const str = "0123456789abcdefghijklmnopqrstuvwxyz";
  const result = [];
  for (let i = 0; i < 16; i++) {
    const r = Math.floor(Math.random() * str.length);
    result.push(str.charAt(r));
  }
  return result.join("");
}

function getAlgorithm(keyBase64) {
  const key = Buffer.from(keyBase64);
  switch (key.length) {
    case 16:
      return "aes-128-cbc";
    case 24:
      return "aes-192-cbc";
    case 32:
      return "aes-256-cbc";
  }
  throw new Error("Invalid key length: " + key.length);
}

function aesEncrypt(plainText, key, iv) {
  const cipher = crypto.createCipheriv(getAlgorithm(key), key, iv);
  cipher.setAutoPadding(true);
  const encrypted = cipher.update(plainText);
  const final = cipher.final();
  return Buffer.concat([encrypted, final]);
}

/**
 * @param {number} appId        Your ZEGO App ID (number, from the ZegoCloud console)
 * @param {string} userId       The user this token is for (string)
 * @param {string} secret       Your ZEGO Server Secret (must be exactly 32 bytes)
 * @param {number} effectiveTimeInSeconds  How long the token is valid for
 * @param {string} payload      JSON string with room_id + privilege flags (see voiceController.js)
 * @returns {string} token
 */
function generateToken04(appId, userId, secret, effectiveTimeInSeconds, payload) {
  if (!appId || typeof appId !== "number") {
    throw { errorCode: ErrorCode.appIDInvalid, errorMessage: "appID invalid" };
  }
  if (!userId || typeof userId !== "string") {
    throw { errorCode: ErrorCode.userIDInvalid, errorMessage: "userId invalid" };
  }
  if (!secret || typeof secret !== "string" || secret.length !== 32) {
    throw { errorCode: ErrorCode.secretInvalid, errorMessage: "secret must be a 32 byte string" };
  }
  if (!effectiveTimeInSeconds || typeof effectiveTimeInSeconds !== "number") {
    throw {
      errorCode: ErrorCode.effectiveTimeInSecondsInvalid,
      errorMessage: "effectiveTimeInSeconds invalid",
    };
  }

  const createTime = Math.floor(new Date().getTime() / 1000);
  const tokenInfo = {
    app_id: appId,
    user_id: userId,
    nonce: RndNum(-2147483648, 2147483647),
    ctime: createTime,
    expire: createTime + effectiveTimeInSeconds,
    payload: payload || "",
  };

  const plainText = JSON.stringify(tokenInfo);
  const iv = makeRandomIv();
  const encryptBuf = aesEncrypt(plainText, secret, iv);

  const b1 = Buffer.alloc(8);
  const b2 = Buffer.alloc(2);
  const b3 = Buffer.alloc(2);
  b1.writeBigInt64BE(BigInt(tokenInfo.expire), 0);
  b2.writeUInt16BE(iv.length, 0);
  b3.writeUInt16BE(encryptBuf.length, 0);

  const buf = Buffer.concat([b1, b2, Buffer.from(iv), b3, encryptBuf]);
  return "04" + buf.toString("base64");
}

module.exports = { generateToken04 };