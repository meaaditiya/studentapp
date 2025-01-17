import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { AiOutlinePlus, AiOutlineDelete, AiOutlineLink } from "react-icons/ai";
import "../ComponentCSS/Dashboard.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faClock, 
  faGraduationCap, 
  faPencilAlt,
  faDatabase,
  faWeight
} from '@fortawesome/free-solid-svg-icons'; 
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

  const API_BASE_URL = "https://studentapp-backend-ccks.onrender.com/api/quick-links";
  const TASKS_API_URL = "https://studentapp-backend-ccks.onrender.com/tasks";

  useEffect(() => {
    const fetchLinks = async () => {
      try {
        const response = await fetch(API_BASE_URL);
        if (!response.ok) {
          throw new Error("Failed to fetch quick links");
        }
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

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await fetch(TASKS_API_URL);
        if (!response.ok) {
          throw new Error("Failed to fetch tasks");
        }
        const data = await response.json();
        setTasks(data);
      } catch (error) {
        setTasksError("Failed to load today's tasks");
      }
    };

    fetchTasks();
  }, []);

  const handleAddLink = async (e) => {
    e.preventDefault();
    if (linkName && linkURL) {
      try {
        const response = await fetch(API_BASE_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name: linkName, url: linkURL }),
        });
        if (!response.ok) {
          throw new Error("Failed to add quick link");
        }
        const newLink = await response.json();
        setLinks([...links, newLink]);
        setLinkName("");
        setLinkURL("");
        setShowForm(false);
      } catch (error) {
        setError(error.message);
      }
    }
  };

  const handleDeleteLink = async (id) => {
    try {
      await fetch(`${API_BASE_URL}/${id}`, {
        method: "DELETE",
      });
      setLinks(links.filter((link) => link._id !== id));
    } catch (error) {
      setError("Failed to delete quick link");
    }
  };

  useEffect(() => {
    const updateTimeAndDate = () => {
      const now = new Date();
      const options = { weekday: "long", year: "numeric", month: "long", day: "numeric" };
      document.getElementById("time").textContent = now.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
      document.getElementById("date").textContent = now.toLocaleDateString(undefined, options);
    };

    const fetchWeather = async (latitude, longitude) => {
      try {
        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`
        );
        if (!response.ok) throw new Error("Failed to fetch weather data");
        const data = await response.json();
        setWeather(
          `Temp: ${data.current_weather.temperature}°C, Condition: ${data.current_weather.weathercode}`
        );
      } catch {
        setWeather("Weather unavailable");
      }
    };

    const getLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            fetchWeather(latitude, longitude);
          },
          () => {
            setLocationError("Unable to retrieve your location");
          }
        );
      } else {
        setLocationError("Geolocation is not supported by this browser");
      }
    };

    updateTimeAndDate();
    getLocation();
    const interval = setInterval(updateTimeAndDate, 60000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="dashboard-layout">
      {/* Simple Text at the Top */}
      <div className="top-text">Welcome to Your Dashboard</div>

      {/* Main Content */}
      <div className="dashboard-content">
        {/* Quick Links */}
        <div className="quick-links-snippet">
          <h2 className="snippet-title">Quick Links</h2>
          {loading ? (
            <div>Loading quick links...</div>
          ) : (
            <div className="quick-links-container">
              {links.map((link) => (
                <div key={link._id} className="quick-link-item">
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="quick-link-icon"
                  >
                    <AiOutlineLink />
                  </a>
                  <span className="quick-link-text">{link.name}</span>
                  <AiOutlineDelete
                    className="delete-icon"
                    onClick={() => handleDeleteLink(link._id)}
                  />
                </div>
              ))}
              <div className="add-quick-link">
                <button
                  className="add-link-button" title="Add a new link"
                  onClick={() => setShowForm(!showForm)}
                >
                  <AiOutlinePlus />
                </button>
                {showForm && (
                  <div className="add-link-form">
                    <input
                      type="text"
                      placeholder="Link Name"
                      value={linkName}
                      onChange={(e) => setLinkName(e.target.value)}
                    />
                    <input
                      type="url"
                      placeholder="Link URL"
                      value={linkURL}
                      onChange={(e) => setLinkURL(e.target.value)}
                    />
                    <button className="submit-link-button" onClick={handleAddLink}>
                      Add
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
          {error && <div className="error-message">{error}</div>}
        </div>

        {/* Feature Grid */}
        <div className="grid-container">
          <Link to="/weightlosstracker" className="box">
            <div className="box-content">
              <p className="box-text"><FontAwesomeIcon icon={faWeight} /> Weight Tracker </p>
            </div>
          </Link>
          <Link to="/mymarks" className="box">
            <div className="box-content">
              <p className="box-text"><FontAwesomeIcon icon={faGraduationCap} /> Marks</p>
            </div>
          </Link>
          <Link to="/timer" className="box">
            <div className="box-content">
              <p className="box-text"><FontAwesomeIcon icon={faClock} /> Timer</p>
            </div>
          </Link>
          <Link to="/newsubject" className="box">
            <div className="box-content">
              <p className="box-text"><FontAwesomeIcon icon={faPencilAlt}/> Exam Planner</p>
            </div>
          </Link>
          <Link to="/internalmarks" className="box">
            <div className="box-content">
              <p className="box-text"><FontAwesomeIcon icon={faDatabase}/> Internal Marks</p>
            </div>
          </Link>
         
        </div>
      </div>

      {/* Clock and Weather Box */}
      <div className="clock-weather-box">
        <div className="clock-content">
          <div className="time" id="time">Loading time...</div>
          <div className="date" id="date">Loading date...</div>
          <div className="weather">{weather}</div>
          {locationError && <div className="location-error">{locationError}</div>}
        </div>

        {/* Today's Tasks */}
        <div className="todays-tasks">
          <h3 className="tasks-heading">Today's Tasks</h3>
          {tasksError ? (
            <div className="error-message">{tasksError}</div>
          ) : tasks.length > 0 ? (
            <div className="tasks-slider">
              <div className="tasks-track">
                {tasks.map((task, index) => (
                  <span key={index} className="task-item">
                    {task.text}
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <div>No tasks for today</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
