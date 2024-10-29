import React, { useState, useEffect } from "react";
import "./App.css";

function Header() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="header">
      <h1>Student Management System</h1>
      <div className="clock">
        <svg viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" stroke="#fca311" strokeWidth="2" fill="none" />
          <line x1="12" y1="12" x2="12" y2="6" stroke="#fca311" strokeWidth="2" />
          <line x1="12" y1="12" x2="16" y2="12" stroke="#fca311" strokeWidth="2" />
        </svg>
        <span className="clock-face">{time.toLocaleTimeString()}</span>
      </div>
    </header>
  );
}

export default Header;
