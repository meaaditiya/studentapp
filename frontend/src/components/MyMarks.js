import React, { useState, useEffect } from "react";
import axios from "axios";
import '../ComponentCSS/MyMarks.css'

function MyMarks() {
  const [examTypes, setExamTypes] = useState([]);
  const [selectedExamType, setSelectedExamType] = useState("");
  const [examName, setExamName] = useState("");
  const [examDate, setExamDate] = useState("");
  const [numSubjects, setNumSubjects] = useState(0);
  const [subjects, setSubjects] = useState([]);
  const [marks, setMarks] = useState([]);
  const [maxMarks, setMaxMarks] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [examRecords, setExamRecords] = useState([]);
  const [currentSubject, setCurrentSubject] = useState("");
  const [currentMark, setCurrentMark] = useState("");
  const [currentAttendance, setCurrentAttendance] = useState("");
  const [subjectIndex, setSubjectIndex] = useState(0);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showExamTypeForm, setShowExamTypeForm] = useState(false);
  const [showExamForm, setShowExamForm] = useState(false);
  const [newExamType, setNewExamType] = useState({
    name: "",
    maxMarks: "",
    internalMarks: "",
  });
  const [existingSubjects, setExistingSubjects] = useState([]);

  useEffect(() => {
    fetchExamRecords();
    fetchExamTypes();
    fetchExistingSubjects();
  }, []);

  const fetchExistingSubjects = async () => {
    try {
      const response = await axios.get("http://192.168.1.41:5000/api/subjects/");
      setExistingSubjects(response.data);
    } catch (error) {
      console.error("Error fetching subjects:", error);
    }
  };

  const fetchExamTypes = async () => {
    try {
      const response = await axios.get("http://192.168.1.41:5000/api/examTypes/");
      setExamTypes(response.data);
    } catch (error) {
      console.error("Error fetching exam types:", error);
    }
  };

  const fetchExamRecords = async () => {
    try {
      const response = await axios.get("http://192.168.1.41:5000/api/exams/");
      setExamRecords(response.data);
    } catch (error) {
      console.error("Error fetching exams:", error);
    }
  };

  const handleExamTypeSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://192.168.1.41:5000/api/examTypes/", newExamType);
      setNewExamType({ name: "", maxMarks: "", internalMarks: "" });
      setShowExamTypeForm(false);
      fetchExamTypes();
    } catch (error) {
      console.error("Error creating exam type:", error);
    }
  };

  const handleExamDetailsSubmit = (e) => {
    e.preventDefault();
    if (examName && examDate && numSubjects > 0 && selectedExamType) {
      setSubmitted(true);
    }
  };

  const calculateInternalMarks = (mark, maxMark, internalMax, attendance) => {
    const markPerInternal = maxMark / internalMax;
    let internalMarks = Math.ceil(mark / markPerInternal);
    let attendanceMarks = 1;
    if (attendance >= 85) {
      attendanceMarks = 3;
    } else if (attendance >= 75) {
      attendanceMarks = 2;
    }

    return {
      marksBasedInternal: internalMarks,
      attendanceBasedInternal: attendanceMarks
    };
  };

  const updateInternalMarks = async (existingSubject, newInternalInfo) => {
    const updatedMarksBasedInternal = existingSubject.marksBasedInternal + newInternalInfo.marksBasedInternal;
    const updatedAttendanceBasedInternal = Math.max(existingSubject.attendanceBasedInternal, newInternalInfo.attendanceBasedInternal);

    return await axios.put(`http://192.168.1.41:5000/api/subjects/${existingSubject._id}`, {
      marksBasedInternal: updatedMarksBasedInternal,
      attendanceBasedInternal: updatedAttendanceBasedInternal,
      taMarks: existingSubject.taMarks || 0
    });
  };

  const handleAddSubject = async (e) => {
    e.preventDefault();
    if (currentSubject && currentMark && currentAttendance) {
      const examType = examTypes.find(type => type._id === selectedExamType);
      
      try {
        let existingSubject = existingSubjects.find(
          subject => subject.name.toLowerCase() === currentSubject.toLowerCase()
        );

        // Convert mark to float for decimal point support
        const internalMarksInfo = calculateInternalMarks(
          parseFloat(currentMark),
          parseFloat(examType.maxMarks),
          parseInt(examType.internalMarks),
          parseFloat(currentAttendance)
        );

        if (!existingSubject) {
          const newSubjectResponse = await axios.post("http://192.168.1.41:5000/api/subjects/", {
            name: currentSubject,
            marksBasedInternal: internalMarksInfo.marksBasedInternal,
            attendanceBasedInternal: internalMarksInfo.attendanceBasedInternal,
            taMarks: 0
          });
          existingSubject = newSubjectResponse.data;
          setExistingSubjects([...existingSubjects, existingSubject]);
        } else {
          await updateInternalMarks(existingSubject, internalMarksInfo);
        }

        setSubjects([...subjects, currentSubject]);
        setMarks([...marks, currentMark]);
        setMaxMarks([...maxMarks, examType.maxMarks]);
        setAttendance([...attendance, currentAttendance]);
        setCurrentSubject("");
        setCurrentMark("");
        setCurrentAttendance("");
        setSubjectIndex(subjectIndex + 1);

      } catch (error) {
        console.error("Error handling subject:", error);
      }
    }
  };

  const calculatePercentage = (mark, maxMark) => {
    return Math.round((parseFloat(mark) / parseFloat(maxMark)) * 100);
  };

  const totalMarks = (marks) =>
    marks.reduce((total, mark) => parseFloat(total) + parseFloat(mark), 0).toFixed(2);

  const totalMaxMarks = (maxMarks) =>
    maxMarks.reduce((total, mark) => parseFloat(total) + parseFloat(mark), 0).toFixed(2);

  const handleFinalSubmit = async () => {
    const examType = examTypes.find(type => type._id === selectedExamType);
    const newExam = {
      examType: selectedExamType,
      examName,
      examDate,
      subjects,
      marks,
      maxMarks,
      attendance
    };

    try {
      const response = await axios.post("http://192.168.1.41:5000/api/exams/", newExam);
      setExamRecords([...examRecords, response.data]);
      resetForm();
    } catch (error) {
      console.error("Error saving exam:", error);
    }
  };

  const resetForm = () => {
    setExamName("");
    setExamDate("");
    setNumSubjects(0);
    setSubjects([]);
    setMarks([]);
    setMaxMarks([]);
    setAttendance([]);
    setSubmitted(false);
    setSubjectIndex(0);
    setSelectedExamType("");
    setShowExamForm(false);
  };

  const handleDelete = async (index) => {
    const recordToDelete = examRecords[index];
    const confirmDelete = window.prompt("Are you sure? Type 'yes' to delete record");
    if (confirmDelete === "yes") {
      try {
        // First, update the local state to remove the record
        const updatedRecords = examRecords.filter((_, i) => i !== index);
        setExamRecords(updatedRecords);
        setSelectedRecord(null);

        // Then make the API call to delete the record
        await axios.delete(`http://192.168.1.41:5000/api/exams/${recordToDelete._id}`);

        // Update the subjects' internal marks
        const examType = examTypes.find(type => type._id === recordToDelete.examType);
        
        for (let i = 0; i < recordToDelete.subjects.length; i++) {
          const subjectName = recordToDelete.subjects[i];
          const mark = recordToDelete.marks[i];
          const maxMark = recordToDelete.maxMarks[i];
          const attendance = recordToDelete.attendance[i];

          // Find the subject in existingSubjects
          const subject = existingSubjects.find(s => s.name === subjectName);
          
          if (subject) {
            const internalMarksInfo = calculateInternalMarks(
              parseFloat(mark),
              parseFloat(maxMark),
              parseInt(examType.internalMarks),
              parseFloat(attendance)
            );

            try {
              await axios.put(`http://192.168.1.41:5000/api/subjects/${subject._id}`, {
                marksBasedInternal: Math.max(0, subject.marksBasedInternal - internalMarksInfo.marksBasedInternal),
                attendanceBasedInternal: subject.attendanceBasedInternal,
                taMarks: subject.taMarks || 0
              });
            } catch (error) {
              console.error(`Error updating subject ${subjectName}:`, error);
            }
          }
        }

        // Fetch updated subjects data
        await fetchExistingSubjects();
        
      } catch (error) {
        console.error("Error deleting exam and updating subjects' internal marks:", error);
        // If there's an error, revert the local state
        await fetchExamRecords();
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
      position: "relative",
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
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  };

  const ringPercentageStyle = {
    position: "absolute",
    fontSize: "1em",
    fontWeight: "bold",
    textAlign: "center",
  };

  const handleShowRecord = (index) => {
    setSelectedRecord(selectedRecord === examRecords[index] ? null : examRecords[index]);
  };
  return (
    <div className="my-marks-container">
      <div className="action-buttons">
        <button
          className="toggle-exam-form-btn"
          onClick={() => setShowExamForm(!showExamForm)}
        >
          {showExamForm ? "Hide Form" : "Add Exam"}
        </button>
        
        <button
          className="toggle-exam-type-form-btn"
          onClick={() => setShowExamTypeForm(!showExamTypeForm)}
        >
          {showExamTypeForm ? "Hide Form" : "Add Exam Type"}
        </button>
      </div>

      {showExamTypeForm && (
        <form className="exam-type-form" onSubmit={handleExamTypeSubmit}>
          <div className="exam-type-name-container">
            <label className="exam-type-name-label">Exam Type Name: </label>
            <input
              className="exam-type-name-input"
              type="text"
              value={newExamType.name}
              onChange={(e) => setNewExamType({ ...newExamType, name: e.target.value })}
              required
            />
          </div>
          <div className="max-marks-container">
            <label className="max-marks-label">Maximum Marks: </label>
            <input
              className="max-marks-input"
              type="number"
              value={newExamType.maxMarks}
              onChange={(e) => setNewExamType({ ...newExamType, maxMarks: e.target.value })}
              required
            />
          </div>
          <div className="internal-marks-container">
            <label className="internal-marks-label">Internal Marks: </label>
            <input
              className="internal-marks-input"
              type="number"
              value={newExamType.internalMarks}
              onChange={(e) => setNewExamType({ ...newExamType, internalMarks: e.target.value })}
              required
            />
          </div>
          <button className="add-exam-type-btn" type="submit">
            Add Exam Type
          </button>
        </form>
      )}

      {showExamForm && (
        <div className="exam-form-container">
          <h2 className="marks-title">Fill Marks Entry</h2>
          {!submitted ? (
            <form className="exam-details-form" onSubmit={handleExamDetailsSubmit}>
              <div className="exam-type-selection-container">
                <label className="exam-type-selection-label">Exam Type: </label>
                <select
                  className="exam-type-selection-dropdown"
                  value={selectedExamType}
                  onChange={(e) => setSelectedExamType(e.target.value)}
                  required
                >
                  <option value="">Select Exam Type</option>
                  {examTypes.map((type) => (
                    <option key={type._id} value={type._id}>
                      {type.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="exam-name-container">
                <label className="exam-name-label">Examination Name: </label>
                <input
                  className="exam-name-input"
                  type="text"
                  value={examName}
                  onChange={(e) => setExamName(e.target.value)}
                  required
                />
              </div>
              <div className="exam-date-container">
                <label className="exam-date-label">Examination Date: </label>
                <input
                  className="exam-date-input"
                  type="date"
                  value={examDate}
                  onChange={(e) => setExamDate(e.target.value)}
                  required
                />
              </div>
              <div className="number-of-subjects-container">
                <label className="number-of-subjects-label">Number of Subjects: </label>
                <input
                  className="number-of-subjects-input"
                  type="number"
                  min="1"
                  value={numSubjects}
                  onChange={(e) => setNumSubjects(e.target.value)}
                  required
                />
              </div>
              <button className="exam-details-next-btn" type="submit">
                Next
              </button>
            </form>
          ) : subjectIndex < numSubjects ? (
            <form className="subject-details-form" onSubmit={handleAddSubject}>
              <h3 className="subject-title">Enter Subject {subjectIndex + 1} Details</h3>
              <div className="subject-name-container">
                <label className="subject-name-label">Subject Name: </label>
                <input
                  className="subject-name-input"
                  type="text"
                  value={currentSubject}
                  onChange={(e) => setCurrentSubject(e.target.value)}
                  required
                  list="existing-subjects"
                />
                <datalist id="existing-subjects">
                  {existingSubjects.map((subject) => (
                    <option key={subject._id} value={subject.name} />
                  ))}
                </datalist>
              </div>
              <div className="subject-marks-container">
                <label className="subject-marks-label">Marks: </label>
                <input
                  className="subject-marks-input"
                  type="number"
                  min="0"
                  step="0.1"
                  value={currentMark}
                  onChange={(e) => setCurrentMark(e.target.value)}
                  required
                />
              </div>
              <div className="subject-attendance-container">
                <label className="subject-attendance-label">Attendance (%): </label>
                <input
                  className="subject-attendance-input"
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={currentAttendance}
                  onChange={(e) => setCurrentAttendance(e.target.value)}
                  required
                />
              </div>
              <button className="add-subject-btn" type="submit">
                Add Subject
              </button>
            </form>
          ) : (
            <div className="examination-summary-container">
              <h3 className="examination-summary-title">Examination: {examName}</h3>
              <p className="examination-summary-date">Date: {examDate}</p>

              <table className="examination-summary-table">
                <thead>
                  <tr>
                    <th className="subject-header">Subject</th>
                    <th className="marks-header">Marks</th>
                    <th className="max-marks-header">Max Marks</th>
                    <th className="attendance-header">Attendance</th>
                    <th className="percentage-header">Percentage</th>
                  </tr>
                </thead>
                <tbody>
                  {subjects.map((subject, index) => {
                    const percentage = calculatePercentage(marks[index], maxMarks[index]);
                    return (
                      <tr key={index} className="subject-row">
                        <td className="subject-name-cell">{subject}</td>
                        <td className="marks-cell">{marks[index]}</td>
                        <td className="max-marks-cell">{maxMarks[index]}</td>
                        <td className="attendance-cell">{attendance[index]}%</td>
                        <td className="percentage-cell">
                          <div style={getRingFillStyle(percentage)} className="ring-container">
                            <div style={innerCircleStyle} className="inner-circle">
                              <div style={ringPercentageStyle} className="ring-percentage">
                                {percentage}%
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  <tr className="total-marks-row">
                    <td colSpan="3" className="total-marks-label-cell">Total Marks</td>
                    <td className="total-marks-cell">
                      {totalMarks(marks)} / {totalMaxMarks(maxMarks)}
                    </td>
                    <td className="total-percentage-cell">
                      <div
                        style={getRingFillStyle(
                          calculatePercentage(totalMarks(marks), totalMaxMarks(maxMarks))
                        )}
                        className="ring-container-total"
                      >
                        <div style={innerCircleStyle} className="inner-circle-total">
                          <div style={ringPercentageStyle} className="ring-percentage-total">
                            {calculatePercentage(totalMarks(marks), totalMaxMarks(maxMarks))}%
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
              <button className="final-submit-btn" onClick={handleFinalSubmit}>
                Submit
              </button>
            </div>
          )}
        </div>
      )}

      <h2 className="recorded-exams-title">Recorded Exams</h2>
      {examRecords.map((record, index) => (
        <div key={index} className="exam-record-container">
          <p id="para" className="exam-record-title">
            {record.examName} - {record.examDate}
            <br />
            <button
              id="record"
              className="toggle-record-btn"
              onClick={() => handleShowRecord(index)}
            >
              {selectedRecord === examRecords[index] ? "Hide Record" : "Show Record"}
            </button>
            <button
              id="deletemark"
              className="delete-record-btn"
              onClick={() => handleDelete(index)}
            >
              Delete
            </button>
          </p>
          {selectedRecord === examRecords[index] && (
            <table className="exam-record-table">
              <thead>
                <tr>
                  <th className="subject-header">Subject</th>
                  <th className="marks-header">Marks</th>
                  <th className="max-marks-header">Max Marks</th>
                  <th className="attendance-header">Attendance</th>
                  <th className="percentage-header">Percentage</th>
                </tr>
              </thead>
              <tbody>
                {record.subjects.map((subject, subIndex) => {
                  const percentage = calculatePercentage(
                    record.marks[subIndex],
                    record.maxMarks[subIndex]
                  );
                  return (
                    <tr key={subIndex} className="exam-record-row">
                      <td className="exam-record-subject-cell">{subject}</td>
                      <td className="exam-record-marks-cell">{record.marks[subIndex]}</td>
                      <td className="exam-record-max-marks-cell">{record.maxMarks[subIndex]}</td>
                      <td className="exam-record-attendance-cell">{record.attendance[subIndex]}%</td>
                      <td className="exam-record-percentage-cell">
                        <div style={getRingFillStyle(percentage)} className="ring-container-record">
                          <div style={innerCircleStyle} className="inner-circle-record">
                            <div style={ringPercentageStyle} className="ring-percentage-record">
                              {percentage}%
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                <tr className="exam-record-total-row">
                  <td colSpan="3" className="exam-record-total-label-cell">
                    Total Marks
                  </td>
                  <td className="exam-record-total-marks-cell">
                    {totalMarks(record.marks)} / {totalMaxMarks(record.maxMarks)}
                  </td>
                  <td className="exam-record-total-percentage-cell">
                    <div
                      style={getRingFillStyle(
                        calculatePercentage(totalMarks(record.marks), totalMaxMarks(record.maxMarks))
                      )}
                      className="ring-container-total-record"
                    >
                      <div style={innerCircleStyle} className="inner-circle-total-record">
                        <div style={ringPercentageStyle} className="ring-percentage-total-record">
                          {calculatePercentage(
                            totalMarks(record.marks),
                            totalMaxMarks(record.maxMarks)
                          )}
                          %
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          )}
        </div>
      ))}
    </div>
  );
}

export default MyMarks;