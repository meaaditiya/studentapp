import React, { useState } from 'react';
import '../ComponentCSS/AttendanceManager.css';
const AttendanceManager = () => {
  const [mode, setMode] = useState(null);
  const [totalLectures, setTotalLectures] = useState('');
  const [attendedLectures, setAttendedLectures] = useState('');
  const [subjectCount, setSubjectCount] = useState('');
  const [subjects, setSubjects] = useState([]);
  const [targetAttendance, setTargetAttendance] = useState('');
  const [result, setResult] = useState('');
  const [resultColor, setResultColor] = useState('black');
  const [showCalculateButtons, setShowCalculateButtons] = useState(false);
  const [showTargetForm, setShowTargetForm] = useState(false);

  const resetFields = () => {
    setTotalLectures('');
    setAttendedLectures('');
    setSubjectCount('');
    setSubjects([]);
    setTargetAttendance('');
    setResult('');
    setResultColor('black');
  };

  const handleCalculateAttendance = () => {
    resetFields();
    setMode('calculate');
    setShowCalculateButtons(!showCalculateButtons);
    setShowTargetForm(false); // Hide target form when switching to calculate
  };

  const handleAttendanceTarget = () => {
    resetFields();
    setMode('target');
    setShowTargetForm(!showTargetForm);
    setShowCalculateButtons(false); // Hide calculate buttons when switching to target
  };

  const validateInput = (total, attended) => {
    return total > 0 && attended >= 0 && attended <= total;
  };

  const handleCalculateAggregate = (e) => {
    e.preventDefault();

    if (!validateInput(Number(totalLectures), Number(attendedLectures))) {
      setResult('Please enter valid total and attended lectures.');
      setResultColor('red');
      return;
    }

    const attendance = (Number(attendedLectures) / Number(totalLectures)) * 100;
    const message = `Your current attendance is ${attendance.toFixed(2)}%`;
    setResult(message);
    setResultColor(attendance >= 75 ? 'green' : 'red');
  };

  const handleSubjectWise = (e) => {
    e.preventDefault();

    let totalClasses = 0;
    let totalAttended = 0;
    let valid = true;

    for (const subject of subjects) {
      const conducted = parseInt(subject.conducted) || 0;
      const attended = parseInt(subject.attended) || 0;

      if (conducted < attended) {
        valid = false;
        break;
      }

      totalClasses += conducted;
      totalAttended += attended;
    }

    if (!valid || totalClasses === 0) {
      setResult('Please enter valid conducted classes for each subject.');
      setResultColor('red');
      return;
    }

    const attendance = (totalAttended / totalClasses) * 100;
    const message = `Your current attendance is ${attendance.toFixed(2)}%`;
    setResult(message);
    setResultColor(attendance >= 75 ? 'green' : 'red');
  };
  const handleTargetAttendance = (e) => {
    e.preventDefault();

    // New validation: target attendance must be less than 100
    if (targetAttendance >= 100) {
        setResult('Target attendance cannot be 100% or more.');
        setResultColor('red');
        return;
    }

    if (!validateInput(Number(totalLectures), Number(attendedLectures))) {
        setResult('Please enter valid total and attended lectures.');
        setResultColor('red');
        return;
    }

    const currentAttendance = (Number(attendedLectures) / Number(totalLectures)) * 100;

    // Additional validation: Cannot set target attendance to 100% if conducted > attended
    if (targetAttendance === 100 && Number(totalLectures) > Number(attendedLectures)) {
        setResult('You cannot set target attendance to 100% if you have not attended all conducted lectures.');
        setResultColor('red');
        return;
    }

    if (targetAttendance <= 0 || targetAttendance >=100) {  // Updated this condition
        setResult('Please enter a valid target attendance percentage (0-99).');
        setResultColor('red');
        return;
    }

    let additionalLectures = 0;
    let adjustedTotal = Number(totalLectures);
    let adjustedAttended = Number(attendedLectures);

    if (currentAttendance < targetAttendance) {
        while ((adjustedAttended / adjustedTotal) * 100 < targetAttendance) {
            additionalLectures += 1;
            adjustedTotal += 1;
            adjustedAttended += 1;
        }
        const message = `You need to attend ${additionalLectures} more lectures to reach your target attendance.`;
        setResult(message);
        setResultColor('red');
    } else {
        let lecturesCanMiss = 0;
        while ((adjustedAttended / (adjustedTotal + lecturesCanMiss)) * 100 >= targetAttendance) {
            lecturesCanMiss += 1;
        }
        lecturesCanMiss -= 1;
        const message = `You can miss up to ${lecturesCanMiss} lectures and still meet your attendance target.`;
        setResult(message);
        setResultColor('green');
    }
};


  const handleSubjectCountChange = (count) => {
    setSubjectCount(count);
    setSubjects(Array.from({ length: count }, () => ({ conducted: '', attended: '' })));
  };

  return (
    <div className="attendance-manager">
      <h2 className="attendance-title">Attendence Calculator</h2>
      <div className="attendance-button-group">
        <button onClick={handleCalculateAttendance} className="attendance-btn">Calculate Attendance</button>
        <button onClick={handleAttendanceTarget} className="attendance-btn">Attendance Target</button>
      </div>

      {showCalculateButtons && (
        <div className="attendance-sub-button-group">
          <button onClick={() => { setMode('aggregate'); resetFields(); }} className="attendance-btn">Aggregate</button>
          <button onClick={() => { setMode('subjectWise'); resetFields(); }} className="attendance-btn">Subject Wise</button>
        </div>
      )}

      {mode === 'aggregate' && (
        <div className="attendance-form-container">
          <h3>Aggregate Attendance</h3>
          <form onSubmit={handleCalculateAggregate}>
            <input
              type="number"
              placeholder="Total Lectures Conducted"
              value={totalLectures}
              onChange={(e) => setTotalLectures(e.target.value)}
              required
            />
            <input
              type="number"
              placeholder="Total Lectures Attended"
              value={attendedLectures}
              onChange={(e) => setAttendedLectures(e.target.value)}
              required
            />
            <button type="submit" className="attendance-btn green">Calculate</button>
          </form>
        </div>
      )}

      {mode === 'subjectWise' && (
        <div className="attendance-form-container">
          <h3>Subject Wise Attendance</h3>
          <form onSubmit={handleSubjectWise}>
            <input
              type="number"
              placeholder="Number of Subjects"
              value={subjectCount}
              onChange={(e) => handleSubjectCountChange(e.target.value)}
              required
            />
            {subjects.map((subject, index) => (
              <div key={index} className="attendance-subject-inputs">
                <input
                  type="number"
                  placeholder={`Subject ${index + 1} - Conducted Classes`}
                  value={subject.conducted}
                  onChange={(e) => {
                    const updatedSubjects = [...subjects];
                    updatedSubjects[index].conducted = e.target.value;
                    setSubjects(updatedSubjects);
                  }}
                  required
                />
                <input
                  type="number"
                  placeholder={`Subject ${index + 1} - Attended Classes`}
                  value={subject.attended}
                  onChange={(e) => {
                    const updatedSubjects = [...subjects];
                    updatedSubjects[index].attended = e.target.value;
                    setSubjects(updatedSubjects);
                  }}
                  required
                />
              </div>
            ))}
            <button type="submit" className="attendance-btn green">Calculate</button>
          </form>
        </div>
      )}

      {showTargetForm && mode === 'target' && (
        <div className="attendance-form-container">
          <h3>Attendance Target</h3>
          <form onSubmit={handleTargetAttendance}>
            <input
              type="number"
              placeholder="Total Lectures Conducted"
              value={totalLectures}
              onChange={(e) => setTotalLectures(e.target.value)}
              required
            />
            <input
              type="number"
              placeholder="Total Lectures Attended"
              value={attendedLectures}
              onChange={(e) => setAttendedLectures(e.target.value)}
              required
            />
            <input
              type="number"
              placeholder="Required Attendance (%)"
              value={targetAttendance}
              onChange={(e) => setTargetAttendance(e.target.value)}
              required
            />
            <button type="submit" className="attendance-btn green">Calculate Target</button>
          </form>
        </div>
      )}

      {result && <p style={{ color: resultColor }}>{result}</p>}
    </div>
  );
};

export default AttendanceManager;
