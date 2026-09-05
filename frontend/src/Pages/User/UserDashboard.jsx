import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUsers, FaTimes, FaPlus, FaTimesCircle, FaLock, FaClock, FaCheckCircle } from 'react-icons/fa';
import Base_url from '../config';
import logo from '../../images/gnet-logo.jpg';
import './user.css';

const UserDashboard = () => {
    const token = sessionStorage.getItem('accessToken');
    const userName = sessionStorage.getItem('userName') || 'User';
    const navigate = useNavigate();
    
    const [rooms, setRooms] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [userProfile, setUserProfile] = useState(null);
    const [hasAccess, setHasAccess] = useState(false);
    const [paymentStatus, setPaymentStatus] = useState('none');

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [submittingPayment, setSubmittingPayment] = useState(false);

    // Form states
    const [paymentForm, setPaymentForm] = useState({
        email: '',
        phone: '',
        transactionId: ''
    });

    const [createRoomData, setCreateRoomData] = useState({
        name: '',
        roomId: ''
    });
    const [creatingRoom, setCreatingRoom] = useState(false);

useEffect(() => {
    fetchUserData();
    getRooms();

    const handleVisibilityChange = () => {
        if (document.visibilityState === "visible") {
            fetchUserData();
            getRooms();
        }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
        document.removeEventListener(
            "visibilitychange",
            handleVisibilityChange
        );
    };
}, []);

    const fetchUserData = async () => {
        try {
            const res = await axios.get(`${Base_url}/users/me`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setHasAccess(res.data.user?.hasRoomAccess || false);
            setPaymentStatus(res.data.user?.paymentStatus || 'none');
            setPaymentForm(prev => ({
                ...prev,
                email: res.data.user?.email || '',
                phone: res.data.user?.phone !== '0000000000' ? res.data.user?.phone : ''
            }));
        } catch (error) {
            console.error("Error fetching user profile:", error);
        }
    };

    const getRooms = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${Base_url}/rooms`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setRooms(response.data.rooms || response.data || []);
        } catch (error) {
            console.log("Error fetching rooms:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleJoinRoom = (roomId) => {
        if (!hasAccess) {
            alert('Access Restricted! Please complete payment and get admin approval to join or create rooms.');
            setShowPaymentModal(true);
            return;
        }
        navigate(`/group-chat/${roomId}`);
    };

    const handleCreateRoomClick = () => {
        if (!hasAccess) {
            setShowPaymentModal(true);
        } else {
            setShowCreateModal(true);
        }
    };

    const handleSubmitPaymentVerification = async (e) => {
        e.preventDefault();
        if (!paymentForm.email || !paymentForm.phone) {
            alert("Please provide both email and phone number used for payment.");
            return;
        }

        try {
            setSubmittingPayment(true);
            await axios.post(
                `${Base_url}/payment/submit-request`,
                paymentForm,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setPaymentStatus('pending');
            setShowPaymentModal(false);
            alert("Payment verification request submitted! Please wait for Admin approval.");
        } catch (error) {
            alert(error.response?.data?.message || 'Error submitting payment request');
        } finally {
            setSubmittingPayment(false);
        }
    };

    const handleCreateRoom = async () => {
        if (!createRoomData.name.trim()) {
            alert('Please enter a room name');
            return;
        }

        try {
            setCreatingRoom(true);
            await axios.post(
                `${Base_url}/rooms/create`,
                {
                    name: createRoomData.name.trim(),
                    roomId: createRoomData.roomId.trim() || undefined
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setCreateRoomData({ name: '', roomId: '' });
            setShowCreateModal(false);
            await getRooms();
            alert('Room created successfully!');
        } catch (error) {
            alert(error.response?.data?.message || 'Error creating room');
        } finally {
            setCreatingRoom(false);
        }
    };

    const filteredRooms = rooms.filter(room =>
        room.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        room._id?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="user-dashboard-container">
            {/* Header */}
            <div className="dashboard-header">
                <div className="header-left">
                    <img src={logo} alt="Logo" className="header-logo" />
                </div>
                <div className="header-right">
                    <div className="user-avatar">
                        <span className="avatar-letter">{userName.charAt(0).toUpperCase()}</span>
                    </div>
                </div>
            </div>

            {/* Access Status Banner */}
            <div className="status-banner" style={{ padding: '10px 20px', background: hasAccess ? '#e6fffa' : '#fff5f5', marginBottom: '15px', borderRadius: '8px' }}>
                {hasAccess ? (
                    <span style={{ color: 'green', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FaCheckCircle /> Access Active (Unlocked)
                    </span>
                ) : paymentStatus === 'pending' ? (
                    <span style={{ color: '#d69e2e', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FaClock /> Payment Verification Pending Admin Approval
                    </span>
                ) : (
                    <span style={{ color: '#e53e3e', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FaLock /> Payment Required to Access or Create Rooms
                    </span>
                )}
            </div>

            {/* Search Bar */}
            <div className="search-container">
                <input
                    type="text"
                    placeholder="Search rooms..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && <FaTimes className="clear-search" onClick={() => setSearchTerm('')} />}
            </div>

            {/* Rooms List */}
            {loading ? (
                <div className="loading-spinner"><div className="spinner"></div></div>
            ) : (
                <div className="rooms-section">
                    <div className="rooms-header">
                        <h3>Available Rooms ({filteredRooms.length})</h3>
                        <button className="create-room-btn-small" onClick={handleCreateRoomClick} title="Create Room">
                            <FaPlus />
                        </button>
                    </div>

                    <div className="rooms-grid">
                        {filteredRooms.map((room) => (
                            <div key={room._id} className="room-tile-new" onClick={() => handleJoinRoom(room._id)}>
                                <div className="room-left-content">
                                    <h4 className="room-name-new">{room.name}</h4>
                                    <p className="room-creator-new">Created by: {room.createdBy?.name || "Admin"}</p>
                                    <p className="room-id-new">ID: {room.roomId || room._id}</p>
                                </div>
                                <div className="room-right-content">
                                    {!hasAccess && <FaLock style={{ color: '#e53e3e', fontSize: '20px' }} />}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Payment & Admin Verification Request Modal */}
            {showPaymentModal && (
                <div className="modal-overlay">
                    <div className="small-payment-modal" style={{ maxWidth: '400px', width: '90%' }}>
                        <div className="small-modal-header">
                            <h4>Scan QR & Request Access</h4>
                            <button className="close-small-modal" onClick={() => setShowPaymentModal(false)}>
                                <FaTimes size={16} />
                            </button>
                        </div>

                        <div className="small-modal-body">
                            <div className="qr-code-placeholder" style={{ textAlign: 'center' }}>
                                <img src="/scanner.jpeg" alt="Payment Scanner" style={{ width: '180px', height: '180px' }} />
                                <div className="payment-note" style={{ fontWeight: 'bold', margin: '10px 0' }}>Pay ₹200 via UPI/GPay</div>
                            </div>

                            {paymentStatus === 'pending' ? (
                                <div style={{ background: '#feebc8', padding: '12px', borderRadius: '6px', textAlign: 'center' }}>
                                    <FaClock color="#b7791f" /> Request Already Submitted. Waiting for Admin Approval.
                                </div>
                            ) : (
                                <form onSubmit={handleSubmitPaymentVerification}>
                                    <div style={{ marginBottom: '10px' }}>
                                        <label style={{ fontSize: '12px', display: 'block' }}>Email ID used in GPay/UPI *</label>
                                        <input
                                            type="email"
                                            required
                                            value={paymentForm.email}
                                            onChange={(e) => setPaymentForm({ ...paymentForm, email: e.target.value })}
                                            placeholder="Enter your email"
                                            style={{ width: '100%', padding: '8px', marginTop: '4px' }}
                                        />
                                    </div>
                                    <div style={{ marginBottom: '10px' }}>
                                        <label style={{ fontSize: '12px', display: 'block' }}>Phone Number used in GPay/UPI *</label>
                                        <input
                                            type="text"
                                            required
                                            value={paymentForm.phone}
                                            onChange={(e) => setPaymentForm({ ...paymentForm, phone: e.target.value })}
                                            placeholder="Enter phone number"
                                            style={{ width: '100%', padding: '8px', marginTop: '4px' }}
                                        />
                                    </div>
                                    <div style={{ marginBottom: '10px' }}>
                                        <label style={{ fontSize: '12px', display: 'block' }}>UTR / Reference ID (Optional)</label>
                                        <input
                                            type="text"
                                            value={paymentForm.transactionId}
                                            onChange={(e) => setPaymentForm({ ...paymentForm, transactionId: e.target.value })}
                                            placeholder="12-digit transaction ID"
                                            style={{ width: '100%', padding: '8px', marginTop: '4px' }}
                                        />
                                    </div>
                                    <button 
                                        type="submit" 
                                        className="small-proceed-btn" 
                                        disabled={submittingPayment}
                                        style={{ width: '100%', padding: '10px', marginTop: '8px' }}
                                    >
                                        {submittingPayment ? 'Submitting...' : 'Paid? Request Admin Access'}
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Create Room Modal */}
            {showCreateModal && (
                <div className="modal-overlay">
                    <div className="create-room-modal">
                        <div className="modal-header">
                            <h3>Create New Room</h3>
                            <button className="close-modal" onClick={() => setShowCreateModal(false)}>
                                <FaTimesCircle />
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label>Room Name *</label>
                                <input
                                    type="text"
                                    value={createRoomData.name}
                                    onChange={(e) => setCreateRoomData({ ...createRoomData, name: e.target.value })}
                                    placeholder="Enter room name..."
                                />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="cancel-btn" onClick={() => setShowCreateModal(false)}>Cancel</button>
                            <button className="create-btn" onClick={handleCreateRoom} disabled={creatingRoom}>
                                {creatingRoom ? 'Creating...' : 'Create Room'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserDashboard;