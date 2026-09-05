import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaUser, FaSearch, FaTimes, FaUserShield, FaUserCircle } from 'react-icons/fa';
import Base_url from '../config';
import './ViewUsers.css';

const ViewUsers = () => {
    const token = sessionStorage.getItem('accessToken');
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        UsersList();
    }, []);

    const UsersList = async () => {
        try {
            setLoading(true);
            const url = `${Base_url}/auth/getusers`;
            const headers = {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            };
            const response = await axios.get(url, { headers });
            setUsers(response.data || []);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    const filteredUsers = users.filter(user =>
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.specialId?.toLowerCase().includes(searchTerm.toLowerCase())
    );

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

    return (
        <div className="users-container">
            <div className="users-header">
                <button className="back-button" onClick={() => navigate(-1)}>
                    <FaArrowLeft size={20} />
                </button>
                <h2>User Management</h2>
                <div style={{ width: '36px' }}></div> {/* Spacer for alignment */}
            </div>

            <div className="search-container">
                <FaSearch className="search-icon" />
                <input
                    type="text"
                    placeholder="Search users..."
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

            {loading ? (
                <div className="loading-spinner">
                    <div className="spinner"></div>
                </div>
            ) : (
                <div className="users-list">
                    <h3>All Users ({filteredUsers.length})</h3>
                    {filteredUsers.length > 0 ? (
                        <ul>
                            {filteredUsers.map((user) => (
                                <li key={user._id} className="user-item">
                                    <div className="user-avatar">
                                        {user.name?.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="user-info">
                                        <div className="user-name-row">
                                            <span className="user-name">{user.name}</span>
                                            <span className="user-id">ID: {user.specialId || 'N/A'}</span>
                                        </div>
                                        <div className="user-meta">
                                            <span className="last-login">Last login: {formatDate(user.lastLogin)}</span>
                                            <span className="user-role">
                                                {getRoleIcon(user.role)}
                                                {user.role}
                                            </span>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="no-users">
                            <FaUser size={40} />
                            <p>No users found</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ViewUsers;