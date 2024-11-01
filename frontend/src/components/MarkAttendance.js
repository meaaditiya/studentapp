import React, { useState, useEffect } from "react";
import axios from "axios";

const AttendanceComponent = () => {
  const [subjects, setSubjects] = useState([]);
  const [newSubject, setNewSubject] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [attendanceDate, setAttendanceDate] = useState("");
  const [status, setStatus] = useState("present");

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      const response = await axios.get("http://192.168.1.42:5000/api/subjects");
      setSubjects(response.data);
    } catch (error) {
      console.error("Error fetching subjects:", error);
    }
  };

  const handleAddSubject = async () => {
    if (!newSubject) return;
    try {
      const response = await axios.post("http://192.168.1.42:5000/api/subjects", { name: newSubject });
      setSubjects([...subjects, response.data]);
      setNewSubject("");
    } catch (error) {
      console.error("Error adding subject:", error);
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
      console.error("Error deleting subject:", error);
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
    } catch (error) {
      console.error("Error marking attendance:", error);
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
    <div style={{ padding: "20px" }}>
      <h2>Subject Attendance Tracker</h2>

      <div style={{ marginBottom: "20px" }}>
        <input
          type="text"
          value={newSubject}
          onChange={(e) => setNewSubject(e.target.value)}
          placeholder="Add a new subject"
          style={{ padding: "8px", width: "200px" }}
        />
        <button onClick={handleAddSubject} style={{ marginLeft: "10px", padding: "8px 12px" }}>
          Add Subject
        </button>
      </div>

      <div style={{ marginBottom: "20px", border: "1px solid #ddd", padding: "10px" }}>
        <h3>Mark Attendance</h3>
        <select
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
          style={{ padding: "8px", width: "200px" }}
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
          style={{ padding: "8px", marginLeft: "10px" }}
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          style={{ padding: "8px", marginLeft: "10px" }}
        >
          <option value="present">Present</option>
          <option value="absent">Absent</option>
        </select>
        <button onClick={handleMarkAttendance} style={{ marginLeft: "10px", padding: "8px 12px" }}>
          Mark Attendance
        </button>
      </div>

      <table border="1" cellPadding="10" cellSpacing="0" style={{ width: "100%", marginBottom: "20px" }}>
        <thead>
          <tr>
            <th>Subject</th>
            <th>Total Classes</th>
            <th>Present Classes</th>
            <th>Attendance (%)</th>
            <th>Delete Subject</th>
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
                    style={{ backgroundColor: "red", color: "white" }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div style={{ borderTop: "1px solid #ddd", paddingTop: "10px" }}>
        <h3>Overall Attendance Summary</h3>
        <p>Total Classes Conducted: {totalAttendance.totalClasses}</p>
        <p>Total Present Classes: {totalAttendance.totalPresent}</p>
        <p>Overall Attendance Percentage: {totalAttendance.overallPercentage}%</p>
      </div>
    </div>
  );
};

export default AttendanceComponent;
