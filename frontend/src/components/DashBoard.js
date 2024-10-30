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
    position: 'relative', // Relative position for absolute title placement
  };

  const titleStyle = {
    position: 'absolute', // Fixed title
    top: '20px', // Adjust vertical position
    left: '50%',
    transform: 'translateX(-50%)', // Center the title horizontally
    fontSize: '3rem', // Adjust font size as needed
    fontWeight: 'bold',
    textTransform: 'uppercase', // Make text uppercase
    zIndex: 10, // Ensure it stays on top
    backgroundImage: 'linear-gradient(270deg, #FF512F, #F09819, #4CAF50, #2196F3)', // Gradient colors
    backgroundSize: '400% 400%', // To animate the gradient
    WebkitBackgroundClip: 'text', // Clip background to text
    WebkitTextFillColor: 'transparent', // Make text transparent to show the gradient
    animation: 'vibrantColor 5s ease infinite', // Animation for vibrant color change
  };

  return (
    <div className="dashboard" style={dashboardStyle}>
      <h1 style={titleStyle}>Welcome to Student Manager</h1>
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
