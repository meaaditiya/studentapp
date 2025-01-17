import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import axios from 'axios';
import 'react-calendar/dist/Calendar.css';
import '../ComponentCSS/CalenderComponent.css';
const CalendarTest = () => {
  const [date, setDate] = useState(new Date());
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [showTaskPopup, setShowTaskPopup] = useState(false);

  const formattedDate = date.toISOString().split('T')[0];

  // Fetch tasks for the selected date
  useEffect(() => {
    axios.get(`https://studentapp-backend-ccks.onrender.com/api/calendar-tasks/${formattedDate}`)
      .then(response => setTasks(response.data.tasks || []))
      .catch(error => console.error("Error fetching tasks:", error));
  }, [formattedDate]);

  // Handle adding a new task
  const handleAddTask = () => {
    if (!newTask.trim()) {
      alert("Task cannot be empty");
      return;
    }

    axios.post('https://studentapp-backend-ccks.onrender.com/api/calendar-tasks', { date: formattedDate, task: newTask })
      .then(response => {
        setTasks(response.data.tasks);
        setNewTask('');
      })
      .catch(error => console.error("Error adding task:", error));
  };

 
  const handleDeleteTask = (taskToDelete) => {
    // Pass date and task as query parameters
    axios.delete(`https://studentapp-backend-ccks.onrender.com/api/calendar-tasks`, {
      params: {
        date: formattedDate,
        task: taskToDelete
      }
    })
    .then(response => {
      setTasks(response.data.tasks); // Update tasks with the remaining tasks after deletion
    })
    .catch(error => console.error("Error deleting task:", error));
  };
  
  // Toggle task popup visibility
  const toggleTaskPopup = () => setShowTaskPopup(!showTaskPopup);

  // Highlight dates with tasks
  const tileClassName = ({ date, view }) => {
    if (view === 'month') {
      const formattedTileDate = date.toISOString().split('T')[0];
      return tasks.length && formattedTileDate === formattedDate ? 'highlighted-date' : null;
    }
    return null;
  };

  return (
    <div className="calendar-test-container">
      <h1 className="calendar-test-title">Calendar with Task Management</h1>
      <Calendar 
        className="calendar-component" 
        onChange={(date) => { setDate(date); setShowTaskPopup(true); }} 
        value={date} 
        tileClassName={tileClassName}
      />
      <p className="calendar-selected-date">Selected Date: {date.toDateString()}</p>

      {/* Task Popup */}
      {showTaskPopup && tasks.length > 0 && (
        <div className="task-popup">
          <h3>Tasks for {date.toDateString()}</h3>
          <ul className="task-list">
            {tasks.map((task, index) => (
              <li key={index} className="task-item">
                {task} <button className="delete-task-button" onClick={() => handleDeleteTask(task)}>Delete</button>
              </li>
            ))}
          </ul>
          <button className="close-popup-button" onClick={toggleTaskPopup}>Close</button>
        </div>
      )}

      {/* Add Task Section */}
      <div className="add-task-section">
        <input
          type="text"
          placeholder="Add a new task"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          className="add-task-input"
        />
        <button className="add-task-button" onClick={handleAddTask}>Add Task</button>
      </div>
    </div>
  );
};

export default CalendarTest;