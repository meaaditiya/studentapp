import React, { useState, useEffect } from "react";
import axios from "axios";

function MyMarks() {
  const [examName, setExamName] = useState("");
  const [examDate, setExamDate] = useState("");
  const [numSubjects, setNumSubjects] = useState(0);
  const [subjects, setSubjects] = useState([]);
  const [marks, setMarks] = useState([]);
  const [maxMarks, setMaxMarks] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [examRecords, setExamRecords] = useState([]);
  const [currentSubject, setCurrentSubject] = useState("");
  const [currentMark, setCurrentMark] = useState("");
  const [currentMaxMark, setCurrentMaxMark] = useState("");
  const [subjectIndex, setSubjectIndex] = useState(0);
  const [selectedRecord, setSelectedRecord] = useState(null);

  // Fetch existing exam records on component mount
  useEffect(() => {
    fetchExamRecords();
  }, []);

  // Function to fetch all exam records from backend
  const fetchExamRecords = async () => {
    try {
      const response = await axios.get("https://studentapp-backend-ccks.onrender.com/api/exams/");
      setExamRecords(response.data);
    } catch (error) {
     /* console.error("Error fetching exams:", error);*/
    }
  };

  const handleExamDetailsSubmit = (e) => {
    e.preventDefault();
    if (examName && examDate && numSubjects > 0) {
      setSubmitted(true);
    }
  };

  const handleAddSubject = (e) => {
    e.preventDefault();
    if (currentSubject && currentMark && currentMaxMark) {
      setSubjects([...subjects, currentSubject]);
      setMarks([...marks, currentMark]);
      setMaxMarks([...maxMarks, currentMaxMark]);
      setCurrentSubject("");
      setCurrentMark("");
      setCurrentMaxMark("");
      setSubjectIndex(subjectIndex + 1);
    }
  };

  const calculatePercentage = (mark, maxMark) => {
    return Math.round((parseInt(mark) / parseInt(maxMark)) * 100);
  };

  const handleFinalSubmit = async () => {
    const newExam = {
      examName,
      examDate,
      subjects,
      marks,
      maxMarks,
    };
    try {
      const response = await axios.post("https://studentapp-backend-ccks.onrender.com/api/exams/", newExam);
      setExamRecords([...examRecords, response.data]);
      resetForm();
    } catch (error) {
     /* console.error("Error saving exam:", error);*/
    }
  };

  const resetForm = () => {
    setExamName("");
    setExamDate("");
    setNumSubjects(0);
    setSubjects([]);
    setMarks([]);
    setMaxMarks([]);
    setSubmitted(false);
    setSubjectIndex(0);
  };

  const handleDelete = async (index) => {
    const recordToDelete = examRecords[index];
    const confirmDelete = window.prompt("Are you sure? Type 'yes' to delete record");
    if (confirmDelete === "yes") {
      try {
        await axios.delete(`https://studentapp-backend-ccks.onrender.com/api/exams/${recordToDelete._id}`);
        const updatedRecords = examRecords.filter((_, i) => i !== index);
        setExamRecords(updatedRecords);
        setSelectedRecord(null);
      } catch (error) {
       /* console.error("Error deleting exam:", error);*/
      }
    }
  };

  const getRingFillStyle = (percentage) => {
    let ringColor;
    if (percentage < 50) {
      ringColor = "red";
    } else if (percentage < 75) {
      ringColor = "orange";
    } else {
      ringColor = "green";
    }

    return {
      width: "60px",
      height: "60px",
      borderRadius: "50%",
      background: `conic-gradient(${ringColor} ${percentage * 3.6}deg, lightgray 0deg)`,
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
    };
  };

  const innerCircleStyle = {
    width: "48px",
    height: "48px",
    borderRadius: "50%",
    backgroundColor: "white",
  };

  const ringPercentageStyle = {
    position: "absolute",
    fontSize: "1.2em",
    fontWeight: "bold",
    textAlign: "center",
  };

  const handleShowRecord = (index) => {
    setSelectedRecord(selectedRecord === examRecords[index] ? null : examRecords[index]);
  };

  const totalMarks = (marks) =>
    marks.reduce((total, mark) => parseInt(total) + parseInt(mark), 0);

  const totalMaxMarks = (maxMarks) =>
    maxMarks.reduce((total, mark) => parseInt(total) + parseInt(mark), 0);

  return (
    <div className="my-marks">
      <h2>Fill Marks Entry</h2>

      {!submitted ? (
        <form onSubmit={handleExamDetailsSubmit}>
          <div>
            <label>Examination Name: </label>
            <input
              type="text"
              value={examName}
              onChange={(e) => setExamName(e.target.value)}
              required
            />
          </div>
          <div>
            <label>Examination Date: </label>
            <input
              type="date"
              value={examDate}
              onChange={(e) => setExamDate(e.target.value)}
              required
            />
          </div>
          <div>
            <label>Number of Subjects: </label>
            <input
              type="number"
              min="1"
              value={numSubjects}
              onChange={(e) => setNumSubjects(e.target.value)}
              required
            />
          </div>
          <button type="submit">Next</button>
        </form>
      ) : subjectIndex < numSubjects ? (
        <form onSubmit={handleAddSubject}>
          <h3>Enter Subject {subjectIndex + 1} Details</h3>
          <div>
            <label>Subject Name: </label>
            <input
              type="text"
              value={currentSubject}
              onChange={(e) => setCurrentSubject(e.target.value)}
              required
            />
          </div>
          <div>
            <label>Marks: </label>
            <input
              type="number"
              min="0"
              value={currentMark}
              onChange={(e) => setCurrentMark(e.target.value)}
              required
            />
          </div>
          <div>
            <label>Max Marks: </label>
            <input
              type="number"
              min="0"
              value={currentMaxMark}
              onChange={(e) => setCurrentMaxMark(e.target.value)}
              required
            />
          </div>
          <button type="submit">Add Subject</button>
        </form>
      ) : (
        <div>
          <h3>Examination: {examName}</h3>
          <p>Date: {examDate}</p>

          <table>
            <thead>
              <tr>
                <th>Subject</th>
                <th>Marks</th>
                <th>Max Marks</th>
                <th>Percentage</th>
              </tr>
            </thead>
            <tbody>
              {subjects.map((subject, index) => {
                const percentage = calculatePercentage(marks[index], maxMarks[index]);
                return (
                  <tr key={index}>
                    <td>{subject}</td>
                    <td>{marks[index]}</td>
                    <td>{maxMarks[index]}</td>
                    <td>
                      <div style={getRingFillStyle(percentage)}>
                        <div style={innerCircleStyle}></div>
                        <div style={ringPercentageStyle}>{percentage}%</div>
                      </div>
                    </td>
                  </tr>
                );
              })}
              <tr>
                <td colSpan="2">Total Marks</td>
                <td>
                  {totalMarks(marks)} / {totalMaxMarks(maxMarks)}
                </td>
                <td>
                  <div style={getRingFillStyle(calculatePercentage(totalMarks(marks), totalMaxMarks(maxMarks)))}>
                    <div style={innerCircleStyle}></div>
                    <div style={ringPercentageStyle}>
                      {calculatePercentage(totalMarks(marks), totalMaxMarks(maxMarks))}%
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
          <button onClick={handleFinalSubmit}>Submit</button>
        </div>
      )}

      <h2>Recorded Exams</h2>
      {examRecords.map((record, index) => (
        <div key={index}>
          <p>
            {record.examName} - {record.examDate}
            <button onClick={() => handleShowRecord(index)}>
              {selectedRecord === examRecords[index] ? "Hide Record" : "Show Record"}
            </button>
            <button onClick={() => handleDelete(index)}>Delete</button>
          </p>
        </div>
      ))}

      {selectedRecord && (
        <div>
          <h3>{selectedRecord.examName} Record</h3>
          <table>
            <thead>
              <tr>
                <th>Subject</th>
                <th>Marks</th>
                <th>Max Marks</th>
                <th>Percentage</th>
              </tr>
            </thead>
            <tbody>
              {selectedRecord.subjects.map((subject, index) => {
                const percentage = calculatePercentage(
                  selectedRecord.marks[index],
                  selectedRecord.maxMarks[index]
                );
                return (
                  <tr key={index}>
                    <td>{subject}</td>
                    <td>{selectedRecord.marks[index]}</td>
                    <td>{selectedRecord.maxMarks[index]}</td>
                    <td>
                      <div style={getRingFillStyle(percentage)}>
                        <div style={innerCircleStyle}></div>
                        <div style={ringPercentageStyle}>{percentage}%</div>
                      </div>
                    </td>
                  </tr>
                );
              })}
              <tr>
                <td colSpan="2">Total Marks</td>
                <td>
                  {totalMarks(selectedRecord.marks)} / {totalMaxMarks(selectedRecord.maxMarks)}
                </td>
                <td>
                  <div style={getRingFillStyle(calculatePercentage(totalMarks(selectedRecord.marks), totalMaxMarks(selectedRecord.maxMarks)))}>
                    <div style={innerCircleStyle}></div>
                    <div style={ringPercentageStyle}>
                      {calculatePercentage(totalMarks(selectedRecord.marks), totalMaxMarks(selectedRecord.maxMarks))}%
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default MyMarks;