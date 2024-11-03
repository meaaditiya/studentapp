import React, { useEffect, useState } from "react";
import { useTheme } from "../components/ThemeContext"; // Adjust the import path for useTheme
import { FaUserGraduate, FaSchool } from 'react-icons/fa'; // Importing suitable icons
import { SiReact } from 'react-icons/si'; // Importing React icon

function Header({ toggleSidebar }) {
  const { changeTheme } = useTheme();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px' }}>
      <div className="logo-left" style={{ display: 'flex', alignItems: 'center' }}>
        <FaSchool size={40} /> {/* School icon on the left */}
      </div>
      <button className="menu-toggle" onClick={toggleSidebar}>
        |||
      </button>
      <h1 style={{ margin: 0, fontSize: '2rem', display: 'flex', alignItems: 'center' }}>
        <span style={{ marginRight: '10px' }}>Student Management System</span>
        <FaUserGraduate size={50} /> {/* Graduate icon next to the heading */}
      </h1>
      <div className="clock" style={{ marginLeft: '20px' }}>{time.toLocaleTimeString()}</div>
      <div className="theme-selection">
        <button onClick={() => changeTheme("light")}>Light</button>
        <button onClick={() => changeTheme("dark")}>Dark</button>
        <button onClick={() => changeTheme("blue")}>Blue</button>
        <button onClick={() => changeTheme("green")}>Green</button>
        <button onClick={() => changeTheme("red")}>Red</button>
      </div>
      <div className="logo-right" style={{ display: 'flex', alignItems: 'center' }}>
        <SiReact size={40} /> {/* React logo on the right */}
      </div>
    </header>
  );
}

export default Header;
