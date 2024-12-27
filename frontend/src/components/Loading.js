import React from 'react';
import aadiImage from '../aadiimage5.jpg'; // Adjust this path if needed
import '../ComponentCSS/Loading.css'
const Loading = () => {
  return (
    <div className="loading-container">
      <div className="blurred-background"></div>
      <div className="loading-popup">
        <h1 className="loading-text">Welcome to Personal Study Diary</h1>
        <div className="centered-image-container">
          <img src={aadiImage} alt="Loading" className="centered-image" />
        </div>
        <div className="loading-bar">
          <div className="loading-progress"></div>
        </div>
      </div>
    </div>
  );
};

export default Loading;
