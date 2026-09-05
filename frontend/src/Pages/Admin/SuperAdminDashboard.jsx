import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUserPlus, FaUsers, FaUserCog, FaChartLine, FaCog, FaSignOutAlt } from 'react-icons/fa';
import './admin.css';

const SuperAdminDashboard = () => {
  const navigate = useNavigate();

  const tiles = [
    { 
      title: 'Add Admin', 
      icon: <FaUserPlus className="tile-icon" />,
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      action: () => navigate('/register-admin')
    },
    { 
      title: 'View Groups', 
      icon: <FaUsers className="tile-icon" />,
      gradient: 'linear-gradient(135deg, #a6c1ee 0%, #fbc2eb 100%)',
      action: () => navigate('/view-groups')
    },
    { 
      title: 'Profile', 
      icon: <FaUserCog className="tile-icon" />,
      gradient: 'linear-gradient(135deg, #ff9a9e 0%, #fad0c4 100%)',
      action: () => navigate('/profile')
    },
    { 
      title: 'View Users', 
      icon: <FaChartLine className="tile-icon" />,
      gradient: 'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)',
      action: () => navigate('/view-users')
    },
    // { 
    //   title: 'Settings', 
    //   icon: <FaCog className="tile-icon" />,
    //   gradient: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
    //   action: () => navigate('/settings')
    // },
    // { 
    //   title: 'Logout', 
    //   icon: <FaSignOutAlt className="tile-icon" />,
    //   gradient: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
    //   action: () => {
    //     sessionStorage.clear();
    //     navigate('/');
    //   }
    // }
  ];

  return (
    <div className="super-admin-dashboard">
      <div className="dashboard-header">
        <h1>Super Admin Portal</h1>
        <p>Manage your administration with ease</p>
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

export default SuperAdminDashboard;