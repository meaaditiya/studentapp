import React, { useEffect, useState } from "react";
import { useTheme } from "../components/ThemeContext"; // Adjust the import path for useTheme

function Header({ toggleSidebar }) {
  const { changeTheme } = useTheme();
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
      <div className="theme-selection">
        <button onClick={() => changeTheme("light")}>Light</button>
        <button onClick={() => changeTheme("dark")}>Dark</button>
        <button onClick={() => changeTheme("blue")}>Blue</button>
        <button onClick={() => changeTheme("green")}>Green</button>
        <button onClick={() => changeTheme("red")}>Red</button>
      </div>
    </header>
  );
}

export default Header;
