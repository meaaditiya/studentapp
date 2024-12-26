import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

const ProgressTracker = () => {
  const [progressList, setProgressList] = useState([]);
  const [subject, setSubject] = useState('');
  const [percentage, setPercentage] = useState('');
  const [note, setNote] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [currentEditIndex, setCurrentEditIndex] = useState(null);
  const [isFormVisible, setIsFormVisible] = useState(false); // New state to control form visibility

  // Fetch progress from API on component mount
  useEffect(() => {
    const fetchProgress = async () => {
      const response = await axios.get('http://192.168.1.41:5000/api/progress'); // Updated to your IP address
      setProgressList(response.data);
    };

    fetchProgress();
  }, []);

  const handleAddOrUpdateProgress = async () => {
    if (subject && percentage) {
      const updatedProgress = {
        subject,
        percentage: parseInt(percentage),
        note,
        lastUpdated: new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
      };

      if (isEditing) {
        // Update existing progress
        const progressToUpdate = progressList[currentEditIndex]._id;
        await axios.put(`http://192.168.1.41:5000/api/progress/${progressToUpdate}`, updatedProgress);
        const updatedList = [...progressList];
        updatedList[currentEditIndex] = updatedProgress;
        setProgressList(updatedList);
        setIsEditing(false);
        setCurrentEditIndex(null);
      } else {
        // Add new progress
        const response = await axios.post('http://192.168.1.41:5000/api/progress', updatedProgress);
        setProgressList([...progressList, response.data]);
      }

      // Clear inputs
      setSubject('');
      setPercentage('');
      setNote('');
      setIsFormVisible(false); // Hide the form after submission
    } else {
      alert('Please enter both subject and progress percentage');
    }
  };

  const handleEditProgress = (index) => {
    const progressToEdit = progressList[index];
    setSubject(progressToEdit.subject);
    setPercentage(progressToEdit.percentage);
    setNote(progressToEdit.note);
    setIsEditing(true);
    setCurrentEditIndex(index);
    setIsFormVisible(true); // Show form when editing
  };

  const handleDeleteProgress = async (index) => {
    const progressToDelete = progressList[index]._id;
    await axios.delete(`http://192.168.1.41:5000/api/progress/${progressToDelete}`); // Updated to your IP address
    const updatedList = progressList.filter((_, i) => i !== index);
    setProgressList(updatedList);
    if (isEditing && currentEditIndex === index) {
      setIsEditing(false);
      setCurrentEditIndex(null);
      setSubject('');
      setPercentage('');
      setNote('');
      setIsFormVisible(false); // Hide the form if editing the deleted item
    }
  };

  // Function to toggle the form visibility
  const toggleFormVisibility = () => {
    setIsFormVisible((prev) => !prev);
  };

  return (
    <div className="progress-tracker">
      <h2>Your Progress Tracker</h2>

      {/* Circular button to toggle the form */}
      <button className="toggle-form-button" onClick={toggleFormVisibility}>
        {isFormVisible ? '-' : '+'} {/* Change icon based on visibility */}
      </button>

      {/* Conditional rendering of the progress form */}
      {isFormVisible && (
        <div className="progress-form">
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Enter subject"
          />
          <input
            type="number"
            value={percentage}
            onChange={(e) => setPercentage(e.target.value)}
            placeholder="Progress (%)"
            min="0"
            max="100"
          />
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add a note..."
          ></textarea>
          <button onClick={handleAddOrUpdateProgress}>
            {isEditing ? 'Update Progress' : 'Add Progress'}
          </button>
        </div>
      )}

      <ul className="progress-list">
        {progressList.map((progress, index) => (
          <li key={index} className="progress-item">
            <div style={{ width: 100, height: 100 }}>
              <CircularProgressbar
                value={progress.percentage}
                text={`${progress.percentage}%`}
                styles={buildStyles({
                  textColor: '#000',
                  pathColor: `rgba(62, 152, 199, ${progress.percentage / 100})`,
                  trailColor: '#d6d6d6',
                })}
              />
            </div>
            <div className="details">
              <span>{progress.subject}</span>
              <span className="percentage">Progress: {progress.percentage}%</span>
              {progress.note && <p className="note">{progress.note}</p>}
              <p className="last-updated">Last Updated: {progress.lastUpdated}</p>
            </div>
            <button id = "progress-edit" onClick={() => handleEditProgress(index)}>Edit</button>
            <button id = "progress-delete" onClick={() => handleDeleteProgress(index)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ProgressTracker;
