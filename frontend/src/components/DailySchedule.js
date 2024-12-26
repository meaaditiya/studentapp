import React, { useState, useEffect } from "react";
import axios from "axios";

function DailySchedule() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [editIndex, setEditIndex] = useState(null); // State to track editing
  const [completionPercentage, setCompletionPercentage] = useState(0);

  useEffect(() => {
    fetchTasks(); // Fetch tasks on component mount
  }, []);

  useEffect(() => {
    const completedTasks = tasks.filter((task) => task.completed).length;
    const totalTasks = tasks.length;
    setCompletionPercentage(
      totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
    );
  }, [tasks]);

  const fetchTasks = async () => {
    try {
      const response = await axios.get("http://192.168.1.41:5000/tasks"); // Change URL to your IP address
      setTasks(response.data);
    } // eslint-disable-next-line no-console
    catch (error) {
     /* console.error("Error fetching tasks:", error);*/
    }
  };

  const getRingColor = () => {
    if (completionPercentage < 50) return "#b71c1c"; // Dark Red
    if (completionPercentage < 75) return "#ff9800"; // Orange
    if (completionPercentage < 90) return "#ffeb3b"; // Yellow
    return "#4caf50"; // Green
  };

  const addOrEditTask = async () => {
    try {
      if (newTask.trim()) {
        if (editIndex !== null) {
          // Edit existing task
          const updatedTask = {
            ...tasks[editIndex],
            text: newTask,
            lastUpdated: new Date().toLocaleString(),
          };
          await axios.put(`http://192.168.1.41:5000/tasks/${tasks[editIndex]._id}`, updatedTask); // Change URL to your IP address
          const updatedTasks = [...tasks];
          updatedTasks[editIndex] = updatedTask;
          setTasks(updatedTasks);
          setEditIndex(null); // Reset after editing
        } else {
          // Add new task
          const response = await axios.post("http://192.168.1.41:5000/tasks", {
            text: newTask,
            completed: false,
            lastUpdated: new Date().toLocaleString(),
          });
          setTasks([...tasks, response.data]); // Add the newly created task to state
        }
        setNewTask(""); // Reset input field
      }
    } // eslint-disable-next-line no-console
    catch (error) {
    /*  console.error("Error adding/editing task:", error);
      alert("An error occurred. Please try again."); // Optional user feedback*/
    }
  };

  const toggleTask = async (index) => {
    try {
      const updatedTasks = tasks.map((task, i) =>
        i === index
          ? { ...task, completed: !task.completed, lastUpdated: new Date().toLocaleString() }
          : task
      );
      await axios.put(`http://192.168.1.41:5000/tasks/${tasks[index]._id}`, {
        ...updatedTasks[index],
      }); // Change URL to your IP address
      setTasks(updatedTasks);
    } // eslint-disable-next-line no-console
    catch (error) {
      /*console.error("Error toggling task:", error);*/
    }
  };

  const deleteTask = async (index) => {
    try {
      await axios.delete(`http://192.168.1.41:5000/tasks/${tasks[index]._id}`); // Change URL to your IP address
      setTasks(tasks.filter((_, i) => i !== index));
    } // eslint-disable-next-line no-console
    catch (error) {
      /*console.error("Error deleting task:", error);*/
    }
  };

  const editTask = (index) => {
    setNewTask(tasks[index].text); // Load the task text into the input field
    setEditIndex(index); // Set the edit index
  };

  const currentDate = new Date();
  const dateString = currentDate.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const completedTasks = tasks.filter((task) => task.completed).length;
  const totalTasks = tasks.length;

  return (
    <div className="daily-schedule">
      <h2>Daily Schedule</h2>
      <h3>{dateString}</h3>

      {/* Completion Ring */}
      <div className="completion-tracker">
        <div className="completion-ring">
          <svg viewBox="0 0 36 36" width="120" height="120">
            <path
              d="M18 2.0845
                a 15.9155 15.9155 0 0 1 0 31.831
                a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="#ddd"
              strokeWidth="2.5"
            />
            <path
              d="M18 2.0845
                a 15.9155 15.9155 0 0 1 0 31.831
                a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke={getRingColor()}
              strokeWidth="2.5"
              strokeDasharray={`${completionPercentage}, 100`}
            />
          </svg>
          <div className="completion-text">
            <span>COMPLETED</span>
            <strong>{completionPercentage}%</strong>
          </div>
        </div>

        {/* Tasks Completed Counter */}
        <div className="task-counter">
          <span>Tasks Completed:</span>
          <strong>
            {completedTasks} out of {totalTasks}
          </strong>
        </div>
      </div>

      <input
        type="text"
        placeholder="Add a new task..."
        value={newTask}
        onChange={(e) => setNewTask(e.target.value)}
      />
      <button id="addoredit" onClick={addOrEditTask}>
        {editIndex !== null ? "Edit Task" : "Add Task"}
      </button>

      <ul>
        {tasks.map((task, index) => (
          <li key={index} className={task.completed ? "completed" : ""}>
            <input className="checkbox1"
              type="checkbox"
              checked={task.completed}
              onChange={() => toggleTask(index)}
            />
            <span>{task.text}</span>
            <div className="buttons">
              <button onClick={() => editTask(index)}>Edit</button>
              <button onClick={() => deleteTask(index)}>Delete</button>
            </div>
            <small>Last updated on: {task.lastUpdated}</small>
          </li>
        ))}
      </ul>

      {/* Styling for the progress ring, buttons, and task counter */}
      <style jsx>{`
        .completion-tracker {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 2rem; /* Space between the ring and the task counter */
          margin-bottom: 1.5rem;
        }

        .completion-ring {
          position: relative;
          display: inline-block;
          margin: 20px;
        }

        .completion-ring svg {
          transform: rotate(-90deg);
        }

        .completion-text {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          text-align: center;
          font-size: 1rem;
          color: ${getRingColor()};
        }

        .completion-text span {
          display: block;
          font-size: 0.9rem;
        }

        .completion-text strong {
          font-size: 1.2rem;
          color: #000;
        }

        .task-counter {
          text-align: left;
          font-size: 1rem;
        }

        .task-counter span {
          font-size: 0.9rem;
          color: #333;
        }

        .task-counter strong {
          display: block;
          font-size: 1.4rem;
          color: ${getRingColor()};
          margin-top: 0.25rem;
        }

        .buttons {
          display: flex;
          gap: 0.5rem; /* Space between Edit and Delete buttons */
        }
      `}</style>
    </div>
  );
}

export default DailySchedule;