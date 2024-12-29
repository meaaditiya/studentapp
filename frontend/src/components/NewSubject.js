import React, { useState, useEffect } from "react";
import axios from "axios";
import "../ComponentCSS/NewSubject.css";

function NewSubjectManager() {
  const [subjects, setSubjects] = useState([]);
  const [newSubjectName, setNewSubjectName] = useState("");
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [newUnit, setNewUnit] = useState("");
  const [newTopics, setNewTopics] = useState("");
  const [isSubjectFormVisible, setSubjectFormVisible] = useState(false);
  const [isTopicFormVisible, setTopicFormVisible] = useState(false);
  const [newResource, setNewResource] = useState("");
  const [resources, setResources] = useState([]);
  const [isResourceFormVisible, setResourceFormVisible] = useState(false);
  const [newResourceType, setNewResourceType] = useState("PDF");
  const [newResourceFile, setNewResourceFile] = useState(null);
  const [newResourceURL, setNewResourceURL] = useState("");
  const [newResourceName, setNewResourceName] = useState("");
  const [showTopics, setShowTopics] = useState(true);
  const [sortCriteria, setSortCriteria] = useState("name");
  const [filterStatus, setFilterStatus] = useState("all");
  // New state variables for new features
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTopics, setSelectedTopics] = useState(new Set());
  const [selectMode, setSelectMode] = useState(false);

  useEffect(() => {
    fetchSubjects();
    fetchResources();
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
      const response = await axios.post("http:192.168.1.41:5000/newsubject", {
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
      .split(/[,.]/)
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
            date: new Date().toISOString().split("T")[0],
            topicName: topic,
            unitName: newUnit,
            completed: false,
          }
        );
      } catch (error) {
        console.error("Error adding topic:", error);
      }
    }

    fetchSubjects();
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

  const fetchResources = async () => {
    try {
      const response = await axios.get("http://192.168.1.41:5000/resources");
      setResources(response.data);
    } catch (error) {
      console.error("Error fetching resources:", error);
    }
  };

  const addResource = async () => {
    if (!selectedSubject) {
      alert("Please select a subject first!");
      return;
    }

    if (!newResourceName.trim()) {
      alert("Please provide a name for the resource.");
      return;
    }

    if (newResourceType === "PDF" && !newResourceFile) {
      alert("Please upload a PDF file.");
      return;
    }

    if (newResourceType === "YouTube" && !newResourceURL.trim()) {
      alert("Please provide a valid YouTube URL.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("subjectId", selectedSubject);
      formData.append("type", newResourceType);
      formData.append("name", newResourceName);

      if (newResourceType === "PDF") {
        formData.append("file", newResourceFile);
      } else if (newResourceType === "YouTube") {
        formData.append("url", newResourceURL);
      }

      const response = await axios.post(
        "http://192.168.1.41:5000/resources",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setResources([...resources, response.data]);
      setNewResourceFile(null);
      setNewResourceURL("");
      setNewResourceName("");
      setNewResourceType("PDF");
      setResourceFormVisible(false);
    } catch (error) {
      console.error("Error adding resource:", error);
    }
  };

  const deleteResource = async (resourceId) => {
    if (!window.confirm("Are you sure you want to delete this resource?")) {
      return;
    }
    try {
      await axios.delete(`http://192.168.1.41:5000/resources/${resourceId}`);
      setResources(resources.filter((resource) => resource._id !== resourceId));
    } catch (error) {
      console.error("Error deleting resource:", error);
    }
  };

  // New function for handling multiple topic deletion
  const deleteMultipleTopics = async () => {
    if (!window.confirm(`Are you sure you want to delete ${selectedTopics.size} topics?`)) {
      return;
    }

    try {
      for (const topicId of selectedTopics) {
        await axios.delete(
          `http://192.168.1.41:5000/newsubject/${selectedSubject}/topics/${topicId}`
        );
      }

      setSubjects(
        subjects.map((subject) => {
          if (subject._id === selectedSubject) {
            return {
              ...subject,
              topics: subject.topics.filter(
                (topic) => !selectedTopics.has(topic._id)
              ),
            };
          }
          return subject;
        })
      );

      setSelectedTopics(new Set());
      setSelectMode(false);
    } catch (error) {
      console.error("Error deleting multiple topics:", error);
    }
  };

  // New function for handling multiple topic completion toggle
  const toggleMultipleCompletion = async (setCompleted) => {
    try {
      for (const topicId of selectedTopics) {
        await axios.patch(
          `http://192.168.1.41:5000/newsubject/${selectedSubject}/topics/${topicId}`,
          { completed: setCompleted }
        );
      }
      fetchSubjects();
      setSelectedTopics(new Set());
      setSelectMode(false);
    } catch (error) {
      console.error("Error toggling multiple topics completion:", error);
    }
  };
  // Add this new function for handling select all functionality
const handleSelectAll = (shouldSelectAll) => {
  const currentTopics = getSortedAndFilteredTopics(
    subjects.find((subject) => subject._id === selectedSubject)?.topics
  );
  
  if (shouldSelectAll) {
    const allTopicIds = new Set(currentTopics.map(topic => topic._id));
    setSelectedTopics(allTopicIds);
  } else {
    setSelectedTopics(new Set());
  }
};
  const getSortedAndFilteredTopics = (topics) => {
    if (!topics) return [];
    
    let filteredTopics = [...topics];
    
    // Apply search filter
    if (searchTerm) {
      filteredTopics = filteredTopics.filter(
        topic => 
          topic.topicName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          topic.unitName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply status filter
    if (filterStatus !== "all") {
      filteredTopics = filteredTopics.filter(
        topic => filterStatus === "completed" ? topic.completed : !topic.completed
      );
    }
    
    // Apply sort
    return filteredTopics.sort((a, b) => {
      switch (sortCriteria) {
        case "name":
          return a.topicName.localeCompare(b.topicName);
        case "unit":
          return a.unitName.localeCompare(b.unitName);
        default:
          return 0;
      }
    });
  };

  return (
    <div className="container">
      <h1 className="title">Prepare Your Exam</h1>

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

      <button
        className="floating-btn"
        onClick={() => setSubjectFormVisible(!isSubjectFormVisible)}
      >
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
              <div className="completion-ring2">
                <div className="ring">
                  {calculateCompletion(subject.topics)}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="form-section">
        <div className="section-header">
          <h3 className="sub-title">Topics for Selected Subject</h3>
          <div className="topics-controls">
            {/* New search bar */}
            <input
              type="text"
              className="input search-input"
              placeholder="Search topics..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select
              className="select"
              value={sortCriteria}
              onChange={(e) => setSortCriteria(e.target.value)}
            >
              <option value="name">Sort by Name</option>
              <option value="unit">Sort by Unit</option>
            </select>
            <select
              className="select"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Topics</option>
              <option value="completed">Completed</option>
              <option value="incomplete">Incomplete</option>
            </select>
            <button
              className="button toggle-btn"
              onClick={() => setShowTopics(!showTopics)}
            >
              {showTopics ? "Hide" : "Show"}
            </button>
          </div>
        </div>

        {showTopics && (
          <>
            {isTopicFormVisible && (
              <div className="form-section">
                <select
                  className="select"
                  value={selectedSubject || ""}
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

            <button
              className="floating-btn"
              onClick={() => setTopicFormVisible(!isTopicFormVisible)}
            >
              +
            </button>

            {selectedSubject && (
  <div className="multi-select-controls">
    <button
      className="button"
      onClick={() => setSelectMode(!selectMode)}
    >
      {selectMode ? "Cancel" : "Select"}
    </button>
    {selectMode && (
      <>
        <button
          className="button"
          onClick={() => handleSelectAll(true)}
        >
          Select All
        </button>
        <button
          className="button"
          onClick={() => handleSelectAll(false)}
        >
          Deselect All
        </button>
        {selectedTopics.size > 0 && (
          <>
            <button
              className="button"
              onClick={() => toggleMultipleCompletion(true)}
            >
              Mark Complete ({selectedTopics.size})
            </button>
            <button
              className="button"
              onClick={() => toggleMultipleCompletion(false)}
            >
              Mark Incomplete ({selectedTopics.size})
            </button>
            <button
              className="delete-btn"
              onClick={deleteMultipleTopics}
            >
              × 
            </button>
          </>
        )}
      </>
    )}
  </div>
)}

            <div className="topics-strip">
              {getSortedAndFilteredTopics(
                subjects.find((subject) => subject._id === selectedSubject)?.topics
              ).map((topic) => (
                <div key={topic._id} className="topic-item">
                  <div className="topic-details">
                    {selectMode ? (
                      <input
                        type="checkbox"
                        checked={selectedTopics.has(topic._id)}
                        onChange={(e) => {
                          const newSelected = new Set(selectedTopics);
                          if (e.target.checked) {
                            newSelected.add(topic._id);
                          } else {
                            newSelected.delete(topic._id);
                          }
                          setSelectedTopics(newSelected);
                        }}
                      />
                    ) : (
                      <input
                        type="checkbox"
                        checked={topic.completed}
                        onChange={() =>
                          toggleCompletion(
                            selectedSubject,
                            topic._id,
                            topic.completed
                          )
                        }
                      />
                    )}
                    <span className={topic.completed ? "completed" : ""}>
                      {topic.topicName} - {topic.unitName}
                    </span>
                    {!selectMode && (
                      <button
                        className="button delete-btn"
                        onClick={() => deleteTopic(selectedSubject, topic._id)}
                      >
                        ×
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="form-section">
        <h3 className="sub-title">Resources</h3>
        {isResourceFormVisible && (
          <>
            <select
              className="select"
              value={selectedSubject || ""}
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
              placeholder="Resource Name"
              value={newResourceName}
              onChange={(e) => setNewResourceName(e.target.value)}
            />

            <select
              className="select"
              value={newResourceType}
              onChange={(e) => setNewResourceType(e.target.value)}
            >
              <option value="PDF">PDF</option>
              <option value="YouTube">YouTube</option>
            </select>

            {newResourceType === "PDF" && (
              <input
                type="file"
                accept="application/pdf"
                className="input"
                onChange={(e) => setNewResourceFile(e.target.files[0])}
              />
            )}

            {newResourceType === "YouTube" && (
              <input
                type="text"
                className="input"
                placeholder="Enter YouTube URL"
                value={newResourceURL}
                onChange={(e) => setNewResourceURL(e.target.value)}
              />
            )}

            <button className="button add-btn" onClick={addResource}>
              Add Resource
            </button>
          </>
        )}

        <button
          className="floating-btn"
          onClick={() => setResourceFormVisible(!isResourceFormVisible)}
        >
          +
        </button>

        <div className="resources-list">
          {resources
            .filter((resource) => resource.subjectId === selectedSubject)
            .map((resource) => (
              <div key={resource._id} className="resource-item">
                <div className="resource-content">
                  {resource.type === "PDF" ? (
                    <div className="resource-pdf">
                      <span className="resource-title">{resource.name}</span>
                      <button
                        onClick={() => window.open(resource.url, '_blank')}
                        className="resource-link button"
                      >
                        Open PDF
                      </button>
                    </div>
                  ) : (
                    <div className="resource-youtube">
                      <span className="resource-title">{resource.name}</span>
                      <a
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="resource-link"
                      >
                        Watch Video
                      </a>
                    </div>
                  )}
                </div>
                <button
                  className="button delete-btn"
                  onClick={() => deleteResource(resource._id)}
                >
                  ×
                </button>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

export default NewSubjectManager;