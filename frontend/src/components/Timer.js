import React, { useState, useEffect } from 'react';
import '../ComponentCSS/Timer.css';

const Timer = () => {
  const [time, setTime] = useState(() => {
    const savedTime = localStorage.getItem("timer-time");
    return savedTime ? JSON.parse(savedTime) : 0;
  });
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isCountdown, setIsCountdown] = useState(false);
  const [inputTime, setInputTime] = useState({
    hours: "",
    minutes: "",
    seconds: ""
  });

  useEffect(() => {
    localStorage.setItem("timer-time", JSON.stringify(time));
  }, [time]);

  const totalTime = (parseInt(inputTime.hours || 0) * 3600) +
                    (parseInt(inputTime.minutes || 0) * 60) + 
                    parseInt(inputTime.seconds || 0);

  const progress = isCountdown && totalTime > 0 ? (time / totalTime) * 100 : 
                  !isCountdown ? (time % 3600) / 36 : 0;

  useEffect(() => {
    let interval = null;
    if (isActive && !isPaused) {
      interval = setInterval(() => {
        setTime(prevTime => {
          if (isCountdown) {
            const newTime = Math.max(prevTime - 1, 0);
            if (newTime === 0) {
              setIsActive(false);
            }
            return newTime;
          }
          return prevTime + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, isPaused, isCountdown]);

  const handleTimeChange = (e) => {
    const { name, value } = e.target;
    setInputTime(prev => ({
      ...prev,
      [name]: value === "" ? "" : Math.max(0, parseInt(value))
    }));
  };

  const handleStartPause = () => {
    if (!isActive) {
      if (isCountdown) {
        setTime(totalTime);
      }
      setIsActive(true);
      setIsPaused(false);
    } else {
      setIsPaused(!isPaused);
    }
  };

  const resetTimer = () => {
    setIsActive(false);
    setIsPaused(false);
    setTime(0);
    setInputTime({ hours: "", minutes: "", seconds: "" });
  };

  const formatTime = (timeInSeconds) => {
    const hours = Math.floor(timeInSeconds / 3600);
    const minutes = Math.floor((timeInSeconds % 3600) / 60);
    const seconds = timeInSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="timer-container">
      <div className="timer-wrapper">
        <div className="timer-header">
          <h2>{isCountdown ? "Countdown" : "Stopwatch"}</h2>
          {!isActive && (
            <div className="mode-toggle">
              <button
                onClick={() => setIsCountdown(false)}
                className={!isCountdown ? 'active' : ''}
              >
                Stopwatch
              </button>
              <button
                onClick={() => setIsCountdown(true)}
                className={isCountdown ? 'active' : ''}
              >
                Timer
              </button>
            </div>
          )}
        </div>

        <div className="timer-circle">
          <svg viewBox="0 0 100 100">
            <circle
              className="timer-circle-bg"
              cx="50"
              cy="50"
              r="45"
            />
            <circle
              className="timer-circle-progress"
              cx="50"
              cy="50"
              r="45"
              style={{
                strokeDasharray: `${progress * 2.83}, 283`
              }}
            />
          </svg>
          <div className="timer-display">
            <span>{formatTime(time)}</span>
          </div>
        </div>

        {isCountdown && !isActive && (
          <div className="time-input-group">
            <input
              type="number"
              name="hours"
              value={inputTime.hours}
              onChange={handleTimeChange}
              placeholder="HH"
            />
            <input
              type="number"
              name="minutes"
              value={inputTime.minutes}
              onChange={handleTimeChange}
              placeholder="MM"
            />
            <input
              type="number"
              name="seconds"
              value={inputTime.seconds}
              onChange={handleTimeChange}
              placeholder="SS"
            />
          </div>
        )}

        <div className="timer-controls">
          <button
            onClick={handleStartPause}
            className={`control-button ${isActive && !isPaused ? 'pause' : 'start'}`}
          >
            {isActive && !isPaused ? "Pause" : isPaused ? "Resume" : "Start"}
          </button>
          <button
            onClick={resetTimer}
            className="control-button reset"
          >
            Reset
          </button>
        </div>

        {isCountdown && !isActive && (
          <div className="preset-buttons">
            {[1, 3, 5, 10].map(mins => (
              <button
                key={mins}
                onClick={() => setInputTime({ hours: 0, minutes: mins, seconds: 0 })}
              >
                {mins}m
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Timer;