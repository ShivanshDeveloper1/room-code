import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaSearch, FaTimes, FaUser } from "react-icons/fa";
import axios from "axios";
import io from "socket.io-client";
import Base_url, { Socket_url } from "../config";


import "./OnetoOnechat.css";

const OnetoOnechat = () => {
  const navigate = useNavigate();
  const token = sessionStorage.getItem("accessToken");
  const currentUserId = sessionStorage.getItem("userId");
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Initialize socket connection
    const newSocket = io(Socket_url, {
      transports: ["websocket", "polling"],
      timeout: 20000,
    });

    setSocket(newSocket);

    // Set current user as online globally
    newSocket.emit("setUserId", currentUserId);
    newSocket.emit("userOnline", currentUserId);

    // Listen for online users updates
    newSocket.on("onlineUsersUpdate", (onlineUsersList) => {
      console.log("Online users updated:", onlineUsersList);
      setOnlineUsers(onlineUsersList || []);
    });

    fetchUsers();

    return () => {
      if (newSocket) {
        newSocket.emit("userOffline", currentUserId);
        newSocket.disconnect();
      }
    };
  }, [currentUserId]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${Base_url}/users/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Get all users except admins and current user
      const filteredUsers =
        response.data.users?.filter(
          (user) => user.role !== "admin" && user.role !== "superadmin"
        ) || [];
      setUsers(filteredUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter((user) =>
    user.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isUserOnline = (userId) => {
    // Check in global online users list (array of userIds)
    return onlineUsers.includes(userId);
  };

  const handleUserClick = (user) => {
    navigate(`/onetoone-livechat/${user._id}`, {
      state: {
        receiverData: {
          _id: user._id,
          name: user.name,
          avatar: user.avatar,
          role: user.role,
          specialId: user.specialId,
        },
      },
    });
  };

  const getLastSeen = (user) => {
    if (isUserOnline(user._id)) {
      return "Online";
    }
    // You can add last seen logic here if available in user data
    return "Last seen recently";
  };

  if (loading) {
    return (
      <div className="chat-loading">
        <div className="spinner"></div>
        <p>Loading contacts...</p>
      </div>
    );
  }

  return (
    <div className="onetoone-container">
      {/* Header */}
      <div className="onetoone-header">
        <button className="back-button" onClick={() => navigate(-1)}>
          <FaArrowLeft size={20} />
        </button>
        <div className="header-info">
          <h2>Messages</h2>
          <p>{users.length} contacts</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="search-container">
        <FaSearch className="search-icon" />
        <input
          type="text"
          placeholder="Search contacts..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {searchTerm && (
          <FaTimes className="clear-search" onClick={() => setSearchTerm("")} />
        )}
      </div>

      {/* Users List */}
      <div className="users-list">
        {filteredUsers.length > 0 ? (
          <ul>
            {filteredUsers.map((user) => (
              <li
                key={user._id}
                className="user-item"
                onClick={() => handleUserClick(user)}
              >
                <div className="user-avatar-container">
                  <div className="user-avatar">
                    {user.avatar ? (
                      <img
                        src={
                          user.avatar.startsWith("http")
                            ? user.avatar
                            : `${Socket_url}${user.avatar}`

                        }
                        alt={user.name}
                        onError={(e) => {
                          e.target.style.display = "none";
                          e.target.nextSibling.style.display = "flex";
                        }}
                      />
                    ) : null}
                    <span
                      className="avatar-initials"
                      style={{
                        display: user.avatar ? "none" : "flex",
                        width: "100%",
                        height: "100%",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "18px",
                        fontWeight: "bold",
                        color: "white",
                        background:
                          "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        borderRadius: "50%",
                      }}
                      onError={() => { }}
                    >
                      {user.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div
                    className={`status-dot ${isUserOnline(user._id) ? "online" : "offline"
                      }`}
                  ></div>
                </div>

                <div className="user-info">
                  <div className="user-details">
                    <span className="user-name">{user.name}</span>
                    <span className="user-status">{getLastSeen(user)}</span>
                  </div>
                  <div className="user-meta">
                    <span className="user-role">{user.role}</span>
                    {user.specialId && (
                      <span className="user-id">ID: {user.specialId}</span>
                    )}
                  </div>
                </div>

                <div className="chat-indicator">
                  <div className="message-preview">
                    <span>Tap to chat</span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="no-users">
            <FaUser size={40} />
            <p>No contacts found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OnetoOnechat;
