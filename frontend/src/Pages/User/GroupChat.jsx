import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaPaperPlane,
  FaImage,
  FaUser,
  FaUsers,
  FaChevronDown,
  FaChevronUp,
  FaSmile,
  FaGift,
  FaCog,
  FaPowerOff,
  FaPlus,
} from "react-icons/fa";
import axios from "axios";
import io from "socket.io-client";
import EmojiPicker from "emoji-picker-react";
import Base_url, { Socket_url } from "../config";
import { FaMicrophone, FaMicrophoneSlash } from "react-icons/fa";


import "./GroupChat.css";
import "./OnetoOnechat.css";
import "./OnetoOneliveChat.css";
import useZegoVoice from "../../components/Usezegovoice.js";
// import '../../../'

function wrapEmojis(str) {
  // This regex finds emoji code points
  const emojiRegex =
    /([\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E6}-\u{1F1FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1F980}-\u{1F9E0}\u{2600}-\u{26FF}\u{2300}-\u{23FF}])/gu;
  return str.replace(emojiRegex, '<span class="chat-emoji">$1</span>');
}

const GroupChat = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const token = sessionStorage.getItem("accessToken");
  const userId = sessionStorage.getItem("userId");
  const userRole = sessionStorage.getItem("userRole"); // Get user role
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [error, setError] = useState(null);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  // Default showMembers to true for the new design
  const [showMembers, setShowMembers] = useState(true);
  const [showVideo, setShowVideo] = useState(
    userRole === "admin" || userRole === "superadmin"
  ); // Show video only for admin/superadmin
  const [videoError, setVideoError] = useState(false);
  const [seats, setSeats] = useState([]); // Array of 8 seats
  const [isSeated, setIsSeated] = useState(false);
  const messagesEndRef = useRef();
  const messagesContainerRef = useRef();
  const videoRef = useRef();

  // --- Voice chat (ZegoCloud) ---------------------------------------
  // Mic only makes sense once you're on a seat, so it auto-joins/leaves
  // together with isSeated instead of needing its own separate button.
  const {
    joined: voiceJoined,
    connecting: voiceConnecting,
    micOn,
    error: voiceError,
    speakingUserIds,
    join: joinVoice,
    leave: leaveVoice,
    toggleMic,
  } = useZegoVoice({
    roomId: groupId,
    userId,
    userName: sessionStorage.getItem("userName") || userId,
  });

  useEffect(() => {
    if (!isSeated && voiceJoined) {
      leaveVoice();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSeated]);

  const handleMicClick = () => {
    if (!isSeated) return;
    if (!voiceJoined) {
      joinVoice();
    } else {
      toggleMic();
    }
  };

  useEffect(() => {
    if (!token || !userId || !groupId) {
      console.error("Missing required data:", {
        token: !!token,
        userId,
        groupId,
      });
      navigate(-1);
      return;
    }

    const newSocket = io(Socket_url, {
      transports: ["websocket", "polling"],
      timeout: 20000,
    });

    setSocket(newSocket);

    const fetchData = async () => {
      try {
        setLoading(true);
        console.log("Fetching data for groupId:", groupId);

        try {
          await axios.post(
            `${Base_url}/rooms/join/${groupId}`,
            {},
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          console.log("Successfully joined/already in room");
        } catch (joinError) {
          console.log(
            "Join room error (might already be in room):",
            joinError.response?.data?.message
          );
        }

        const [groupRes, messagesRes] = await Promise.all([
          axios.get(`${Base_url}/rooms/getgroupdata/${groupId}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${Base_url}/chats/${groupId}/messages`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        console.log("Group data:", groupRes.data);
        setGroup(groupRes.data);

        // NEW: Load initial seats from API response
        if (groupRes.data?.seats) {
          setSeats(groupRes.data.seats);
          const seated = groupRes.data.seats.some(seat =>
            (seat.userId?._id || seat.userId) === userId
          );
          setIsSeated(seated);
        }

        setMessages(messagesRes.data || []);
        setLoading(false);

        newSocket.emit("setUserId", userId);
        newSocket.emit("userOnline", userId);
        newSocket.emit("joinGroup", groupId);
      } catch (error) {
        console.error("Fetch error:", error);
        setError("Failed to load chat data. Please try again.");
        setLoading(false);
      }
    };

    fetchData();

    newSocket.on("receiveMessage", (message) => {
      console.log("📩 New message received:", message);
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    newSocket.on("onlineUsers", (users) => {
      console.log("Online users updated:", users);
      setOnlineUsers(users || []);
    });

    newSocket.on("joinedGroup", (data) => {
      console.log("Successfully joined group:", data);
    });

    newSocket.on("roomUpdate", (data) => {
      console.log("Room update received:", data);
      if (data.seats) {
        setSeats(data.seats);
        // Better way to check if current user is seated
        const currentSeated = data.seats.some(seat => {
          const seatUserId = seat.userId?._id || seat.userId;
          return seatUserId === userId;
        });
        setIsSeated(currentSeated);
      }
    });

    newSocket.on("error", (error) => {
      console.error("Socket error:", error);
      if (error.message.includes("seat")) {
        alert(error.message);
      }
    });

    return () => {
      if (newSocket) {
        newSocket.emit("leaveGroup", groupId);
        newSocket.emit("userOffline", userId);
        newSocket.disconnect();
      }
    };
  }, [groupId, token, userId, navigate]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Only hide video after 5 seconds if user is admin/superadmin
    if (userRole === "admin" || userRole === "superadmin") {
      const videoTimer = setTimeout(() => {
        setShowVideo(false);
      }, 5000);

      return () => clearTimeout(videoTimer);
    }
  }, [userRole]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    if (!socket) {
      console.error("Socket not connected");
      return;
    }

    try {
      setSendingMessage(true);
      console.log("Sending message:", { groupId, userId, content: newMessage });

      socket.emit("sendMessage", {
        groupId,
        userId,
        content: newMessage,
      });

      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Failed to send message. Please try again.");
    } finally {
      setSendingMessage(false);
    }
  };

  const handleEmojiClick = (emojiData) => {
    setNewMessage((prev) => prev + emojiData.emoji);
    setShowEmojiPicker(false);
  };

  const handleVideoEnd = () => {
    setShowVideo(false);
  };

  const handleVideoError = () => {
    console.error("Video failed to load");
    setVideoError(true);
    setShowVideo(false);
  };

  const handleVideoLoad = () => {
    console.log("Video loaded successfully");
    setVideoError(false);
  };

  const handleSkipVideo = () => {
    setShowVideo(false);
  };

  const handleTakeSeat = (position) => {
    if (isSeated) {
      alert("You are already on a seat!");
      return;
    }

    if (window.confirm("Do you want to take this seat?")) {
      socket.emit("takeSeat", { groupId, userId, position });
    }
  };

  const handleLeaveSeat = () => {
    if (window.confirm("Do you want to leave your seat?")) {
      socket.emit("leaveSeat", { groupId, userId });
    }
  };

  if (loading) {
    return (
      <div className="chat-loading">
        <div className="spinner"></div>
        <p>Loading chat...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="chat-error">
        <div className="error-content">
          <h3>Oops! Something went wrong</h3>
          <p>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="retry-button"
          >
            Try Again
          </button>
          <button onClick={() => navigate(-1)} className="back-button-error">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="onetoone-container game-theme-container">
      {/* Video Overlay - Multiple Video Sources for Compatibility */}
      {showVideo && (
        <div
          className="video-overlay"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "black",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* Try multiple video sources */}
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            onEnded={handleVideoEnd}
            onError={handleVideoError}
            onLoadedData={handleVideoLoad}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          >
            {/* Try multiple paths */}
            <source
              src="../../../videos/group-chat-intro.mp4"
              type="video/mp4"
            />

            {/* Fallback content if video doesn't load */}
            <div
              style={{
                color: "white",
                textAlign: "center",
                padding: "20px",
              }}
            >
              <h3>Welcome to Group Chat!</h3>
              <p>Video not available</p>
            </div>
          </video>

          {/* Skip button */}
          <button
            onClick={handleSkipVideo}
            style={{
              position: "absolute",
              top: "20px",
              right: "20px",
              background: "rgba(0,0,0,0.7)",
              color: "white",
              border: "2px solid white",
              padding: "10px 20px",
              borderRadius: "25px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "bold",
              zIndex: 10000,
              transition: "all 0.3s ease",
            }}
            onMouseOver={(e) => {
              e.target.style.background = "rgba(255,255,255,0.2)";
            }}
            onMouseOut={(e) => {
              e.target.style.background = "rgba(0,0,0,0.7)";
            }}
          >
            Skip ›
          </button>

          {/* Loading indicator */}
          {!videoError && (
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                color: "white",
                fontSize: "16px",
                zIndex: 10001,
              }}
            >
              Loading video...
            </div>
          )}
        </div>
      )}

      {/* Game Group Chat Header */}
      <div className="game-group-header">
        <div className="header-left">
          <button className="back-button" onClick={() => navigate(-1)}>
            <FaArrowLeft size={20} color="white" />
          </button>
        </div>

        <div className="header-center">
          <h2>{group?.name || "Game group"}</h2>
          <p className="room-id">ID: {group?.roomId || groupId}</p>
        </div>

        <div className="header-right">
          <button className="power-button">
            <FaPowerOff size={20} color="white" />
          </button>
        </div>
      </div>

      {/* Members Grid (Stage) */}
      <div className="game-group-stage">
        <div className="stage-grid">
          {Array.from({ length: 8 }).map((_, index) => {
            const seat = seats.find(s => s.position === index);
            const member = seat?.userId;
            const memberId = member?._id || member;
            const isMe = memberId === userId;
            const isOnline = member && onlineUsers.some(
              (onlineUser) => onlineUser._id === memberId
            );
            const isSpeaking = member && speakingUserIds.has(String(memberId));

            return (
              <div key={index} className="stage-member">
                <div
                  className={`stage-avatar-container ${isOnline ? 'active-speaker' : ''} ${isSpeaking ? 'speaking' : ''}`}
                  onClick={() => {
                    if (!member) handleTakeSeat(index);
                    else if (isMe) handleLeaveSeat();
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  {member ? (
                    <>
                      {member.avatar ? (
                        <img
                          src={
                            member.avatar.startsWith("http")
                              ? member.avatar
                              : `${Socket_url}${member.avatar}`
                          }
                          alt={member.name}
                          onError={(e) => {
                            e.target.style.display = 'none';
                            if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div className="avatar-fallback" style={{ display: member.avatar ? 'none' : 'flex' }}>
                        {member.name?.charAt(0).toUpperCase()}
                      </div>
                      {isOnline && <span className="status-dot"></span>}
                      {isMe && voiceJoined && (
                        <span className="mic-status-dot">
                          {micOn ? <FaMicrophone size={9} /> : <FaMicrophoneSlash size={9} />}
                        </span>
                      )}
                    </>
                  ) : (
                    <div className="empty-seat">
                      <FaPlus color="rgba(255,255,255,0.5)" size={20} />
                    </div>
                  )}
                </div>
                <span className="stage-name">
                  {member ? (
                    <>
                      {member.name}
                      {(member.role === "admin" || member.role === "superadmin") && (
                        <span className="verified-tick">✓</span>
                      )}
                    </>
                  ) : `Seat ${index + 1}`}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Messages Container */}
   <div
  className="messages-container game-theme"
  ref={messagesContainerRef}
>
  {messages.length === 0 ? (
    <div className="no-messages">
      <FaUsers
        size={48}
        style={{
          marginBottom: "16px",
          opacity: 0.5,
          color: "white",
        }}
      />
      <p style={{ color: "white" }}>
        No messages yet. Start the conversation!
      </p>
    </div>
  ) : (
    <div className="messages-list">
      {messages.map((message) => {
        const sender = message?.sender;
        const isMyMessage =
          String(sender?._id) === String(userId);

        return (
          <div
            key={message?._id}
            className={`message-item ${
              isMyMessage ? "sent" : "received"
            }`}
            style={{
              display: "flex",
              marginBottom: "8px",
              justifyContent: isMyMessage
                ? "flex-end"
                : "flex-start",
              alignItems: "flex-end",
            }}
          >
            {!isMyMessage && (
              <div className="sender-avatar">
                {sender?.name?.charAt(0)?.toUpperCase() || "?"}
              </div>
            )}

            <div className="message-bubble">
              {!isMyMessage && (
                <span className="sender-name">
                  {sender?.name || "Unknown User"}
                </span>
              )}

              <p className="message-text">
                {message?.content || message?.message}
              </p>
            </div>
          </div>
        );
      })}

      <div ref={messagesEndRef} />
    </div>
  )}
</div>

      {voiceError && <div className="voice-error-banner">{voiceError}</div>}

      {/* Input Box */}
      <form className="game-input-area" onSubmit={handleSendMessage}>
        {showEmojiPicker && (
          <div className="game-emoji-picker">
            <div className="emoji-overlay" onClick={() => setShowEmojiPicker(false)}></div>
            <EmojiPicker onEmojiClick={handleEmojiClick} />
          </div>
        )}

        <div className="chat-pill">
          <button
            type="button"
            className="emoji-btn"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          >
            <FaSmile />
          </button>
          <input
            type="text"
            placeholder={isSeated ? "say something..." : "Take a seat to chat"}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            disabled={!isSeated}
          />
        </div>

        <div className="chat-actions">
          <button
            type="button"
            className={`action-btn mic-btn ${voiceJoined && micOn ? "mic-on" : ""} ${voiceJoined && !micOn ? "mic-muted" : ""}`}
            onClick={handleMicClick}
            disabled={!isSeated || voiceConnecting}
            title={
              !isSeated
                ? "Take a seat to use the mic"
                : voiceConnecting
                ? "Connecting..."
                : !voiceJoined
                ? "Turn on mic"
                : micOn
                ? "Mute mic"
                : "Unmute mic"
            }
          >
            {voiceConnecting ? (
              <span className="mic-spinner" />
            ) : voiceJoined && micOn ? (
              <FaMicrophone />
            ) : (
              <FaMicrophoneSlash />
            )}
          </button>
          <button type="submit" className="action-btn send-btn" disabled={!newMessage.trim() || sendingMessage || !isSeated}>
            <FaPaperPlane />
          </button>
        </div>
      </form>
    </div>
  );
};

export default GroupChat;