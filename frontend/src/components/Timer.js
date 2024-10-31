import React, { useState, useEffect } from "react";

function Timer() {
  const [time, setTime] = useState(0); // time in seconds
  const [isActive, setIsActive] = useState(false);
  const [isCountdown, setIsCountdown] = useState(false);
  const [isPaused, setIsPaused] = useState(false); // For toggling between Pause and Resume
  const [inputTime, setInputTime] = useState({ hours: "", minutes: "", seconds: "" });

  // Total input time in seconds for countdown
  const totalTime = (parseInt(inputTime.hours || 0) * 3600) +
                    (parseInt(inputTime.minutes || 0) * 60) + 
                    parseInt(inputTime.seconds || 0);

  const progress = isCountdown && totalTime > 0 ? (time / totalTime) * 100 : 0;

  // Timer logic (countup or countdown)
  useEffect(() => {
    let interval = null;
    if (isActive && !isPaused) {
      interval = setInterval(() => {
        setTime((prevTime) => (isCountdown ? Math.max(prevTime - 1, 0) : prevTime + 1));
      }, 1000);
    }
    if (time === 0 && isCountdown) {
      clearInterval(interval); // Stop countdown at zero
      setIsActive(false);
    }
    return () => clearInterval(interval);
  }, [isActive, isPaused, time, isCountdown]);

  // Handle time input changes (empty fields should be allowed)
  const handleTimeChange = (e) => {
    const { name, value } = e.target;
    setInputTime((prev) => ({
      ...prev,
      [name]: value === "" ? "" : Math.max(0, parseInt(value)),
    }));
  };

  const handleStartPause = () => {
    if (!isActive) {
      // If the timer is not active, start it
      if (isCountdown) {
        const totalInputTime = totalTime;
        setTime(totalInputTime); // Set the time to the input time
      }
      setIsActive(true);
      setIsPaused(false); // Ensure timer is not paused when starting
    } else {
      // If the timer is already active, toggle between pause and resume
      setIsPaused(!isPaused);
    }
  };

  const resetTimer = () => {
    setIsActive(false);
    setIsPaused(false);
    setTime(0);
    setInputTime({ hours: "", minutes: "", seconds: "" });
  };

  return (
    <div className="full-screen-timer">
      <h2>{isCountdown ? "Countdown Timer" : "Countup Timer"}</h2>

      {/* Timer Type Toggle (conditionally rendered) */}
      {!isActive && (
        <div className="timer-type-toggle">
          <button onClick={() => setIsCountdown(false)}>Countup</button>
          <button onClick={() => setIsCountdown(true)}>Countdown</button>
        </div>
      )}

      {/* Time Input Fields for Countdown (conditionally rendered) */}
      {isCountdown && !isActive && (
        <div className="time-inputs">
          <label></label>
          <input
            type="number"
            name="hours"
            value={inputTime.hours === 0 ? "" : inputTime.hours}
            onChange={handleTimeChange}
            placeholder="HH"
          />
          <label>:</label>
          <input
            type="number"
            name="minutes"
            value={inputTime.minutes === 0 ? "" : inputTime.minutes}
            onChange={handleTimeChange}
            placeholder="MM"
          />
          <label>:</label>
          <input
            type="number"
            name="seconds"
            value={inputTime.seconds === 0 ? "" : inputTime.seconds}
            onChange={handleTimeChange}
            placeholder="SS"
          />
        </div>
      )}

      {/* Circular Timer Display */}
      <div className="timer-display">
        <svg viewBox="0 0 36 36" width="200" height="200">
          <path
            d="M18 2.0845
              a 15.9155 15.9155 0 0 1 0 31.831
              a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            stroke="#ddd"
            strokeWidth="2"
          />
          <path
            d="M18 2.0845
              a 15.9155 15.9155 0 0 1 0 31.831
              a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            stroke="#ff9800"
            strokeWidth="2.5"
            strokeDasharray={`${progress}, 100`}
          />
        </svg>
        <div className="time-text">
          {Math.floor(time / 3600)}:{Math.floor((time % 3600) / 60).toString().padStart(2, '0')}:
          {(time % 60).toString().padStart(2, '0')}
        </div>
      </div>

      {/* Start/Pause/Resume, Reset */}
      <div className="timer-controls">
        <button onClick={handleStartPause}>
          {isActive && !isPaused ? "Pause" : isPaused ? "Resume" : "Start"}
        </button>
        <button onClick={resetTimer}>Reset</button>
      </div>

      {/* Quick Preset Buttons (disabled when active) */}
      {isCountdown && !isActive && (
        <div className="preset-buttons">
          <button onClick={() => setInputTime({ hours: 0, minutes: 1, seconds: 0 })}>1 MIN</button>
          <button onClick={() => setInputTime({ hours: 0, minutes: 3, seconds: 0 })}>3 MIN</button>
          <button onClick={() => setInputTime({ hours: 0, minutes: 5, seconds: 0 })}>5 MIN</button>
          <button onClick={() => setInputTime({ hours: 0, minutes: 10, seconds: 0 })}>10 MIN</button>
        </div>
      )}
    </div>
  );
}

export default Timer;