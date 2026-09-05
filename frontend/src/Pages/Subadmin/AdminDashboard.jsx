import React from "react";
import { useNavigate } from "react-router-dom";
import {
  FaUsers,
  FaUserCog,
  FaChartLine,
  FaExclamationTriangle,
  FaMoneyBillWave
} from "react-icons/fa";
import logo from '../../images/Infun-logo.png';
import "../Admin/admin.css";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const userName = sessionStorage.getItem('userName') || 'Admin';

  const getAvatarLetter = () => {
    return userName.charAt(0).toUpperCase();
  };

  const tiles = [
    {
      title: "Payment Requests",
      icon: <FaMoneyBillWave className="tile-icon" />,
      gradient: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
      action: () => navigate("/payment-requests"),
    },
    {
      title: "View Groups",
      icon: <FaUsers className="tile-icon" />,
      gradient: "linear-gradient(135deg, #a6c1ee 0%, #fbc2eb 100%)",
      action: () => navigate("/create-group"),
    },
    {
      title: "View Users",
      icon: <FaChartLine className="tile-icon" />,
      gradient: "linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)",
      action: () => navigate("/add-users"),
    },
    {
      title: "Complaints",
      icon: <FaExclamationTriangle className="tile-icon" />,
      gradient: "linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)",
      action: () => navigate("/complaints"),
    },
    {
      title: "Profile",
      icon: <FaUserCog className="tile-icon" />,
      gradient: "linear-gradient(135deg, #ff9a9e 0%, #fad0c4 100%)",
      action: () => navigate("/profile"),
    },
  ];

  return (
    <div className="super-admin-dashboard">
      <div className="dashboard-header">
        <div className="header-left">
          <img src={logo} alt="Infun India Logo" className="header-logo" />
        </div>
        <div className="header-right">
          <div className="user-avatar">
            <span className="avatar-letter">{getAvatarLetter()}</span>
          </div>
        </div>
      </div>

      <div className="welcome-section">
        <h1>Admin Portal</h1>
        <p>Manage your administration and user approvals with ease</p>
      </div>

      <div className="dashboard-tiles">
        {tiles.map((tile, index) => (
          <div
            key={index}
            className="dashboard-tile"
            onClick={tile.action}
            style={{ background: tile.gradient }}
          >
            <div className="tile-content">
              {tile.icon}
              <h3>{tile.title}</h3>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;