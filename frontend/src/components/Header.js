import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaOdnoklassnikiSquare } from 'react-icons/fa';
import { FiRefreshCw, FiMenu, FiArrowLeft } from "react-icons/fi";
import '../ComponentCSS/Header.css';

function Header({ toggleSidebar }) {
  const [time, setTime] = useState(new Date());
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleNavigateBack = () => {
    navigate(-1);
  };

  const refreshPage = () => {
    window.location.reload();
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  return (
    <header className="modern-header">
      <div className="header-left">
        <button 
          className="icon-button menu-button" 
          onClick={toggleSidebar}
          aria-label="Toggle Menu"
        >
          <FiMenu />
        </button>
        
        <button 
          className="icon-button back-button" 
          onClick={handleNavigateBack}
          aria-label="Go Back"
        >
          <FiArrowLeft />
          <span>Back</span>
        </button>

        <button 
          className="icon-button refresh-button" 
          onClick={refreshPage}
          aria-label="Refresh Page"
        >
          <FiRefreshCw />
        </button>
      </div>

      <div className="header-center">
        <Link to="/dashboard" className="logo-link">
          <FaOdnoklassnikiSquare className="logo-icon" />
          <h1>PERSONAL DIARY</h1>
        </Link>
      </div>

      <div className="header-right">
        <div className="clock">
          {formatTime(time)}
        </div>
      </div>
    </header>
  );
}

export default Header;