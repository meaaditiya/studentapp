import React, { useState, useEffect } from "react";
import axios from "axios";
 // Separate CSS file for modern styling

const AttendanceComponent = () => {
  const [subjects, setSubjects] = useState([]);
  const [newSubject, setNewSubject] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [attendanceDate, setAttendanceDate] = useState("");
  const [status, setStatus] = useState("present");
  const [showMarkAttendance, setShowMarkAttendance] = useState(false);
  const [showAddSubject, setShowAddSubject] = useState(false);

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      const response = await axios.get("http://192.168.1.42:5000/api/subjects");
      setSubjects(response.data);
    } catch (error) {
      // console.error("Error fetching subjects:", error);
    }
  };

  const handleAddSubject = async () => {
    if (!newSubject) return;
    try {
      const response = await axios.post("http://192.168.1.42:5000/api/subjects", { name: newSubject });
      setSubjects([...subjects, response.data]);
      setNewSubject("");
      setShowAddSubject(false); // Close form after adding
    } catch (error) {
      // console.error("Error adding subject:", error);
    }
  };

  const handleDeleteSubject = async (subjectId) => {
    const confirmation = prompt('Are you sure you want to delete this subject? Type "delete" to confirm.');
    if (confirmation !== "delete") {
      alert("Delete action canceled.");
      return;
    }
    try {
      await axios.delete(`http://192.168.1.42:5000/api/subjects/${subjectId}`);
      setSubjects(subjects.filter((subject) => subject._id !== subjectId));
    } catch (error) {
      // console.error("Error deleting subject:", error);
    }
  };

  const handleMarkAttendance = async () => {
    if (!selectedSubject || !attendanceDate) return;
    try {
      const response = await axios.post(`http://192.168.1.42:5000/api/subjects/${selectedSubject}/attendance`, {
        date: attendanceDate,
        status,
      });
      setSubjects(subjects.map((subject) => (subject._id === selectedSubject ? response.data : subject)));
      setAttendanceDate("");
      setStatus("present");
      setShowMarkAttendance(false); // Close form after marking attendance
    } catch (error) {
      // console.error("Error marking attendance:", error);
    }
  };

  const calculateAttendance = (attendance) => {
    const total = attendance.length;
    const presentCount = attendance.filter((record) => record.status === "present").length;
    const attendancePercentage = total > 0 ? ((presentCount / total) * 100).toFixed(2) : 0;
    return { total, presentCount, attendancePercentage };
  };

  const calculateTotalAttendance = () => {
    const totalClasses = subjects.reduce((acc, subject) => acc + subject.attendance.length, 0);
    const totalPresent = subjects.reduce(
      (acc, subject) => acc + subject.attendance.filter((record) => record.status === "present").length,
      0
    );
    const overallPercentage = totalClasses > 0 ? ((totalPresent / totalClasses) * 100).toFixed(2) : 0;
    return { totalClasses, totalPresent, overallPercentage };
  };

  const totalAttendance = calculateTotalAttendance();

  return (
    <div className="attendance2">
      <div className="attendance-summary">
        <h3>Overall Attendance Summary</h3>
        <div className="attendance-summary-box">
          <p><strong>Total Classes:</strong> {totalAttendance.totalClasses}</p>
          <p><strong>Total Present:</strong> {totalAttendance.totalPresent}</p>
          <p><strong>Percentage:</strong> {totalAttendance.overallPercentage}%</p>
        </div>
      </div>

      <div className="attendance-controls">
        <button onClick={() => setShowAddSubject(!showAddSubject)} className="attendance-btn">
          {showAddSubject ? "Close Add Subject" : "Add Subject"}
        </button>
        <button onClick={() => setShowMarkAttendance(!showMarkAttendance)} className="attendance-btn">
          {showMarkAttendance ? "Close Mark Attendance" : "Mark Attendance"}
        </button>
      </div>

      {showAddSubject && (
        <div className="add-subject-form">
          <input
            type="text"
            value={newSubject}
            onChange={(e) => setNewSubject(e.target.value)}
            placeholder="Add a new subject"
            className="attendance-input"
          />
          <button onClick={handleAddSubject} className="attendance-btn">Submit</button>
        </div>
      )}

      {showMarkAttendance && (
        <div className="mark-attendance-form">
          <h3>Mark Attendance</h3>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="attendance-input"
          >
            <option value="">Select Subject</option>
            {subjects.map((subject) => (
              <option key={subject._id} value={subject._id}>{subject.name}</option>
            ))}
          </select>
          <input
            type="date"
            value={attendanceDate}
            onChange={(e) => setAttendanceDate(e.target.value)}
            className="attendance-input"
          />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="attendance-input"
          >
            <option value="present">Present</option>
            <option value="absent">Absent</option>
          </select>
          <button onClick={handleMarkAttendance} className="attendance-btn">Submit</button>
        </div>
      )}

      <table className="attendance-table">
        <thead>
          <tr>
            <th>Subject</th>
            <th>Total Classes</th>
            <th>Present</th>
            <th>Attendance (%)</th>
            <th>Delete</th>
          </tr>
        </thead>
        <tbody>
          {subjects.map((subject) => {
            const { total, presentCount, attendancePercentage } = calculateAttendance(subject.attendance);
            return (
              <tr key={subject._id}>
                <td>{subject.name}</td>
                <td>{total}</td>
                <td>{presentCount}</td>
                <td>{attendancePercentage}%</td>
                <td>
                  <button
                    onClick={() => handleDeleteSubject(subject._id)}
                    className="delete-btn"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default AttendanceComponent;
