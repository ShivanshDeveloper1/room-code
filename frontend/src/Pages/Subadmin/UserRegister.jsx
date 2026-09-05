import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaUser, FaSearch, FaTimes, FaUserShield, FaUserCircle, FaBan, FaCheckCircle } from 'react-icons/fa';
import Base_url from '../config';
import '../Admin/ViewUsers.css';

const UserRegister = () => {
    const token = sessionStorage.getItem('accessToken');
    console.log("token",token);
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState(null);
    const [showBanModal, setShowBanModal] = useState(false);
    const [banAction, setBanAction] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [filterType, setFilterType] = useState('all'); // 'all', 'active', 'banned'

    useEffect(() => {
        UsersList();
    }, []);

    const UsersList = async () => {
        try {
            console.log("token1",token);
            setLoading(true);
            const url = `${Base_url}/admin/users`;
            const headers = {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            };
            const response = await axios.get(url,{headers});
            console.log("response of users list", response.data);
            
            // Ensure we always set an array
            if (Array.isArray(response.data)) {
                setUsers(response.data);
            } else if (response.data && Array.isArray(response.data.users)) {
                setUsers(response.data.users);
            } else if (response.data && Array.isArray(response.data.data)) {
                setUsers(response.data.data);
            } else {
                console.log("Unexpected response format:", response.data);
                setUsers([]);
            }
        } catch (error) {
            console.log("Error fetching users:", error);
            setUsers([]);
        } finally {
            setLoading(false);
        }
    };


    const filteredUsers = Array.isArray(users) ? users.filter(user => {
        // Filter out admin users
        if (user.role === 'admin' || user.role === 'superadmin') return false;
        
        // Apply search filter
        const matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             user.specialId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             user.customerId?.toLowerCase().includes(searchTerm.toLowerCase());
        
        // Apply ban status filter
        let matchesBanFilter = true;
        if (filterType === 'active') {
            matchesBanFilter = !user.banned;
        } else if (filterType === 'banned') {
            matchesBanFilter = user.banned;
        }
        
        return matchesSearch && matchesBanFilter;
    }) : [];

    const formatDate = (dateString) => {
        if (!dateString) return 'Never logged in';
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    const getRoleIcon = (role) => {
        switch(role) {
            case 'admin':
                return <FaUserShield className="role-icon admin" />;
            case 'superadmin':
                return <FaUserShield className="role-icon superadmin" />;
            default:
                return <FaUserCircle className="role-icon user" />;
        }
    };

    const handleUserClick = (user) => {
        setSelectedUser(user);
        setShowBanModal(true);
    };

    const handleBanAction = async (action) => {
        if (!selectedUser) return;
        
        setIsProcessing(true);
        try {
            let url;
            if (action === 'ban') {
                url = `${Base_url}/admin/ban/${selectedUser._id}`;
            } else {
                url = `${Base_url}/admin/unban/${selectedUser._id}`;
            }
            
            const headers = {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            };
            
            const response = await axios.post(url, {}, { headers });
            console.log(`User ${action} response:`, response.data);
            
            if (response.data.message) {
                // Update user status in the list
                setUsers(prevUsers => 
                    prevUsers.map(user => 
                        user._id === selectedUser._id 
                            ? { ...user, banned: action === 'ban' }
                            : user
                    )
                );
            }
            
            setShowBanModal(false);
            setSelectedUser(null);
        } catch (error) {
            console.log(`Error ${action}ing user:`, error);
        } finally {
            setIsProcessing(false);
        }
    };

    const closeModal = () => {
        setShowBanModal(false);
        setSelectedUser(null);
        setBanAction(null);
    };

    return (
        <div className="users-container">
            <div className="users-header">
                <button className="back-button" onClick={() => navigate(-1)} style={{color:'#000',marginBottom:'5px'}}>
                    <FaArrowLeft size={20} />
                </button>
                <div className="admin-header">
                    <h2>Users List</h2>
                </div>
            </div>

            <div className="search-container">
                <FaSearch className="search-icon" />
                <input
                    type="text"
                    placeholder="Search by name, ID, or customer ID..."
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

            {/* Filter Buttons */}
            <div className="filter-buttons-container">
                <button 
                    className={`filter-btn ${filterType === 'all' ? 'active' : ''}`}
                    onClick={() => setFilterType('all')}
                >
                    All
                </button>
                <button 
                    className={`filter-btn active-filter ${filterType === 'active' ? 'active' : ''}`}
                    onClick={() => setFilterType('active')}
                >
                    Active
                </button>
                <button 
                    className={`filter-btn banned-filter ${filterType === 'banned' ? 'active' : ''}`}
                    onClick={() => setFilterType('banned')}
                >
                    Banned
                </button>
            </div>

            {loading ? (
                <div className="loading-spinner">
                    <div className="spinner"></div>
                </div>
            ) : (
                <div className="users-list">
                    <h3>Total Registered Users: {filteredUsers.length}</h3>
                    {filteredUsers.length > 0 ? (
                        <ul>
                            {filteredUsers.map((user) => (
                                <li key={user._id} className={`user-item ${user.banned ? 'banned' : ''}`} onClick={() => handleUserClick(user)}>
                                    <div className="user-avatar">
                                        {user.name?.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="user-info">
                                        <div className="user-name-row">
                                            <span className="user-name">{user.name}</span>
                                            <span className="user-id">ID: {user.customerId || user.specialId || 'N/A'}</span>
                                        </div>
                                        <div className="user-meta">
                                            <span className="user-email">{user.email || 'No email'}</span>
                                            {/* <span className="last-login">Last login: {formatDate(user.lastLogin)}</span> */}
                                            <span className="user-role">
                                                {getRoleIcon(user.role)}
                                                {user.role}
                                                {user.banned && <span className="banned-status"> (Banned)</span>}
                                            </span>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="no-users">
                            <FaUser size={40} />
                            <p>No registered users found</p>
                        </div>
                    )}
                </div>
            )}

            {/* Ban/Unban Modal */}
            {showBanModal && selectedUser && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>User Actions</h3>
                            <button className="close-modal" onClick={closeModal}>
                                <FaTimes />
                            </button>
                        </div>
                        <div className="modal-body">
                            <p>What would you like to do with <strong>{selectedUser.name}</strong>?</p>
                            <div className="action-buttons">
                                {!selectedUser.banned ? (
                                    <button 
                                        className="ban-btn"
                                        onClick={() => handleBanAction('ban')}
                                        disabled={isProcessing}
                                    >
                                        <FaBan /> {isProcessing ? 'Banning...' : 'Ban User'}
                                    </button>
                                ) : (
                                    <button 
                                        className="unban-btn"
                                        onClick={() => handleBanAction('unban')}
                                        disabled={isProcessing}
                                    >
                                        <FaCheckCircle /> {isProcessing ? 'Unbanning...' : 'Unban User'}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserRegister;