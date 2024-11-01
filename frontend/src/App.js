import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import './App.css';
import Dashboard from './components/DashBoard';
import Sidebar from './components/Sidebar';
import DailySchedule from './components/DailySchedule';
import Notes from './components/Notes';
import WeeklyTimetable from './components/WeeklyTimetable';
import ProgressTracker from './components/ProgressTracker';
import Timer from './components/Timer';
import MyMarks from './components/MyMarks';
import Header from './components/Header';
import CGPACalculator from './components/CGPACalculator';
import AttendanceManager from "./components/AttendanceManager";
import MarkAttendance from "./components/MarkAttendance";
import PDFManager from "./components/PDFManager";
function App() {
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarVisible((prev) => !prev);
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsSidebarVisible(false); // Hide sidebar on smaller screens
      } else {
        setIsSidebarVisible(true); // Show sidebar on larger screens
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize(); // Check initial size

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <Router>
      <div className="app">
        <Header toggleSidebar={toggleSidebar} />
        <div className={`main-layout ${isSidebarVisible ? '' : 'sidebar-hidden'}`}>
          <Sidebar isVisible={isSidebarVisible} />
          <main className="content">
            <Routes>
              <Route path="/" element={<Navigate to="/Dashboard" />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/schedule" element={<DailySchedule />} />
              <Route path="/notes" element={<Notes />} />
              <Route path="/timetable" element={<WeeklyTimetable />} />
              <Route path="/progress" element={<ProgressTracker />} />
              <Route path="/timer" element={<Timer />} />
              <Route path="/mymarks" element={<MyMarks />} />
              <Route path="/cgpacalculator" element={<CGPACalculator />} />
              <Route path="/attendancemanager" element={<AttendanceManager />} />
              <Route path="/markattendance" element={<MarkAttendance />} />
              <Route path="/pdfmanager" element={<PDFManager/>}/>
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;