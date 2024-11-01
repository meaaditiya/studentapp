import React from 'react';
// Ensure you're importing your CSS

const Sidebar = ({ isVisible }) => {
  return (
    <div className={`sidebar ${isVisible ? 'open' : 'hidden'}`}>
      <ul>
        <li><a href="/dashboard">Dashboard</a></li>
        <li><a href="/schedule">Daily Schedule</a></li>
        <li><a href="/notes">Notes</a></li>
        <li><a href="/timetable">Weekly Timetable</a></li>
        <li><a href="/progress">Progress Tracker</a></li>
        <li><a href="/timer">Timer</a></li>
        <li><a href="/mymarks">My Marks</a></li>
        <li><a href="/cgpacalculator">CGPA Calculator</a></li>
        <li><a href="/attendancemanager">Attendance Manager</a></li>
        <li><a href ="/markattendance">Mark Attendance</a></li>
      </ul>
    </div>
  );
};

export default Sidebar;