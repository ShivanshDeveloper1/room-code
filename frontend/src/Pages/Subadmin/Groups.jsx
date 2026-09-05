import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaUsers, FaSearch, FaTimes, FaChevronDown, FaChevronUp, FaPlus, FaComments } from 'react-icons/fa';
import Base_url from '../config';
import '../Admin/ViewGroups.css';

const Groups = () => {
    const token = sessionStorage.getItem('accessToken');
    const navigate = useNavigate();
    const [rooms, setRooms] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [expandedRoom, setExpandedRoom] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [creating, setCreating] = useState(false);
    const [newRoom, setNewRoom] = useState({
        name: '',
        roomId: ''
    });

    useEffect(() => {
        GetRooms();
    }, []);

    const GetRooms = async () => {
        try {
            setLoading(true);
            const url = `${Base_url}/rooms`;
            const headers = {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            };
            const response = await axios.get(url, { headers });
            console.log("Rooms response:", response.data);
            setRooms(response.data.rooms || []);
        } catch (error) {
            console.log("Error fetching rooms:", error);
        } finally {
            setLoading(false);
        }
    };

    const CreateRoom = async () => {
        if (!newRoom.name.trim()) {
            alert("Please enter a room name");
            return;
        }

        try {
            setCreating(true);
            const url = `${Base_url}/rooms/create`;
            const headers = {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            };
            const response = await axios.post(url, {
                name: newRoom.name.trim(),
                roomId: newRoom.roomId.trim() || undefined
            }, { headers });

            console.log("Room created:", response.data);
            alert("Room created successfully!");
            setShowCreateModal(false);
            setNewRoom({ name: '', roomId: '' });
            GetRooms();
        } catch (error) {
            console.error("Error creating room:", error);
            const errorMsg = error.response?.data?.message || "Error creating room. Please try again.";
            alert(errorMsg);
        } finally {
            setCreating(false);
        }
    };

    const toggleRoomExpand = (roomId) => {
        setExpandedRoom(expandedRoom === roomId ? null : roomId);
    };

    const handleJoinChat = (roomId) => {
        console.log("Joining room chat with ID:", roomId);
        navigate(`/group-chat/${roomId}`);
    };

    const filteredRooms = rooms.filter(room =>
        room.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        room.roomId?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    return (
        <div className="groups-container">
            {/* Header */}
            <div className="groups-header">
                <button className="back-button" onClick={() => navigate(-1)}>
                    <FaArrowLeft size={20} />
                </button>
                <h2>Rooms Management</h2>
                <button
                    className="add-group-button"
                    onClick={() => setShowCreateModal(true)}
                >
                    <FaPlus size={20} />
                </button>
            </div>

            {/* Search */}
            <div className="search-container">
                <FaSearch className="search-icon" />
                <input
                    type="text"
                    placeholder="Search rooms..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                    <FaTimes
                        className="clear-search"
                        onClick={() => setSearchTerm('')}
                    />
                )}
            </div>

            {/* Loading State */}
            {loading ? (
                <div className="loading-spinner">
                    <div className="spinner"></div>
                </div>
            ) : (
                <div className="groups-list">
                    <h3>All Rooms ({filteredRooms.length})</h3>
                    {filteredRooms.length > 0 ? (
                        <ul>
                            {filteredRooms.map((room) => (
                                <li key={room._id} className="group-item">
                                    <div
                                        className="group-summary"
                                        onClick={() => toggleRoomExpand(room._id)}
                                    >
                                        <div className="group-avatar">
                                            <FaUsers size={20} />
                                        </div>
                                        <div className="group-info">
                                            <div className="group-name-row">
                                                <span className="group-name">{room.name}</span>
                                                <span className="member-count">
                                                    {room.participants?.length || 0} members
                                                    {expandedRoom === room._id ? (
                                                        <FaChevronUp className="expand-icon" />
                                                    ) : (
                                                        <FaChevronDown className="expand-icon" />
                                                    )}
                                                </span>
                                            </div>
                                            <div className="group-meta">
                                                <span className="room-id">Room ID: {room.roomId}</span>
                                                <span className="created-date">Created: {formatDate(room.createdAt)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {expandedRoom === room._id && (
                                        <div className="group-members">
                                            <div className="member-actions">
                                                <button
                                                    className="chat-btn"
                                                    onClick={() => handleJoinChat(room._id)}
                                                >
                                                    <FaComments /> Join Chat
                                                </button>
                                            </div>

                                            <div className="room-details">
                                                <h4>Room Details</h4>
                                                <div className="room-info">
                                                    <div className="info-item">
                                                        <span className="info-label">Room Name:</span>
                                                        <span className="info-value">{room.name}</span>
                                                    </div>
                                                    <div className="info-item">
                                                        <span className="info-label">Room ID:</span>
                                                        <span className="info-value">{room.roomId}</span>
                                                    </div>
                                                    <div className="info-item">
                                                        <span className="info-label">Created By:</span>
                                                        <span className="info-value">{room.createdBy?.name || 'Unknown'}</span>
                                                    </div>
                                                    <div className="info-item">
                                                        <span className="info-label">Created Date:</span>
                                                        <span className="info-value">{formatDate(room.createdAt)}</span>
                                                    </div>
                                                    <div className="info-item">
                                                        <span className="info-label">Max Capacity:</span>
                                                        <span className="info-value">{room.maxCapacity || 500}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <h4>Participants ({room.participants?.length || 0})</h4>
                                            {room.participants && room.participants.length > 0 ? (
                                                <ul className="members-list">
                                                    {room.participants
                                                        .filter((participant, index, self) =>
                                                            index === self.findIndex(p => p._id === participant._id)
                                                        )
                                                        .map((participant, index) => (
                                                            <li key={`${participant._id}-${index}`} className="member-item">
                                                                <div className="member-avatar">
                                                                    {participant.name?.charAt(0).toUpperCase()}
                                                                </div>
                                                                <div className="member-info">
                                                                    <div className="member-name-row">
                                                                        <span className="member-name">{participant.name}</span>
                                                                        <span className="member-role-badge">{participant.role}</span>
                                                                    </div>
                                                                    <div className="member-details">
                                                                        <span className="member-id">ID: {participant.customerId || participant.specialId || 'N/A'}</span>
                                                                        <span className="member-email">{participant.email || 'No email'}</span>
                                                                    </div>
                                                                </div>
                                                                <div className="member-status">
                                                                    <span className="status-indicator active"></span>
                                                                    <span className="status-text">Active</span>
                                                                </div>
                                                            </li>
                                                        ))}
                                                </ul>
                                            ) : (
                                                <div className="no-participants">
                                                    <p>No participants in this room</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="no-groups">
                            <FaUsers size={40} />
                            <p>No rooms found</p>
                        </div>
                    )}
                </div>
            )}

            {/* Create Room Modal */}
            {showCreateModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>Create New Room</h3>
                        <div className="form-group">
                            <label>Room Name</label>
                            <input
                                type="text"
                                value={newRoom.name}
                                onChange={(e) => setNewRoom({ ...newRoom, name: e.target.value })}
                                placeholder="Enter room name"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Room ID (Optional)</label>
                            <input
                                type="text"
                                value={newRoom.roomId}
                                onChange={(e) => setNewRoom({ ...newRoom, roomId: e.target.value })}
                                placeholder="Enter custom room ID (leave empty for auto-generate)"
                            />
                        </div>
                        <div className="modal-actions">
                            <button className="cancel-btn" onClick={() => setShowCreateModal(false)}>
                                Cancel
                            </button>
                            <button className="create-btn" onClick={CreateRoom} disabled={creating}>
                                {creating ? "Creating..." : "Create Room"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Groups;