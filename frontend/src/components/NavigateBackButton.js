// NavigateBackButton.js
import React from 'react';
import { useNavigate } from 'react-router-dom';

const NavigateBackButton = () => {
  const navigate = useNavigate();

  const handleNavigateBack = () => {
    navigate(-1); // Navigates to the previous page
  };

  return (
    <button className="navigate-back-button" onClick={handleNavigateBack}>
      Go Back
    </button>
  );
};

export default NavigateBackButton;
