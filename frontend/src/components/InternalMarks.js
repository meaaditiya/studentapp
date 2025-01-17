import React, { useState, useEffect } from 'react';
import { Trash, Edit, Check, X } from 'lucide-react';
import '../ComponentCSS/Internal.css'
function InternalMarks() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingSubject, setEditingSubject] = useState(null);
  const [editValues, setEditValues] = useState({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [subjectToDelete, setSubjectToDelete] = useState(null);
  const [newSubject, setNewSubject] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      const response = await fetch('https://studentapp-backend-ccks.onrender.com/api/subjects');
      if (!response.ok) throw new Error('Failed to fetch subjects');
      
      const data = await response.json();
      const sortedSubjects = data.sort((a, b) => a.name.localeCompare(b.name));
      
      const normalizedSubjects = sortedSubjects.map(subject => ({
        ...subject,
        marksBasedInternal: subject.marksBasedInternal || 0,
        attendanceBasedInternal: subject.attendanceBasedInternal || 0,
        taMarks: subject.taMarks || 0
      }));
      
      setSubjects(normalizedSubjects);
      setError(null);
    } catch (error) {
      console.error('Error fetching subjects:', error);
      setError('Failed to load internal marks');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubject = async (e) => {
    e.preventDefault();
    if (!newSubject.trim()) return;

    try {
      const response = await fetch('https://studentapp-backend-ccks.onrender.com/api/subjects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newSubject })
      });

      if (!response.ok) throw new Error('Failed to add subject');
      
      const subject = await response.json();
      setSubjects(prev => [...prev, subject].sort((a, b) => a.name.localeCompare(b.name)));
      setNewSubject('');
      setShowAddForm(false);
    } catch (error) {
      setError('Failed to add subject');
    }
  };

  const handleEdit = (subject) => {
    setEditingSubject(subject._id);
    setEditValues({
      marksBasedInternal: subject.marksBasedInternal || 0,
      attendanceBasedInternal: subject.attendanceBasedInternal || 0,
      taMarks: subject.taMarks || 0
    });
  };

  const handleUpdate = async () => {
    try {
      const validatedValues = {
        marksBasedInternal: Math.max(0, Math.min(20, Number(editValues.marksBasedInternal))),
        attendanceBasedInternal: Math.max(0, Math.min(3, Number(editValues.attendanceBasedInternal))),
        taMarks: Math.max(0, Math.min(7, Number(editValues.taMarks)))
      };

      const totalMarks = calculateTotalInternal(validatedValues);
      if (totalMarks > 30) {
        setError('Total internal marks cannot exceed 30');
        return;
      }

      const response = await fetch(`https://studentapp-backend-ccks.onrender.com/api/subjects/${editingSubject}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(validatedValues)
      });

      if (!response.ok) throw new Error('Failed to update subject');
      
      const updatedSubject = await response.json();
      setSubjects(subjects.map(subject => 
        subject._id === editingSubject ? updatedSubject : subject
      ));
      
      setEditingSubject(null);
      setEditValues({});
      setError(null);
    } catch (error) {
      setError('Failed to update internal marks');
    }
  };

  const handleTAMarksUpdate = async (subjectId, newTAMarks) => {
    try {
      const validatedTAMarks = Math.max(0, Math.min(7, Number(newTAMarks)));
      
      // Get the current subject
      const currentSubject = subjects.find(s => s._id === subjectId);
      if (!currentSubject) return;
  
      // Calculate total marks with new TA marks
      const totalMarks = 
        (currentSubject.marksBasedInternal || 0) + 
        (currentSubject.attendanceBasedInternal || 0) + 
        validatedTAMarks;
  
      if (totalMarks > 30) {
        setError('Total internal marks cannot exceed 30');
        return;
      }
  
      const response = await fetch(`https://studentapp-backend-ccks.onrender.com/api/subjects/${subjectId}/ta-marks`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ taMarks: validatedTAMarks })
      });
  
      if (!response.ok) throw new Error('Failed to update TA marks');
      
      const updatedSubject = await response.json();
      setSubjects(subjects.map(subject => 
        subject._id === subjectId ? updatedSubject : subject
      ));
      
      setError(null);
    } catch (error) {
      setError('Failed to update TA marks');
    }
  };

  const calculateTotalInternal = (subject) => {
    const marksBasedInternal = Number(subject.marksBasedInternal) || 0;
    const attendanceBasedInternal = Number(subject.attendanceBasedInternal) || 0;
    const taMarks = Number(subject.taMarks) || 0;
    return marksBasedInternal + attendanceBasedInternal + taMarks;
  };

  const validateInput = (value, max) => {
    const num = Number(value);
    return Math.min(max, Math.max(0, num));
  };
  const handleDelete = async (subjectId) => {
    try {
      const response = await fetch(`https://studentapp-backend-ccks.onrender.com/api/subjects/${subjectId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete subject');
      
      setSubjects(subjects.filter(subject => subject._id !== subjectId));
      setError(null);
    } catch (error) {
      setError('Failed to delete subject');
    }
  };

  const confirmDelete = (subject) => {
    if (window.confirm(`Are you sure you want to delete ${subject.name}?`)) {
      handleDelete(subject._id);
    }
  };
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
    </div>;
  }

  return (
    <div className="internal-marks-container">
      <div className="internal-marks-header">
        <h2 className="internal-marks-title">Internal Marks Summary</h2>
        <button
          onClick={() => setShowAddForm(true)}
          className="internal-marks-add-btn"
        >
          Add Subject
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleAddSubject} className="internal-marks-form">
          <div className="internal-marks-form-group">
            <input
              type="text"
              value={newSubject}
              onChange={(e) => setNewSubject(e.target.value)}
              placeholder="Enter subject name"
              className="internal-marks-input"
            />
            <button
              type="submit"
              className="internal-marks-submit-btn"
            >
              Add
            </button>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="internal-marks-cancel-btn"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="internal-marks-table-container">
        <table className="internal-marks-table">
          <thead>
            <tr className="internal-marks-header-row">
              <th className="internal-marks-header-cell">Subject</th>
              <th className="internal-marks-header-cell">Marks Based (Max 20)</th>
              <th className="internal-marks-header-cell">Attendance Based (Max 3)</th>
              <th className="internal-marks-header-cell">TA Marks (Max 7)</th>
              <th className="internal-marks-header-cell">Total (Max 30)</th>
              <th className="internal-marks-header-cell">Actions</th>
            </tr>
          </thead>
          <tbody>
            {subjects.map((subject) => (
              <tr key={subject._id} className="internal-marks-row">
                <td className="internal-marks-cell">{subject.name}</td>
                <td className="internal-marks-cell text-center">
                  {editingSubject === subject._id ? (
                    <input
                      type="number"
                      value={editValues.marksBasedInternal}
                      onChange={(e) => setEditValues({
                        ...editValues,
                        marksBasedInternal: validateInput(e.target.value, 20)
                      })}
                      className="internal-marks-number-input"
                      min="0"
                      max="20"
                    />
                  ) : (
                    subject.marksBasedInternal || 0
                  )}
                </td>
                <td className="internal-marks-cell text-center">
                  {editingSubject === subject._id ? (
                    <input
                      type="number"
                      value={editValues.attendanceBasedInternal}
                      onChange={(e) => setEditValues({
                        ...editValues,
                        attendanceBasedInternal: validateInput(e.target.value, 3)
                      })}
                      className="internal-marks-number-input"
                      min="0"
                      max="3"
                    />
                  ) : (
                    subject.attendanceBasedInternal || 0
                  )}
                </td>
                <td className="internal-marks-cell text-center">
                  <div className="internal-marks-ta-marks">
                    {editingSubject === subject._id ? (
                      <input
                        type="number"
                        value={editValues.taMarks}
                        onChange={(e) => setEditValues({
                          ...editValues,
                          taMarks: validateInput(e.target.value, 7)
                        })}
                        className="internal-marks-number-input"
                        min="0"
                        max="7"
                      />
                    ) : (
                      <div className="internal-marks-ta-display">
                        <span>{subject.taMarks || 0}</span>
                        {!editingSubject && (
                          <button
                            onClick={() => {
                              const newTAMarks = prompt('Enter new TA marks (0-7):', subject.taMarks || 0);
                              if (newTAMarks !== null) {
                                handleTAMarksUpdate(subject._id, newTAMarks);
                              }
                            }}
                            className="internal-marks-ta-edit-btn"
                            title="Update TA Marks"
                          >
                            <Edit size={14} />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </td>
                <td className="internal-marks-cell text-center font-bold">
                  {calculateTotalInternal(editingSubject === subject._id ? editValues : subject)}
                </td>
                <td className="internal-marks-cell">
                  <div className="internal-marks-actions">
                    {editingSubject === subject._id ? (
                      <div className="internal-marks-edit-actions">
                        <button
                          onClick={handleUpdate}
                          className="internal-marks-save-btn"
                          title="Save"
                        >
                          <Check size={18} />
                        </button>
                        <button
                          onClick={() => {
                            setEditingSubject(null);
                            setEditValues({});
                          }}
                          className="internal-marks-cancel-edit-btn"
                          title="Cancel"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    ) : (
                      <div className="internal-marks-view-actions">
                        <button
                          onClick={() => handleEdit(subject)}
                          className="internal-marks-edit-btn"
                          title="Edit"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => confirmDelete(subject)}
                          className="internal-marks-delete-btn"
                          title="Delete"
                        >
                          <Trash size={18} />
                        </button>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {error && (
        <div className="internal-marks-error">
          <p>{error}</p>
          <button
            onClick={() => setError(null)}
            className="internal-marks-error-close"
          >
            <X size={16} />
          </button>
        </div>
      )}

      <div className="internal-marks-guide">
        <h3 className="internal-marks-guide-title">Internal Marks Guide</h3>
        <ul className="internal-marks-guide-list">
          <li className="internal-marks-guide-item">
            <span className="font-semibold">Marks Based Internal (0-20):</span> Calculated from exam performance
          </li>
          <li className="internal-marks-guide-item">
            <span className="font-semibold">Attendance Based (0-3):</span>
            <ul className="internal-marks-guide-sublist">
              <li>Below 75%: 1 mark</li>
              <li>75-85%: 2 marks</li>
              <li>Above 85%: 3 marks</li>
            </ul>
          </li>
          <li className="internal-marks-guide-item">
            <span className="font-semibold">TA Marks (0-7):</span> Assigned by teaching assistants
          </li>
          <li className="internal-marks-guide-item">
            <span className="font-semibold">Total Maximum Marks: 30</span>
          </li>
        </ul>
      </div>
    </div>
  );
}

export default InternalMarks;