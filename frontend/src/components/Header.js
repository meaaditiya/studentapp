import React, { useEffect, useState } from "react";

function Header({ toggleSidebar }) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="header">
      <button className="menu-toggle" onClick={toggleSidebar}>
       |||
      </button>
      <h1>Student Management System</h1>
      <div className="clock">{time.toLocaleTimeString()}</div>
    </header>
  );
}

export default Header;
