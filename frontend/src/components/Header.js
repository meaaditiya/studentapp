import React, { useEffect, useState } from "react";
import { useNavigate,Link } from "react-router-dom";
import { FaOdnoklassnikiSquare } from 'react-icons/fa';
import { FiRefreshCw } from "react-icons/fi";
// You can choose any other icon as needed
import '../ComponentCSS/Header.css';
import { AiOutlineCalendar, AiOutlineTable } from 'react-icons/ai';
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

  return (
    <header className="header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px' }}>
      <div className="header-buttons">
        <button className="menu-toggle" title="Menu toggle" onClick={toggleSidebar}>
          |||
        </button>
        <button className="navigate-back" title="navigate back" onClick={handleNavigateBack}>
          ← Back
        </button>
        <button onClick={refreshPage} className="refresh-button" title="refresh page">
        <FiRefreshCw size={24} /> {/* Refresh icon with size */}
      </button>
      </div>
      <h1 style={{ display: 'flex', alignItems: 'center', margin: 0 }}>
  <a href="/dashboard" style={{ textDecoration: 'none', color: 'white' }} className="logo">
    <FaOdnoklassnikiSquare size={40} style={{ marginRight: '10px', color: 'white' }} />
  </a>
PERSONAL DIARY 
</h1>

     
     
    </header>
  );
}


export default Header;
