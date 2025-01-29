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
import PDFManager from "./components/PDFManager";
import Loading from './components/Loading';
import YouTubeEmbed from "./components/YouTubeEmbed";
import ExcelTables from "./components/ExcelTables";
import CalendarComponent from './components/CalendarComponent';
import DSALists from "./components/DSALists";
import NewSubject from "./components/NewSubject";
import InternalMarks from "./components/InternalMarks";
import WeightLossTracker from "./components/WeightLossTracker";
import Newjs from "./components/Newjs";



const App = () => {
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [hasDashboardLoadedOnce, setHasDashboardLoadedOnce] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarVisible((prev) => !prev);
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsSidebarVisible(false);
      } else {
        setIsSidebarVisible(true);
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    const currentPath = window.location.pathname;

    if ((currentPath === '/' || currentPath === '/dashboard') && !hasDashboardLoadedOnce) {
      const timer = setTimeout(() => {
        setIsLoading(false);
        setHasDashboardLoadedOnce(true);
      }, 1000);

      return () => clearTimeout(timer);
    } else {
      setIsLoading(false);
    }
  }, [hasDashboardLoadedOnce]);

  const handleMainClick = () => {
    if (window.innerWidth < 768) {
      setIsSidebarVisible(false);
    }
  };
  return (
  
    <Router>
      <div className="app">
        <Header toggleSidebar={toggleSidebar} />
        <div className={`main-layout ${isSidebarVisible ? '' : 'sidebar-hidden'}`}>
          <Sidebar isVisible={isSidebarVisible} />
          <main className="content" onClick={handleMainClick}>
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" />} />
              <Route
                path="/dashboard"
                element={isLoading ? <Loading /> : <Dashboard />}
              />
              <Route path="/schedule" element={<DailySchedule />} />
              <Route path="/notes" element={<Notes />} />
              <Route path="/timetable" element={<WeeklyTimetable />} />
              <Route path="/progress" element={<ProgressTracker />} />
              <Route path="/timer" element={<Timer />} />
              <Route path="/mymarks" element={<MyMarks />} />
              <Route path="/cgpacalculator" element={<CGPACalculator />} />
              <Route path="/attendancemanager" element={<AttendanceManager />} />
              <Route path="/weightlosstracker" element={<WeightLossTracker />} />
              <Route path="/pdfmanager" element={<PDFManager />} />
              <Route path="/youtubeembed" element={<YouTubeEmbed />} />
              <Route path="/exceltables" element={<ExcelTables/>}/>
              <Route path="/calendarcomponent" element={<CalendarComponent/>}/>
              <Route path="/dsalists" element={<DSALists/>}/> 
              <Route path ="/newsubject" element={<NewSubject/>}/>
              <Route path="/internalmarks" element ={<InternalMarks/>}/>
              <Route path="/newjs" element ={<Newjs/>}/>
             
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
};

export default App;
