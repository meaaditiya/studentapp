import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faHome, 
  faCalendar, 
  faStickyNote, 
  faTable, 
  faChartBar, 
  faClock, 
  faGraduationCap, 
  faCalculator, 
  faUserCheck, 
  faBook, 
  faFilePdf, 
  faVideo 
} from '@fortawesome/free-solid-svg-icons'; 
import { AiOutlineCalendar, AiOutlineTable } from 'react-icons/ai';

const Sidebar = ({ isVisible }) => {
  return (
    <div className={`sidebar ${isVisible ? 'open' : 'hidden'}`}>
      <ul className="sidebar-list">
        <li>
          <a href="/dashboard">
            <FontAwesomeIcon icon={faHome} /> Dashboard
          </a>
        </li>
        <li>
          <a href="/schedule">
            <FontAwesomeIcon icon={faCalendar} /> Daily Schedule
          </a>
        </li>
        <li>
          <a href="/notes">
            <FontAwesomeIcon icon={faStickyNote} /> Notes
          </a>
        </li>
        <li>
          <a href="/timetable">
            <FontAwesomeIcon icon={faTable} /> Weekly Timetable
          </a>
        </li>
        <li>
          <a href="/progress">
            <FontAwesomeIcon icon={faChartBar} /> Progress Tracker
          </a>
        </li>
        <li>
          <a href="/timer">
            <FontAwesomeIcon icon={faClock} /> Timer
          </a>
        </li>
        <li>
          <a href="/mymarks">
            <FontAwesomeIcon icon={faGraduationCap} /> My Marks
          </a>
        </li>
        <li>
          <a href="/cgpacalculator">
            <FontAwesomeIcon icon={faCalculator} /> CGPA Calculator
          </a>
        </li>
        <li>
          <a href="/attendancemanager">
            <FontAwesomeIcon icon={faUserCheck} /> Attendance Calculator
          </a>
        </li>
        <li>
          <a href="/markattendance">
            <FontAwesomeIcon icon={faBook} /> Mark Attendance
          </a>
        </li>
        <li>
          <a href="/pdfmanager">
            <FontAwesomeIcon icon={faFilePdf} /> Document Manager
          </a>
        </li>
        <li>
          <a href="/youtubeembed">
            <FontAwesomeIcon icon={faVideo} /> YouTube Videos
          </a>
        </li>
        <li>
          <a href="/exceltables">
            <AiOutlineTable /> Excel Tables
          </a>
        </li>
        <li>
          <a href="/calendarcomponent">
            <AiOutlineCalendar /> Calendar
          </a>
        </li>
        <li>
          <a href="/dsalists">
            <AiOutlineCalendar /> DSA List
          </a>
        </li>
        <li> <br></br>
        <br></br>
<br></br>        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
