import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../images/gnet-logo.jpg';
import robot from '../images/robot-icon.png';
import welcome from '../images/welcome.jpg';
import welcomeGif from '../images/wel.gif';
import './Welcomescree.css';

const Welcomescree = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Auto redirect to user dashboard after 3 seconds
    const timer = setTimeout(() => {
      navigate('/user-dashboard');
    }, 3000);

    // Cleanup timer on component unmount
    return () => clearTimeout(timer);
  }, [navigate]);

  const handleGetStarted = () => {
    navigate('/user-dashboard');
  };

  return (
    <div className="welcome-container">
      {/* Header Section with Logo */}
      <div className="welcome-header">
        <div className="logo-container">
          <img src={logo} alt="Company Logo" className="logo" />
          <img src={robot} alt="Flying Robot" className="robot" />
        </div>
        
        <div className="welcome-text">
          <h1 className="animated-title">Infun India</h1>
          <p className="animated-subtitle">Welcome to Chat System</p>
        </div>
      </div>

      {/* Main Content with Animated Image */}
      <div className="welcome-content">
        <div className="welcome-image">
          <img src={welcome} alt="Welcome Animation" className="welcome-img" />
        </div>
        
        {/* GIF Animation */}
        <div className="gif-container">
          <img 
            src={welcomeGif} 
            alt="Welcome GIF Animation" 
            className="welcome-gif"
            autoPlay
          />
        </div>
      </div>
    </div>
  );
};

export default Welcomescree;