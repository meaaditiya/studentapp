import React, { useState, useEffect } from "react";
import axios from "axios";

const hours = Array.from({ length: 18 }, (_, i) => i + 6); // 6 AM to 12 AM
const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

function WeeklyTimetable() {
  const [timetable, setTimetable] = useState(
    days.reduce((acc, day) => {
      acc[day] = Array(18).fill("");
      return acc;
    }, {})
  );

  const [taskInput, setTaskInput] = useState("");
  const [currentDay, setCurrentDay] = useState(days[0]);
  const [currentHourIndex, setCurrentHourIndex] = useState(0);

  // Fetch timetable data from the API
  useEffect(() => {
    const fetchTimetable = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/timetable");
        const timetableData = response.data;

        const newTimetable = days.reduce((acc, day) => {
          acc[day] = Array(18).fill("");
          return acc;
        }, {});

        timetableData.forEach((entry) => {
          newTimetable[entry.day][entry.hourIndex] = entry.task;
        });

        setTimetable(newTimetable);
      } catch (error) {
        console.error("Error fetching timetable:", error);
        alert("Could not fetch timetable data.");
      }
    };

    fetchTimetable();
  }, []);

  const handleEdit = (day, hourIndex) => {
    setCurrentDay(day);
    setCurrentHourIndex(hourIndex);
    setTaskInput(timetable[day][hourIndex]);
  };

  const handleAddTask = async () => {
    if (currentDay && currentHourIndex !== null && taskInput.trim()) {
      const newEntry = { day: currentDay, hourIndex: currentHourIndex, task: taskInput };
      try {
        await axios.post("http://localhost:5000/api/timetable", newEntry);

        setTimetable((prevTimetable) => ({
          ...prevTimetable,
          [currentDay]: prevTimetable[currentDay].map((entry, index) =>
            index === currentHourIndex ? taskInput : entry
          ),
        }));
        setTaskInput(""); // Clear input after adding
      } catch (error) {
        console.error("Error adding task:", error);
        alert("Could not add task.");
      }
    }
  };

  const formatTime = (hour) => {
    const period = hour >= 12 ? "PM" : "AM";
    const formattedHour = hour % 12 === 0 ? 12 : hour % 12;
    return `${formattedHour} ${period}`;
  };

  return (
    <div className="weekly-timetable">
      <h2>Weekly Timetable</h2>
      <table>
        <thead>
          <tr>
            <th>Time & Day</th>
            {days.map((day) => (
              <th key={day}>{day}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {hours.map((hour, hourIndex) => (
            <tr key={hour}>
              <td>
                {formatTime(hour)} - {formatTime(hour + 1)}
              </td>
              {days.map((day) => (
                <td key={day} onClick={() => handleEdit(day, hourIndex)}>
                  {timetable[day][hourIndex] || ""}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="input-section">
        <select
          value={currentDay}
          onChange={(e) => setCurrentDay(e.target.value)}
        >
          {days.map((day) => (
            <option key={day} value={day}>
              {day}
            </option>
          ))}
        </select>
        <select
          value={currentHourIndex}
          onChange={(e) => setCurrentHourIndex(Number(e.target.value))}
        >
          {hours.map((hour, index) => (
            <option key={index} value={index}>
              {formatTime(hour)} - {formatTime(hour + 1)}
            </option>
          ))}
        </select>
        <input
          type="text"
          value={taskInput}
          onChange={(e) => setTaskInput(e.target.value)}
          placeholder="Enter task..."
        />
        <button onClick={handleAddTask}>Add Task</button>
      </div>
    </div>
  );
}

export default WeeklyTimetable;
