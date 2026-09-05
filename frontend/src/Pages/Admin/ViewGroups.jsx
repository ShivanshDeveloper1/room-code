import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaUsers, FaSearch, FaTimes, FaChevronDown, FaChevronUp, FaComments } from 'react-icons/fa';
import Base_url from '../config';
import './ViewGroups.css';

const ViewGroups = () => {
    const token = sessionStorage.getItem('accessToken');
    const userId = sessionStorage.getItem('userId');
    const navigate = useNavigate();
    const [groups, setGroups] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [expandedGroup, setExpandedGroup] = useState(null);

    useEffect(() => {
        Getgroups();
    }, []);

    const Getgroups = async () => {
        try {
            setLoading(true);
            const url = `${Base_url}/groups/getgroup`;
            const headers = {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            };
            const response = await axios.get(url, { headers });
            setGroups(response.data.groups || []);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    const toggleGroupExpand = (groupId) => {
        setExpandedGroup(expandedGroup === groupId ? null : groupId);
    };

    const handleJoinChat = (groupId) => {
        console.log("Joining group chat with ID:", groupId);
        navigate(`/group-chat/${groupId}`);
    };

    const filteredGroups = groups.filter(group =>
        group.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    return (
        <div className="groups-container">
            <div className="groups-header">
                <button className="back-button" onClick={() => navigate(-1)}>
                    <FaArrowLeft size={20} />
                </button>
                <h2>Group Management</h2>
                <div style={{ width: '36px' }}></div> {/* Spacer for alignment */}
            </div>

            <div className="search-container">
                <FaSearch className="search-icon" />
                <input
                    type="text"
                    placeholder="Search groups..."
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
                <div className="groups-list">
                    <h3>All Groups ({filteredGroups.length})</h3>
                    {filteredGroups.length > 0 ? (
                        <ul>
                            {filteredGroups.map((group) => (
                                <li key={group._id} className="group-item">
                                    <div 
                                        className="group-summary"
                                        onClick={() => toggleGroupExpand(group._id)}
                                    >
                                        <div className="group-avatar">
                                            <FaUsers size={20} />
                                        </div>
                                        <div className="group-info">
                                            <div className="group-name-row">
                                                <span className="group-name">{group.name}</span>
                                                <span className="member-count">
                                                    {group.users?.length || 0} members
                                                    {expandedGroup === group._id ? (
                                                        <FaChevronUp className="expand-icon" />
                                                    ) : (
                                                        <FaChevronDown className="expand-icon" />
                                                    )}
                                                </span>
                                            </div>
                                            <div className="group-meta">
                                                <span className="created-date">Created: {formatDate(group.createdAt)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {expandedGroup === group._id && (
                                        <div className="group-members">
                                            <div className="group-actions">
                                                <button 
                                                    className="chat-btn"
                                                    onClick={() => handleJoinChat(group._id)}
                                                >
                                                    <FaComments /> Join Chat
                                                </button>
                                            </div>
                                            <h4>Members</h4>
                                            <ul className="members-list">
                                                {group.users?.map((user) => (
                                                    <li key={user._id} className="member-item">
                                                        <div className="member-avatar">
                                                            {user.name?.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div className="member-info">
                                                            <span className="member-name">{user.name}</span>
                                                            <span className="member-id">{user.specialId || 'No ID'}</span>
                                                        </div>
                                                        <div className={`member-role ${user.role}`}>
                                                            {user.role}
                                                        </div>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="no-groups">
                            <FaUsers size={40} />
                            <p>No groups found</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ViewGroups;