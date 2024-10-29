// Dashboard.js
import React from 'react';
import { Link } from 'react-router-dom'; // Import Link from react-router-dom
import backgroundImage from '../aadiimage.jpeg'; // Adjust the path as necessary
import backgroundImage2 from '../aadiimage2.png';
import backgroundImage3 from '../aadiimage3.jpg';
import backgroundImage4 from '../aadiimage4.jpg';

const Dashboard = () => {
  const dashboardStyle = {
    height: '100vh', // Full viewport height
    backgroundImage: `url(${backgroundImage})`, // Use the imported image
    backgroundSize: 'cover', // Cover the entire background
    backgroundAttachment: 'fixed',
    backgroundPosition: 'center', // Center the image
    color: 'white', // Change text color if needed
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
  };

  return (
    <div className="dashboard" style={dashboardStyle}>
      <div className="grid-container">
        <Link to="/attendancemanager" className="box"> {/* Make the entire box clickable */}
          <img src={backgroundImage3} alt="Attendance Manager" className="box-image" />
          <p className="box-text">Attendance Manager</p>
        </Link>
        <Link to="/cgpacalculator" className="box"> {/* Make the entire box clickable */}
          <img src={backgroundImage2} alt="CGPA Calculator" className="box-image" />
          <p className="box-text">CGPA Calculator</p>
        </Link>
        <Link to="/timer" className="box"> {/* Make the entire box clickable */}
          <img src={backgroundImage4} alt="Timer" className="box-image" />
          <p className="box-text">Timer</p>
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;
