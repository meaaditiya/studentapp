import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import backgroundImage from '../aadiimage.jpeg';
import backgroundImage2 from '../aadiimage2.png';
import backgroundImage3 from '../aadiimage3.jpg';
import backgroundImage4 from '../aadiimage4.jpg';

const Dashboard = () => {
  const [links, setLinks] = useState([]);
  const [linkName, setLinkName] = useState('');
  const [linkURL, setLinkURL] = useState('');
  const [showForm, setShowForm] = useState(false);

  const API_BASE_URL = 'http://localhost:5000/api/quick-links'; // Make sure this URL is correct for your backend

  // Fetch all quick links from the backend
  useEffect(() => {
    fetch(API_BASE_URL)
      .then(response => response.json())
      .then(data => setLinks(data))
      .catch(error => console.error('Error fetching quick links:', error));
  }, []);

  // Add a new quick link
  const handleAddLink = async (e) => {
    e.preventDefault();
    if (linkName && linkURL) {
      try {
        const response = await fetch(API_BASE_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name: linkName, url: linkURL }),
        });
        const newLink = await response.json();
        setLinks([...links, newLink]);
        setLinkName('');
        setLinkURL('');
        setShowForm(false);
      } catch (error) {
        console.error('Error adding quick link:', error);
      }
    }
  };

  // Delete a quick link
  const handleDeleteLink = async (id) => {
    try {
      await fetch(`${API_BASE_URL}/${id}`, {
        method: 'DELETE',
      });
      setLinks(links.filter(link => link._id !== id));
    } catch (error) {
      console.error('Error deleting quick link:', error);
    }
  };

  const dashboardStyle = {
    height: '100vh',
    backgroundImage: `url(${backgroundImage})`,
    backgroundSize: 'cover',
    backgroundAttachment: 'fixed',
    backgroundPosition: 'center',
    color: 'white',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
    padding: '20px',
    position: 'relative',
  };

  const titleStyle = {
    fontSize: '3rem',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    zIndex: 10,
    backgroundImage: 'linear-gradient(270deg, #FF512F, #F09819, #4CAF50, #2196F3)',
    backgroundSize: '400% 400%',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    animation: 'vibrantColor 5s ease infinite',
    marginTop: '20px',
  };

  return (
    <div className="dashboard" style={dashboardStyle}>
      <h1 style={titleStyle}>Welcome to Student Manager</h1>

      {/* Quick Links Display */}
      <div className="quick-links-container">
        {links.map((link) => (
          <div key={link._id} className="link-wrapper">
            <a
              href={link.url}
              className="circle-link"
              target="_blank"
              rel="noopener noreferrer"
            >
              {link.name}
            </a>
            <button onClick={() => handleDeleteLink(link._id)} className="quick-delete-button">X</button>
          </div>
        ))}

        {/* Add Shortcut Button in the Same Row */}
        <div className="add-shortcut-container">
          <div
            className="circle-link add-shortcut"
            onClick={() => setShowForm(!showForm)}
          >
            <span>+</span>
          </div>
          <p className="add-quick-links-text" style={{ color: 'black' }}>Add Quick Links</p>
        </div>
      </div>

      {/* Quick Links Form on Right Side */}
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
          <button onClick={handleAddLink}>Add Link</button>
        </div>
      )}

      {/* Grid Container */}
      <div className="grid-container">
        <Link to="/attendancemanager" className="box">
          <img src={backgroundImage3} alt="Attendance Manager" className="box-image" />
          <p className="box-text">Attendance Manager</p>
        </Link>
        <Link to="/cgpacalculator" className="box">
          <img src={backgroundImage2} alt="CGPA Calculator" className="box-image" />
          <p className="box-text">CGPA Calculator</p>
        </Link>
        <Link to="/timer" className="box">
          <img src={backgroundImage4} alt="Timer" className="box-image" />
          <p className="box-text">Timer</p>
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;
