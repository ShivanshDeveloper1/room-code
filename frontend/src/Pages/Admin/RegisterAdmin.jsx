import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  FaUserPlus,
  FaUsers,
  FaSearch,
  FaTimes,
  FaArrowLeft,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Base_url from "../config";
import Swal from "sweetalert2";
import "./RegisterAdmin.css";

const RegisterAdmin = () => {
  const token = sessionStorage.getItem("accessToken");
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [admins, setAdmins] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    GetAdminlist();
  }, []);

  // Register admin API
  const AddAdmin = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    setLoading(true);
    try {
      const url = `${Base_url}/auth/register`;
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      };
      const requestBody = { name, email };
      console.log("Request Body",requestBody);

      const response = await axios.post(url, requestBody, { headers });
      console.log("Response of add admin", response.data);

      if (response.data.message === "admin created successfully") {
        setName("");
        setEmail("");
        setShowForm(false);
        GetAdminlist();

        Swal.fire({
          title: "Good job!",
          text: "Admin registered successfully",
          icon: "success",
        });
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  // Get admin list
  const GetAdminlist = async () => {
    try {
      const url = `${Base_url}/auth/getadmins`;
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      };
      const response = await axios.get(url, { headers });
      console.log("admin list", response.data);
      setAdmins(response.data || []);
    } catch (error) {
      console.log(error);
    }
  };

  const filteredAdmins = admins.filter((admin) =>
    admin.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="admin-container">
      <div className="admin-top-bar">
        <button className="back-button" onClick={() => navigate(-1)}>
          <FaArrowLeft size={20} />
        </button>
        <div className="admin-header">
          <h2>Admin Management</h2>
          <button
            className="add-admin-btn"
            onClick={() => setShowForm(!showForm)}
          >
            <FaUserPlus /> {showForm ? "Cancel" : "Add Admin"}
          </button>
        </div>
      </div>

      {showForm && (
        <form className="admin-form" onSubmit={AddAdmin}>
          <div className="admin-form-row row d-flex justify-content-evenly">
            <div className="form-group half col-md-5">
              <label htmlFor="name">Admin Name</label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter admin name"
                required
              />
            </div>
            <div className="form-group half col-md-5">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter admin email"
                required
              />
            </div>
          </div>
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? "Adding..." : "Register Admin"}
          </button>
        </form>
      )}

      <div className="search-container">
        <FaSearch className="search-icon" />
        <input
          type="text"
          placeholder="Search admins..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {searchTerm && (
          <FaTimes className="clear-search" onClick={() => setSearchTerm("")} />
        )}
      </div>

      <div className="admin-list">
        <h3>Admin List ({filteredAdmins.length})</h3>
        {filteredAdmins.length > 0 ? (
          <ul>
            {filteredAdmins.map((admin, index) => (
              <li key={index} className="admin-item">
                <div className="admin-avatar">
                  {admin.name?.charAt(0).toUpperCase()}
                </div>
                <div className="admin-info">
                  <span className="admin-name">{admin.name}</span>
                  <span className="admin-email">
                    {admin.email || admin.specialId || "No Email"}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="no-admins">
            <FaUsers size={40} />
            <p>No admins found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RegisterAdmin;
