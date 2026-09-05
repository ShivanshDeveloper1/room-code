import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FaArrowLeft,
  FaExclamationTriangle,
  FaSearch,
  FaTimes,
  FaEye,
  FaCheck,
  FaClock,
  FaUser,
  FaCalendarAlt,
  FaImage,
} from "react-icons/fa";
import Base_url, { Socket_url } from "../config";

import "../Admin/ViewUsers.css";

const Complaints = () => {
  const token = sessionStorage.getItem("accessToken");
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all"); // 'all', 'open', 'resolved'

  useEffect(() => {
    getComplaints();
  }, []);

  const getComplaints = async () => {
    try {
      setLoading(true);
      const url = `${Base_url}/complaints`;
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      };
      const response = await axios.get(url, { headers });
      console.log("Complaints response:", response.data);
      setComplaints(response.data.complaints || []);
    } catch (error) {
      console.log("Error fetching complaints:", error);
      setComplaints([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredComplaints = complaints.filter((complaint) => {
    const matchesSearch =
      complaint.reason?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.reportedBy?.name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());

    let matchesStatusFilter = true;
    if (filterStatus === "open") {
      matchesStatusFilter = complaint.status === "open";
    } else if (filterStatus === "resolved") {
      matchesStatusFilter = complaint.status === "resolved";
    }

    return matchesSearch && matchesStatusFilter;
  });

  const formatDate = (dateString) => {
    if (!dateString) return "Unknown date";
    const options = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "open":
        return <FaClock className="status-icon open" />;
      case "resolved":
        return <FaCheck className="status-icon resolved" />;
      default:
        return <FaClock className="status-icon open" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "open":
        return "#ff6b6b";
      case "resolved":
        return "#4CAF50";
      default:
        return "#ff6b6b";
    }
  };

  const handleComplaintClick = (complaint) => {
    setSelectedComplaint(complaint);
    setShowDetailModal(true);
  };

  const closeModal = () => {
    setShowDetailModal(false);
    setSelectedComplaint(null);
  };

  const handleStatusChange = async (complaintId, newStatus) => {
    try {
      let url;
      if (newStatus === "resolved") {
        url = `${Base_url}/admin/complaints/${complaintId}/resolve`;
      } else {
        url = `${Base_url}/complaints/${complaintId}/status`;
      }

      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      };

      let response;
      if (newStatus === "resolved") {
        response = await axios.post(url, {}, { headers });
      } else {
        response = await axios.put(url, { status: newStatus }, { headers });
      }

      console.log("Status update response:", response.data);

      // Update the complaint in the list
      setComplaints((prevComplaints) =>
        prevComplaints.map((complaint) =>
          complaint._id === complaintId
            ? { ...complaint, status: newStatus }
            : complaint
        )
      );

      // Update selected complaint if it's the same one
      if (selectedComplaint && selectedComplaint._id === complaintId) {
        setSelectedComplaint((prev) => ({ ...prev, status: newStatus }));
      }

      alert(`Complaint ${newStatus} successfully!`);
    } catch (error) {
      console.log("Error updating status:", error);
      alert("Error updating complaint status. Please try again.");
    }
  };

  return (
    <div className="users-container">
      <div className="users-header">
        <button
          className="back-button"
          onClick={() => navigate(-1)}
          style={{ color: "#000", marginBottom: "5px" }}
        >
          <FaArrowLeft size={20} />
        </button>
        <div className="admin-header">
          <h2>Complaints Management</h2>
        </div>
      </div>

      <div className="search-container">
        <FaSearch className="search-icon" />
        <input
          type="text"
          placeholder="Search complaints by reason or user name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {searchTerm && (
          <FaTimes className="clear-search" onClick={() => setSearchTerm("")} />
        )}
      </div>

      {/* Filter Buttons */}
      <div className="filter-buttons-container">
        <button
          className={`filter-btn ${filterStatus === "all" ? "active" : ""}`}
          onClick={() => setFilterStatus("all")}
        >
          All
        </button>
        <button
          className={`filter-btn open-filter ${filterStatus === "open" ? "active" : ""
            }`}
          onClick={() => setFilterStatus("open")}
        >
          Open
        </button>
        <button
          className={`filter-btn resolved-filter ${filterStatus === "resolved" ? "active" : ""
            }`}
          onClick={() => setFilterStatus("resolved")}
        >
          Resolved
        </button>
      </div>

      {loading ? (
        <div className="loading-spinner">
          <div className="spinner"></div>
        </div>
      ) : (
        <div className="users-list">
          <h3>Total Complaints: {filteredComplaints.length}</h3>
          {filteredComplaints.length > 0 ? (
            <ul>
              {filteredComplaints.map((complaint) => (
                <li
                  key={complaint._id}
                  className="user-item"
                  onClick={() => handleComplaintClick(complaint)}
                >
                  <div className="user-avatar">
                    <FaExclamationTriangle />
                  </div>
                  <div className="user-info">
                    <div className="user-name-row">
                      <span className="user-name">
                        {complaint.reportedBy?.name || "Unknown User"}
                      </span>
                      <span className="user-id">
                        {getStatusIcon(complaint.status)}
                        {complaint.status}
                      </span>
                    </div>
                    <div className="user-meta">
                      <span className="user-email">
                        {complaint.reason?.length > 50
                          ? `${complaint.reason.substring(0, 50)}...`
                          : complaint.reason || "No reason provided"}
                      </span>
                      <span className="user-role">
                        <FaCalendarAlt /> {formatDate(complaint.createdAt)}
                      </span>
                    </div>
                  </div>
                  <div className="complaint-actions">
                    <button
                      className="view-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleComplaintClick(complaint);
                      }}
                    >
                      <FaEye />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="no-users">
              <FaExclamationTriangle size={40} />
              <p>No complaints found</p>
            </div>
          )}
        </div>
      )}

      {/* Complaint Detail Modal */}
      {showDetailModal && selectedComplaint && (
        <div className="modal-overlay" onClick={closeModal}>
          <div
            className="modal-content complaint-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3>Complaint Details</h3>
              <button className="close-modal" onClick={closeModal}>
                <FaTimes />
              </button>
            </div>
            <div className="modal-body">
              <div className="complaint-detail">
                <div className="detail-section">
                  <div className="reporter-date-row">
                    <div className="reporter-info">
                      <FaUser className="detail-icon" />
                      <span>
                        {selectedComplaint.reportedBy?.name || "Unknown User"}
                      </span>
                    </div>
                    <div className="date-info">
                      <FaCalendarAlt className="detail-icon" />
                      <span>{formatDate(selectedComplaint.createdAt)}</span>
                    </div>
                  </div>
                </div>

                <div className="detail-section">
                  <h4>Complaint Reason</h4>
                  <p className="complaint-reason">{selectedComplaint.reason}</p>
                </div>

                <div className="detail-section">
                  <h4>Status</h4>
                  <div className="status-section">
                    <span
                      className="status-badge"
                      style={{
                        color: getStatusColor(selectedComplaint.status),
                      }}
                    >
                      {getStatusIcon(selectedComplaint.status)}
                      {selectedComplaint.status}
                    </span>
                    <div className="status-actions">
                      {selectedComplaint.status === "open" ? (
                        <button
                          className="resolve-btn"
                          onClick={() =>
                            handleStatusChange(
                              selectedComplaint._id,
                              "resolved"
                            )
                          }
                        >
                          <FaCheck /> Mark as Resolved
                        </button>
                      ) : (
                        <button
                          className="reopen-btn"
                          onClick={() =>
                            handleStatusChange(selectedComplaint._id, "open")
                          }
                        >
                          <FaClock /> Reopen
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {selectedComplaint.image && (
                  <div className="detail-section">
                    <h4>Evidence</h4>
                    <div className="evidence-image-small">
                      <img
                        src={
                          selectedComplaint.image.startsWith("http")
                            ? selectedComplaint.image
                            : `${Socket_url}${selectedComplaint.image}`

                        }
                        alt="Evidence"
                        className="evidence-thumbnail-modal"
                        onClick={() => {
                          const imageUrl = selectedComplaint.image.startsWith(
                            "http"
                          )
                            ? selectedComplaint.image
                            : `${Socket_url}${selectedComplaint.image}`;

                          window.open(imageUrl, "_blank");
                        }}
                        onError={(e) => {
                          console.log(
                            "Image failed to load:",
                            selectedComplaint.image
                          );
                          e.target.style.display = "none";
                        }}
                      />
                      <p className="evidence-hint">
                        Click image to view in full size
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Complaints;
