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
    if (!selectedSubject || selectedTopics.size === 0) return;

    if (!window.confirm(`Are you sure you want to delete ${selectedTopics.size} topics?`)) {
      return;
    }

    try {
      // Create an array of all deletion promises
      const deletePromises = Array.from(selectedTopics).map(topicId => 
        axios.delete(`http://192.168.1.41:5000/newsubject/${selectedSubject}/topics/${topicId}`)
      );

      // Wait for all deletions to complete
      await Promise.all(deletePromises);

      // Update local state immediately
      const updatedSubjects = subjects.map(subject => {
        if (subject._id === selectedSubject) {
          return {
            ...subject,
            topics: subject.topics.filter(topic => !selectedTopics.has(topic._id))
          };
        }
        return subject;
      });

      // Update the state
      setSubjects(updatedSubjects);
      setSelectedTopics(new Set());
      setSelectMode(false);

      // Optional: Fetch fresh data to ensure consistency
      await fetchSubjects();
    } catch (error) {
      console.error("Error deleting multiple topics:", error);
      alert("Error deleting topics. Please try again.");
    }
  };

  // New function for handling multiple topic completion toggle
  const toggleMultipleCompletion = async (setCompleted) => {
    if (!selectedSubject || selectedTopics.size === 0) return;

    try {
      // Get the current subject's topics
      const currentSubject = subjects.find(sub => sub._id === selectedSubject);
      if (!currentSubject) return;

      // Create an array of promises for all selected topics
      const updatePromises = Array.from(selectedTopics).map(topicId => {
        return axios.patch(
          `http://192.168.1.41:5000/newsubject/${selectedSubject}/topics/${topicId}`,
          { completed: setCompleted }
        );
      });

      // Wait for all updates to complete
      await Promise.all(updatePromises);

      // Update the local state to reflect changes immediately
      const updatedSubjects = subjects.map(subject => {
        if (subject._id === selectedSubject) {
          const updatedTopics = subject.topics.map(topic => {
            if (selectedTopics.has(topic._id)) {
              return { ...topic, completed: setCompleted };
            }
            return topic;
          });
          return { ...subject, topics: updatedTopics };
        }
        return subject;
      });

      setSubjects(updatedSubjects);
      
      // Clear selection state
      setSelectedTopics(new Set());
      setSelectMode(false);
      
      // Fetch fresh data to ensure consistency
      await fetchSubjects();
    } catch (error) {
      console.error("Error toggling multiple topics completion:", error);
      alert("Error updating topics. Please try again.");
    }
  };

  // Add this new function for handling select all functionality
  const handleSelectAll = (shouldSelectAll) => {
    if (!selectedSubject) return;

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

  // Modified getSortedAndFilteredTopics to maintain consistency
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
    <div className="exam-preparation-container">
      <h1 className="exam-main-title">Prepare Your Exam</h1>

      {isSubjectFormVisible && (
        <div className="subject-form-container">
          <input
            type="text"
            className="subject-input-field"
            placeholder="Add new subject..."
            value={newSubjectName}
            onChange={(e) => setNewSubjectName(e.target.value)}
          />
          <button className="subject-add-button" onClick={addSubject}>
            Add Subject
          </button>
        </div>
      )}

      <button
        className="subject-toggle-floating-button"
        onClick={() => setSubjectFormVisible(!isSubjectFormVisible)}
      >
        +
      </button>

      <div className="subjects-section-container">
        <h3 className="subjects-section-title">Subjects</h3>
        <div className="subjects-grid-layout">
          {subjects.map((subject) => (
            <div
              key={subject._id}
              className="subject-card-container"
              onClick={() => setSelectedSubject(subject._id)}
            >
              <div className="subject-card-header">
                <span>{subject.subjectName}</span>
                <button
                  className="subject-delete-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteSubject(subject._id);
                  }}
                >
                  ×
                </button>
              </div>
              <div className="subject-completion-wrapper">
                <div className="subject-completion-ring">
                  {calculateCompletion(subject.topics)}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="topics-section-container">
        <div className="topics-header-container">
          <h3 className="topics-section-title">Topics for Selected Subject</h3>
          <div className="topics-control-panel">
            <input
              type="text"
              className="topics-search-input"
              placeholder="Search topics..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select
              className="topics-sort-dropdown"
              value={sortCriteria}
              onChange={(e) => setSortCriteria(e.target.value)}
            >
              <option value="name">Sort by Name</option>
              <option value="unit">Sort by Unit</option>
            </select>
            <select
              className="topics-filter-dropdown"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Topics</option>
              <option value="completed">Completed</option>
              <option value="incomplete">Incomplete</option>
            </select>
            <button
              className="topics-visibility-toggle"
              onClick={() => setShowTopics(!showTopics)}
            >
              {showTopics ? "Hide" : "Show"}
            </button>
          </div>
        </div>

        {showTopics && (
          <>
            {isTopicFormVisible && (
              <div className="topic-form-container">
                <select
                  className="topic-subject-dropdown"
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
                  className="topic-unit-input"
                  placeholder="Unit Name"
                  value={newUnit}
                  onChange={(e) => setNewUnit(e.target.value)}
                />
                <input
                  type="text"
                  className="topic-names-input"
                  placeholder="Topics (comma or full-stop separated)"
                  value={newTopics}
                  onChange={(e) => setNewTopics(e.target.value)}
                />
                <button className="topic-add-button" onClick={addTopics}>
                  Add Topics
                </button>
              </div>
            )}

            <button
              className="topic-form-floating-button"
              onClick={() => setTopicFormVisible(!isTopicFormVisible)}
            >
              +
            </button>
            {selectedSubject && (
              <div className="topic-multiselect-controls">
                <button
                  className="topic-select-mode-toggle"
                  onClick={() => {
                    setSelectMode(!selectMode);
                    if (!selectMode) {
                      setSelectedTopics(new Set());
                    }
                  }}
                >
                  {selectMode ? "Cancel" : "Select"}
                </button>
                
                {selectMode && (
                  <>
                    <button
                      className="topic-select-all-button"
                      onClick={() => handleSelectAll(true)}
                    >
                      Select All
                    </button>
                    <button
                      className="topic-deselect-all-button"
                      onClick={() => handleSelectAll(false)}
                    >
                      Deselect All
                    </button>
                    {selectedTopics.size > 0 && (
                      <>
                        <button
                          className="topic-mark-complete-button"
                          onClick={() => toggleMultipleCompletion(true)}
                        >
                          Mark Complete ({selectedTopics.size})
                        </button>
                        <button
                          className="topic-mark-incomplete-button"
                          onClick={() => toggleMultipleCompletion(false)}
                        >
                          Mark Incomplete ({selectedTopics.size})
                        </button>
                        <button
                          className="topic-bulk-delete-button"
                          onClick={deleteMultipleTopics}
                        >
                          ×({selectedTopics.size})
                        </button>
                      </>
                    )}
                  </>
                )}
              </div>
            )}
            
            <div className="topics-list-container">
              {getSortedAndFilteredTopics(
                subjects.find((subject) => subject._id === selectedSubject)?.topics
              ).map((topic) => (
                <div key={topic._id} className="topic-list-item">
                  <div className="topic-item-content">
                    {selectMode ? (
                      <input
                        type="checkbox"
                        className="topic-select-checkbox"
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
                        className="topic-completion-checkbox"
                        checked={topic.completed}
                        onChange={() => {
                          toggleCompletion(selectedSubject, topic._id, topic.completed);
                        }}
                      />
                    )}
                    <span className={topic.completed ? "topic-completed-text" : "topic-incomplete-text"}>
                      {topic.topicName} - {topic.unitName}
                    </span>
                    {!selectMode && (
                      <button
                        className="topic-delete-button"
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

      <div className="resources-section-container">
        <h3 className="resources-section-title">Resources</h3>
        {isResourceFormVisible && (
          <>
            <select
              className="resource-subject-dropdown"
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
              className="resource-name-input"
              placeholder="Resource Name"
              value={newResourceName}
              onChange={(e) => setNewResourceName(e.target.value)}
            />

            <select
              className="resource-type-dropdown"
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
                className="resource-file-input"
                onChange={(e) => setNewResourceFile(e.target.files[0])}
              />
            )}

            {newResourceType === "YouTube" && (
              <input
                type="text"
                className="resource-url-input"
                placeholder="Enter YouTube URL"
                value={newResourceURL}
                onChange={(e) => setNewResourceURL(e.target.value)}
              />
            )}

            <button className="resource-add-button" onClick={addResource}>
              Add Resource
            </button>
          </>
        )}

        <button
          className="resource-form-floating-button"
          onClick={() => setResourceFormVisible(!isResourceFormVisible)}
        >
          +
        </button>

        <div className="resources-grid-container">
          {resources
            .filter((resource) => resource.subjectId === selectedSubject)
            .map((resource) => (
              <div key={resource._id} className="resource-card">
                <div className="resource-card-content">
                  {resource.type === "PDF" ? (
                    <div className="resource-pdf-container">
                      <span className="resource-pdf-title">{resource.name}</span>
                      <button
                        onClick={() => window.open(resource.url, '_blank')}
                        className="resource-pdf-open-button"
                      >
                        Open PDF
                      </button>
                    </div>
                  ) : (
                    <div className="resource-youtube-container">
                      <span className="resource-youtube-title">{resource.name}</span>
                      <a
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="resource-youtube-link"
                      >
                        Watch Video
                      </a>
                    </div>
                  )}
                </div>
                <button
                  className="resource-delete-button"
                  onClick={() => deleteResource(resource._id)}
                >
                  ×
                </button>
              </div>
            ))}
        </div>
      </div>
    </div>
  );}

export default NewSubjectManager;