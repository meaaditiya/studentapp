import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { AiOutlinePlus, AiOutlineDelete, AiOutlineLink } from "react-icons/ai";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faClock, 
  faGraduationCap, 
  faPencilAlt,
  faDatabase,
  faWeight,
  faCalculator,
  faCheckCircle,
  faTimesCircle,
  faChevronLeft,
  faChevronRight
} from '@fortawesome/free-solid-svg-icons';
import '../ComponentCSS/Dashboard.css';
import { MdCalculate } from "react-icons/md";

const Dashboard = () => {
  const [links, setLinks] = useState([]);
  const [linkName, setLinkName] = useState("");
  const [linkURL, setLinkURL] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [weather, setWeather] = useState("Loading weather...");
  const [locationError, setLocationError] = useState("");
  const [tasks, setTasks] = useState([]);
  const [tasksError, setTasksError] = useState("");
 
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Enhanced task navigation with smooth transitions
  const handleNextTask = () => {
    if (isTransitioning || !tasks.length) return;
    setIsTransitioning(true);
    setCurrentTaskIndex((prev) => (prev === tasks.length - 1 ? 0 : prev + 1));
    setTimeout(() => setIsTransitioning(false), 300);
  };

  const handlePrevTask = () => {
    if (isTransitioning || !tasks.length) return;
    setIsTransitioning(true);
    setCurrentTaskIndex((prev) => (prev === 0 ? tasks.length - 1 : prev - 1));
    setTimeout(() => setIsTransitioning(false), 300);
  };

  // New function to handle task completion toggle
  const handleTaskCompletion = async (taskId, completed) => {
    try {
      const response = await fetch(`${TASKS_API_URL}/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          completed: !completed,
          lastUpdated: new Date().toLocaleString()
        })
      });
      
      if (!response.ok) throw new Error('Failed to update task');
      
      setTasks(tasks.map(task => 
        task._id === taskId 
          ? { ...task, completed: !completed, lastUpdated: new Date().toLocaleString() }
          : task
      ));
    } catch (error) {
      setTasksError('Failed to update task status');
    }
  };

  // API endpoints
  const API_BASE_URL = "https://personalstudentdiary.onrender.com/api/quick-links";
  const TASKS_API_URL = "https://personalstudentdiary.onrender.com/tasks";

  // Fetch quick links
  useEffect(() => {
    const fetchLinks = async () => {
      try {
        const response = await fetch(API_BASE_URL);
        if (!response.ok) throw new Error("Failed to fetch quick links");
        const data = await response.json();
        setLinks(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchLinks();
  }, []);

  // Fetch tasks
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await fetch(TASKS_API_URL);
        if (!response.ok) throw new Error("Failed to fetch tasks");
        const data = await response.json();
        setTasks(data);
      } catch (error) {
        setTasksError("Failed to load today's tasks");
      }
    };
    fetchTasks();
  }, []);

  // Handle quick link operations
  const handleAddLink = async (e) => {
    e.preventDefault();
    if (!linkName || !linkURL) return;

    try {
      const response = await fetch(API_BASE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: linkName, url: linkURL }),
      });
      if (!response.ok) throw new Error("Failed to add quick link");
      const newLink = await response.json();
      setLinks([...links, newLink]);
      setLinkName("");
      setLinkURL("");
      setShowForm(false);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleDeleteLink = async (id) => {
    try {
      await fetch(`${API_BASE_URL}/${id}`, { method: "DELETE" });
      setLinks(links.filter((link) => link._id !== id));
    } catch (error) {
      setError("Failed to delete quick link");
    }
  };

  // Clock and weather updates
  useEffect(() => {
    const updateTimeAndDate = () => {
      const now = new Date();
      const timeElement = document.getElementById("time");
      const dateElement = document.getElementById("date");
      
      if (timeElement && dateElement) {
        timeElement.textContent = now.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });
        dateElement.textContent = now.toLocaleDateString(undefined, {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric"
        });
      }
    };

    const getWeather = async (position) => {
      try {
        const { latitude, longitude } = position.coords;
        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`
        );
        if (!response.ok) throw new Error();
        const data = await response.json();
        setWeather(`${data.current_weather.temperature}°C`);
      } catch {
        setWeather("Weather unavailable");
      }
    };

    const handleLocationError = () => setLocationError("Location unavailable");

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(getWeather, handleLocationError);
    }

    updateTimeAndDate();
    const interval = setInterval(updateTimeAndDate, 60000);
    return () => clearInterval(interval);
  }, []);

  // Feature cards data
  const featureCards = [
    { to: "/weightlosstracker", icon: faWeight, text: "Weight Tracker" },
    { to: "/mymarks", icon: faGraduationCap, text: "Marks" },
    { to: "/timer", icon: faClock, text: "Timer" },
    { to: "/newsubject", icon: faPencilAlt, text: "Exam Planner" },
    { to: "/internalmarks", icon: faDatabase, text: "Internal Marks" },
    { to: "/newjs",icon: faCalculator, text:"Calculator"}
  ];

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Welcome Back!</h1>
        <div className="time-weather">
          <div className="time-display">
            <div id="time" className="time"></div>
            <div id="date" className="date"></div>
          </div>
          <div className="weather-display">
            {weather}
            {locationError && <div className="error-text">{locationError}</div>}
          </div>
        </div>
      </header>

      <main className="dashboard-main">
        {/* Quick Access Grid */}
        <section className="feature-grid">
          {featureCards.map((card, index) => (
            <Link to={card.to} className="feature-card" key={index}>
              <FontAwesomeIcon icon={card.icon} className="card-icon" />
              <span>{card.text}</span>
            </Link>
          ))}
        </section>

        {/* Quick Links Section */}
        <section className="quick-links">
          <div className="section-header">
            <h2>Quick Links</h2>
            <button 
              className="add-button"
              onClick={() => setShowForm(!showForm)}
              aria-label="Add new link"
            >
              +
            </button>
          </div>

          {showForm && (
            <form className="link-form" onSubmit={handleAddLink}>
              <input
                type="text"
                placeholder="Link Name"
                value={linkName}
                onChange={(e) => setLinkName(e.target.value)}
                required
              />
              <input
                type="url"
                placeholder="URL (https://...)"
                value={linkURL}
                onChange={(e) => setLinkURL(e.target.value)}
                required
              />
              <button className="addlink" type="submit">Add Link</button>
            </form>
          )}

          {loading ? (
            <div className="loading">Loading links...</div>
          ) : (
            <div className="links-grid">
              {links.map((link) => (
                <div key={link._id} className="link-card">
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link-content"
                  >
                    <AiOutlineLink className="link-icon" />
                    <span>{link.name}</span>
                  </a>
                  <button
                    className="delete-button"
                    onClick={() => handleDeleteLink(link._id)}
                    aria-label="Delete link"
                  >
                    <AiOutlineDelete />
                  </button>
                </div>
              ))}
            </div>
          )}
          {error && <div className="error-text">{error}</div>}
        </section>

        {/* Tasks Section */}
        <div className="tasks-section">
        <h2>Today's Tasks</h2>
        {tasks.length > 0 ? (
          <div className="tasks-carousel">
            <button 
              className="carousel-nav-button prev"
              onClick={handlePrevTask}
              disabled={isTransitioning}
            >
              <FontAwesomeIcon icon={faChevronLeft} />
            </button>

            <div className="tasks-slider">
              <div className={`task-card ${isTransitioning ? 'transitioning' : ''}`}>
                <div className="task-header">
                  <h3>Task {currentTaskIndex + 1}/{tasks.length}</h3>
                  <button
                    className={`completion-toggle ${tasks[currentTaskIndex].completed ? 'completed' : ''}`}
                    onClick={() => handleTaskCompletion(
                      tasks[currentTaskIndex]._id,
                      tasks[currentTaskIndex].completed
                    )}
                  >
                    <FontAwesomeIcon 
                      icon={tasks[currentTaskIndex].completed ? faCheckCircle : faTimesCircle}
                    />
                  </button>
                </div>
                <div className="task-content">
                  <p>{tasks[currentTaskIndex].text}</p>
                </div>
                <div className="task-footer">
                  <span className="last-updated">
                    Last updated: {tasks[currentTaskIndex].lastUpdated}
                  </span>
                  <span className={`status-badge ${tasks[currentTaskIndex].completed ? 'completed' : 'pending'}`}>
                    {tasks[currentTaskIndex].completed ? 'Completed' : 'Pending'}
                  </span>
                </div>
              </div>
            </div>

            <button 
              className="carousel-nav-button next"
              onClick={handleNextTask}
              disabled={isTransitioning}
            >
              <FontAwesomeIcon icon={faChevronRight} />
            </button>

            <div className="carousel-dots">
              {tasks.map((_, index) => (
                <button
                  key={index}
                  className={`dot ${index === currentTaskIndex ? 'active' : ''}`}
                  onClick={() => {
                    setIsTransitioning(true);
                    setCurrentTaskIndex(index);
                    setTimeout(() => setIsTransitioning(false), 300);
                  }}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="no-tasks">No tasks for today</div>
        )}
        {tasksError && <div className="error-text">{tasksError}</div>}
      </div>
      </main>
    </div>
  );
};

export default Dashboard;