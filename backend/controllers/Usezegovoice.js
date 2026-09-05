// import { useCallback, useEffect, useRef, useState } from "react";
// import axios from "axios";
// import ZegoExpressEngine from "zego-express-engine-webrtc";
// import Base_url from "../config"; // adjust this relative path to match where you put the hook

// // --- Get these two values from your ZegoCloud console (Project -> Basic Info) ---
// // If you're using Vite:
// const ZEGO_APP_ID = Number(import.meta.env.VITE_ZEGO_APP_ID);
// const ZEGO_SERVER = import.meta.env.VITE_ZEGO_SERVER_URL; // looks like "wss://xxxx-api.zegocloud.com/ws"
// // If you're using Create React App instead, swap the two lines above for:
// // const ZEGO_APP_ID = Number(process.env.REACT_APP_ZEGO_APP_ID);
// // const ZEGO_SERVER = process.env.REACT_APP_ZEGO_SERVER_URL;

// /**
//  * Handles the actual voice-chat plumbing for one room:
//  * - logs into the ZegoCloud room
//  * - captures + publishes the mic
//  * - plays back everyone else's audio automatically
//  * - reports who is currently speaking (for UI indicators)
//  *
//  * Usage: const voice = useZegoVoice({ roomId, userId, userName });
//  */
// export default function useZegoVoice({ roomId, userId, userName }) {
//   const [joined, setJoined] = useState(false);
//   const [connecting, setConnecting] = useState(false);
//   const [micOn, setMicOn] = useState(false);
//   const [error, setError] = useState(null);
//   const [speakingUserIds, setSpeakingUserIds] = useState(new Set());

//   const zgRef = useRef(null);
//   const localStreamRef = useRef(null);
//   const localStreamIdRef = useRef(null);
//   const remoteAudioElsRef = useRef({}); // streamID -> <audio> element
//   const streamOwnerRef = useRef({}); // streamID -> userID, so we can map sound levels back to a person

//   // Create the engine + wire up room/stream listeners once
//   useEffect(() => {
//     if (!ZEGO_APP_ID || !ZEGO_SERVER) {
//       setError("Voice chat isn't configured yet (missing App ID or server URL).");
//       return;
//     }

//     const zg = new ZegoExpressEngine(ZEGO_APP_ID, ZEGO_SERVER);
//     zgRef.current = zg;

//     const handleStreamUpdate = async (_roomID, updateType, streamList) => {
//       if (updateType === "ADD") {
//         for (const { streamID } of streamList) {
//           if (streamID === localStreamIdRef.current) continue; // never play our own voice back
//           try {
//             const remoteStream = await zg.startPlayingStream(streamID);
//             const audioEl = document.createElement("audio");
//             audioEl.autoplay = true;
//             audioEl.srcObject = remoteStream;
//             remoteAudioElsRef.current[streamID] = audioEl;
//           } catch (e) {
//             console.error("Couldn't play remote voice stream", streamID, e);
//           }
//         }
//       } else {
//         for (const { streamID } of streamList) {
//           zg.stopPlayingStream(streamID);
//           remoteAudioElsRef.current[streamID]?.remove?.();
//           delete remoteAudioElsRef.current[streamID];
//           delete streamOwnerRef.current[streamID];
//         }
//       }
//     };

//     const handleSoundLevel = (soundLevelList) => {
//       setSpeakingUserIds((prev) => {
//         const next = new Set();
//         for (const { streamID, soundLevel } of soundLevelList) {
//           if (soundLevel > 10) {
//             const ownerId = streamOwnerRef.current[streamID];
//             if (ownerId) next.add(ownerId);
//           }
//         }
//         // avoid pointless re-renders when nothing changed
//         if (prev.size === next.size && [...prev].every((id) => next.has(id))) return prev;
//         return next;
//       });
//     };

//     zg.on("roomStreamUpdate", handleStreamUpdate);
//     zg.on("soundLevelUpdate", handleSoundLevel);

//     return () => {
//       zg.off("roomStreamUpdate", handleStreamUpdate);
//       zg.off("soundLevelUpdate", handleSoundLevel);
//     };
//   }, []);

//   const join = useCallback(async () => {
//     const zg = zgRef.current;
//     if (!zg || joined || connecting) return;

//     setConnecting(true);
//     setError(null);
//     try {
//       const token = sessionStorage.getItem("accessToken");
//       const { data } = await axios.post(
//         `${Base_url}/voice/generate-token`,
//         { roomId, userId },
//         { headers: { Authorization: `Bearer ${token}` } }
//       );

//       if (!data?.success) throw new Error(data?.message || "Couldn't get a voice token");

//       await zg.loginRoom(String(roomId), data.token, {
//         userID: String(userId),
//         userName: userName || String(userId),
//       });

//       const stream = await zg.createStream({ camera: { audio: true, video: false } });
//       localStreamRef.current = stream;

//       const streamID = `${roomId}_${userId}_audio`;
//       localStreamIdRef.current = streamID;
//       streamOwnerRef.current[streamID] = String(userId);

//       zg.startPublishingStream(streamID, stream);
//       zg.setSoundLevelDelegate(true, 500);

//       setJoined(true);
//       setMicOn(true);
//     } catch (err) {
//       console.error("Voice join failed:", err);
//       const message =
//         err?.name === "NotAllowedError"
//           ? "Microphone access was blocked. Allow it in your browser settings and try again."
//           : err?.message || "Couldn't start the mic. Please try again.";
//       setError(message);
//     } finally {
//       setConnecting(false);
//     }
//   }, [roomId, userId, userName, joined, connecting]);

//   const leave = useCallback(() => {
//     const zg = zgRef.current;
//     if (!zg || !joined) return;

//     if (localStreamIdRef.current) zg.stopPublishingStream(localStreamIdRef.current);
//     if (localStreamRef.current) zg.destroyStream(localStreamRef.current);
//     Object.values(remoteAudioElsRef.current).forEach((el) => el?.remove?.());
//     remoteAudioElsRef.current = {};
//     zg.logoutRoom(String(roomId));

//     localStreamRef.current = null;
//     localStreamIdRef.current = null;
//     setJoined(false);
//     setMicOn(false);
//     setSpeakingUserIds(new Set());
//   }, [roomId, joined]);

//   const toggleMic = useCallback(() => {
//     const zg = zgRef.current;
//     const stream = localStreamRef.current;
//     if (!zg || !stream) return;
//     zg.mutePublishStreamAudio(stream, micOn); // muting = pass current micOn as "mute"
//     setMicOn((prev) => !prev);
//   }, [micOn]);

//   // Always leave cleanly if the component unmounts (e.g. user navigates away)
//   useEffect(() => {
//     return () => {
//       if (joined) leave();
//     };
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   return { joined, connecting, micOn, error, speakingUserIds, join, leave, toggleMic };
// }