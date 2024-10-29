import React, { useState } from 'react';

const CGPACalculator = () => {
  const [totalSubjects, setTotalSubjects] = useState(0);
  const [subjects, setSubjects] = useState([]);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // For current input values
  const [subjectCount, setSubjectCount] = useState(0);
  const [creditScore, setCreditScore] = useState('');
  const [subjectType, setSubjectType] = useState('');
  const [internalMarks, setInternalMarks] = useState('');
  const [externalMarks, setExternalMarks] = useState('');

  // Handle initial input of number of subjects
  const handleSubjectCountSubmit = () => {
    setTotalSubjects(subjectCount);
  };

  // Handle adding a new subject
  const handleAddSubject = () => {
    const newSubject = {
      creditScore: parseInt(creditScore),
      subjectType,
      internalMarks: parseInt(internalMarks),
      externalMarks: parseInt(externalMarks),
    };

    setSubjects([...subjects, newSubject]);

    // Clear inputs for the next subject
    setCreditScore('');
    setSubjectType('');
    setInternalMarks('');
    setExternalMarks('');

    // Check if all subjects have been added
    if (subjects.length + 1 === totalSubjects) {
      setIsSubmitted(true);
    }
  };

  // CGPA calculation logic
  const calculateCGPA = () => {
    let totalScore = 0;
    let totalCredits = 0;

    subjects.forEach(subject => {
      const { creditScore, subjectType, internalMarks, externalMarks } = subject;

      // Validate external marks for minimum pass requirement
      if (externalMarks < 21) {
        totalScore += 0; // Directly assign 0 if external marks are below 21
        totalCredits += creditScore;
        return;
      }

      // Calculate total marks
      const maxInternal = subjectType === 'Theory' ? 30 : 50;
      const maxExternal = subjectType === 'Theory' ? 70 : 50;

      if (internalMarks > maxInternal || externalMarks > maxExternal) {
        alert(`Please ensure marks are within the allowed range for ${subjectType}.`);
        return;
      }

      const totalMarks = internalMarks + externalMarks;
      let score = 0;

      // Determine score based on total marks
      if (totalMarks >= 90) score = 10;
      else if (totalMarks >= 80) score = 9;
      else if (totalMarks >= 70) score = 8;
      else if (totalMarks >= 60) score = 7;
      else if (totalMarks >= 50) score = 6;
      else if (totalMarks >= 40) score = 5;

      totalScore += score * creditScore;
      totalCredits += creditScore;
    });

    return totalCredits > 0 ? (totalScore / totalCredits).toFixed(2) : 0;
  };

  // Calculate total marks and percentage
  const calculateTotalMarks = () => {
    let totalMarks = 0;
    let totalMaxMarks = 0;

    subjects.forEach(subject => {
      const maxInternal = subject.subjectType === 'Theory' ? 30 : 50;
      const maxExternal = subject.subjectType === 'Theory' ? 70 : 50;

      totalMarks += subject.internalMarks + subject.externalMarks;
      totalMaxMarks += maxInternal + maxExternal;
    });

    return { totalMarks, totalMaxMarks };
  };

  // Reset all states to start another calculation
  const handleReset = () => {
    setTotalSubjects(0);
    setSubjects([]);
    setSubjectCount(0);
    setIsSubmitted(false);
    setCreditScore('');
    setSubjectType('');
    setInternalMarks('');
    setExternalMarks('');
  };

  // Determine the color for the percentage ring based on the percentage
  const getPercentageRingColor = (percentage) => {
    if (percentage >= 75) return 'green';
    if (percentage >= 50) return 'orange';
    return 'darkred';
  };

  const { totalMarks, totalMaxMarks } = calculateTotalMarks();
  const percentage = totalMaxMarks > 0 ? ((totalMarks / totalMaxMarks) * 100).toFixed(2) : 0;
  const ringColor = getPercentageRingColor(percentage);

  // Circle calculations for proportional fill
  const circleRadius = 45; // Radius of the circle
  const circleCircumference = 2 * Math.PI * circleRadius; // Circumference for the SVG circle
  const fillPercentage = (percentage / 100) * circleCircumference; // Calculate how much of the ring to fill

  return (
    <div className="cgpa-calculator">
      <h2>CGPA Calculator</h2>

      {/* Step 1: Input total number of subjects */}
      {totalSubjects === 0 ? (
        <div>
          <label>Enter total number of subjects: </label>
          <input
            type="number"
            value={subjectCount}
            onChange={(e) => setSubjectCount(Number(e.target.value))}
            min="1"
          />
          <button onClick={handleSubjectCountSubmit}>Submit</button>
        </div>
      ) : null}

      {/* Step 2: Input details for each subject */}
      {!isSubmitted && totalSubjects > 0 && subjects.length < totalSubjects && (
        <div>
          <h3>Enter details for Subject {subjects.length + 1}</h3>
          <label>Credit Score: </label>
          <input
            type="number"
            value={creditScore}
            onChange={(e) => setCreditScore(e.target.value)}
            min="1"
          />
          <br />

          <label>Subject Type: </label>
          <select value={subjectType} onChange={(e) => setSubjectType(e.target.value)}>
            <option value="">Select</option>
            <option value="Theory">Theory</option>
            <option value="Practical">Practical</option>
          </select>
          <br />

          <label>Internal Marks: </label>
          <input
            type="number"
            value={internalMarks}
            onChange={(e) => setInternalMarks(e.target.value)}
            min="0"
            max={subjectType === 'Theory' ? 30 : 50}
          />
          <br />

          <label>External Marks: </label>
          <input
            type="number"
            value={externalMarks}
            onChange={(e) => setExternalMarks(e.target.value)}
            min="0"
            max={subjectType === 'Theory' ? 70 : 50}
          />
          <br />

          <button onClick={handleAddSubject}>Add Subject</button>
        </div>
      )}

      {/* Step 3: Display CGPA and total marks */}
      {isSubmitted && (
        <div>
          <h3>CGPA Calculation</h3>
          <p>Your CGPA is: {calculateCGPA()}</p>
          <p>Total Marks: {totalMarks} / {totalMaxMarks}</p>
          <p>Percentage: {percentage}%</p>
          
          {/* Circular Progress Ring */}
          <svg width="120" height="120" viewBox="0 0 120 120" className="progress-ring">
            <circle
              cx="60"
              cy="60"
              r={circleRadius}
              stroke="#e6e6e6"
              strokeWidth="10"
              fill="transparent"
            />
            <circle
              cx="60"
              cy="60"
              r={circleRadius}
              stroke={ringColor}
              strokeWidth="10"
              fill="transparent"
              strokeDasharray={`${fillPercentage}, ${circleCircumference}`}
              strokeLinecap="round"
              transform="rotate(-90 60 60)" // Rotate to make the progress start from the top
            />
            <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fontSize="18" fill="#000">
              {percentage}%
            </text>
          </svg>

          <button onClick={handleReset}>Calculate Another</button>
        </div>
      )}
    </div>
  );
};

export default CGPACalculator;
