import React, { useState, useEffect } from "react";
import axios from "axios";
import "./NewSubject.css";

function NewSubjectManager() {
  const [subjects, setSubjects] = useState([]);
  const [newSubjectName, setNewSubjectName] = useState("");
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [newUnit, setNewUnit] = useState("");
  const [newTopics, setNewTopics] = useState("");
  const [isSubjectFormVisible, setSubjectFormVisible] = useState(false);
  const [isTopicFormVisible, setTopicFormVisible] = useState(false);

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      const response = await axios.get("http://192.168.1.41:5000/newsubject");
      setSubjects(response.data);
    } catch (error) {
      console.error("Error fetching subjects:", error);
    }
  };

  const addSubject = async () => {
    try {
      if (!newSubjectName.trim()) {
        alert("Subject name cannot be empty.");
        return;
      }
      const response = await axios.post("http://192.168.1.41:5000/newsubject", {
        subjectName: newSubjectName,
      });
      setSubjects([...subjects, response.data]);
      setNewSubjectName("");
      setSubjectFormVisible(false);
    } catch (error) {
      console.error("Error adding subject:", error);
    }
  };

  const deleteSubject = async (subjectId) => {
    if (!window.confirm("Are you sure you want to delete this subject?")) {
      return;
    }
    try {
      await axios.delete(`http://192.168.1.41:5000/newsubject/${subjectId}`);
      setSubjects(subjects.filter((subject) => subject._id !== subjectId));
      if (selectedSubject === subjectId) {
        setSelectedSubject(null);
      }
    } catch (error) {
      console.error("Error deleting subject:", error);
    }
  };

  const addTopics = async () => {
    if (!selectedSubject) {
      alert("Please select a subject first!");
      return;
    }

    if (!newUnit.trim() || !newTopics.trim()) {
      alert("Unit name and topics cannot be empty.");
      return;
    }

    const topicsArray = newTopics
      .split(/[,.]/) // Split by commas or full stops
      .map((topic) => topic.trim())
      .filter((topic) => topic !== "");

    if (topicsArray.length === 0) {
      alert("No valid topics entered.");
      return;
    }

    for (const topic of topicsArray) {
      try {
        await axios.post(
          `http://192.168.1.41:5000/newsubject/${selectedSubject}/topics`,
          {
            date: new Date().toISOString().split("T")[0], // Automatically assign today's date
            topicName: topic,
            unitName: newUnit,
            completed: false,
          }
        );
      } catch (error) {
        console.error("Error adding topic:", error);
      }
    }

    fetchSubjects(); // Refresh the subject list
    setNewUnit("");
    setNewTopics("");
    setTopicFormVisible(false);
  };

  const deleteTopic = async (subjectId, topicId) => {
    if (!window.confirm("Are you sure you want to delete this topic?")) {
      return;
    }
    try {
      await axios.delete(
        `http://192.168.1.41:5000/newsubject/${subjectId}/topics/${topicId}`
      );
      setSubjects(
        subjects.map((subject) => {
          if (subject._id === subjectId) {
            return {
              ...subject,
              topics: subject.topics.filter((topic) => topic._id !== topicId),
            };
          }
          return subject;
        })
      );
    } catch (error) {
      console.error("Error deleting topic:", error);
    }
  };

  const toggleCompletion = async (subjectId, topicId, isCompleted) => {
    try {
      await axios.patch(
        `http://192.168.1.41:5000/newsubject/${subjectId}/topics/${topicId}`,
        { completed: !isCompleted }
      );
      fetchSubjects();
    } catch (error) {
      console.error("Error toggling topic completion:", error);
    }
  };

  const calculateCompletion = (topics) => {
    if (!topics || topics.length === 0) return 0;
    const completed = topics.filter((topic) => topic.completed).length;
    return Math.round((completed / topics.length) * 100);
  };

  return (
    <div className="container">
      <h1 className="title">Prepare Your Exam</h1>

      {/* Add Subject Form */}
      {isSubjectFormVisible && (
        <div className="form-section">
          <input
            type="text"
            className="input"
            placeholder="Add new subject..."
            value={newSubjectName}
            onChange={(e) => setNewSubjectName(e.target.value)}
          />
          <button className="button add-btn" onClick={addSubject}>
            Add Subject
          </button>
        </div>
      )}

      <button className="floating-btn" onClick={() => setSubjectFormVisible(!isSubjectFormVisible)}>
        +
      </button>

      <div className="form-section">
        <h3 className="sub-title">Subjects</h3>
        <div className="subjects-grid">
          {subjects.map((subject) => (
            <div
              key={subject._id}
              className="subject-item"
              onClick={() => setSelectedSubject(subject._id)}
            >
              <div className="subject-header">
                <span>{subject.subjectName}</span>
                <button
                  className="button delete-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteSubject(subject._id);
                  }}
                >
                  ×
                </button>
              </div>
              <div className="completion-ring">
                <div className="ring">{calculateCompletion(subject.topics)}%</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Topics Form */}
      {isTopicFormVisible && (
        <div className="form-section">
          <select
            className="select"
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
          >
            <option value="">Select Subject</option>
            {subjects.map((subject) => (
              <option key={subject._id} value={subject._id}>
                {subject.subjectName}
              </option>
            ))}
          </select>
          <input
            type="text"
            className="input"
            placeholder="Unit Name"
            value={newUnit}
            onChange={(e) => setNewUnit(e.target.value)}
          />
          <input
            type="text"
            className="input"
            placeholder="Topics (comma or full-stop separated)"
            value={newTopics}
            onChange={(e) => setNewTopics(e.target.value)}
          />
          <button className="button add-btn" onClick={addTopics}>
            Add Topics
          </button>
        </div>
      )}

      <button className="floating-btn" onClick={() => setTopicFormVisible(!isTopicFormVisible)}>
        +
      </button>

      <div className="form-section">
        <h3 className="sub-title">Topics for Selected Subject</h3>
        <div className="topics-strip">
          {subjects
            .find((subject) => subject._id === selectedSubject)
            ?.topics.map((topic) => (
              <div key={topic._id} className="topic-item">
                <div className="topic-details">
                  <label>
                    <input
                      type="checkbox"
                      checked={topic.completed}
                      onChange={() =>
                        toggleCompletion(selectedSubject, topic._id, topic.completed)
                      }
                    />
                    {topic.topicName} - {topic.unitName}
                  </label>
                  <button
                    className="button delete-btn"
                    onClick={() => deleteTopic(selectedSubject, topic._id)}
                  >
                    &#x2715;
                  </button>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

export default NewSubjectManager;
