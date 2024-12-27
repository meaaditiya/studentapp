import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { AiOutlinePlus, AiOutlineDelete, AiOutlineLink } from "react-icons/ai";
import "../ComponentCSS/Dashboard.css";

const Dashboard = () => {
  const [links, setLinks] = useState([]);
  const [linkName, setLinkName] = useState("");
  const [linkURL, setLinkURL] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const API_BASE_URL = "http://192.168.1.41:5000/api/quick-links";

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
                  className="add-link-button"
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
          <Link to="/markattendance" className="box">
            <div className="box-content">
              <p className="box-text">Attendance</p>
            </div>
          </Link>
          <Link to="/mymarks" className="box">
            <div className="box-content">
              <p className="box-text">My Marks</p>
            </div>
          </Link>
          <Link to="/timer" className="box">
            <div className="box-content">
              <p className="box-text">Timer</p>
            </div>
          </Link>
          <Link to="/newsubject" className="box">
            <div className="box-content">
              <p className="box-text">Exam Preparation</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
