import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { AiOutlinePlus, AiOutlineDelete, AiOutlineLink } from "react-icons/ai";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faClock, 
  faGraduationCap, 
  faPencilAlt,
  faDatabase,
  faWeight
} from '@fortawesome/free-solid-svg-icons';
import '../ComponentCSS/Dashboard.css';

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
    { to: "/internalmarks", icon: faDatabase, text: "Internal Marks" }
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
        <section className="tasks-section">
  <h2>Today's Tasks</h2>
  {tasksError ? (
    <div className="error-text">{tasksError}</div>
  ) : tasks.length > 0 ? (
    <div className="tasks-slider">
      <div className="tasks-track">
        {[...tasks, ...tasks].map((task, index) => (
          <div key={index} className="task-item">
            {task.text}
          </div>
        ))}
      </div>
    </div>
  ) : (
    <div className="no-tasks">No tasks for today</div>
  )}
</section>
      </main>
    </div>
  );
};

export default Dashboard;