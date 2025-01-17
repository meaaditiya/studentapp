// WeightLossTracker.jsx
import React, { useState, useEffect } from 'react';
import {  ArrowUpCircle, 
  ArrowDownCircle, 
  Eye, 
  EyeOff, 
  Trash2  ,RefreshCw  } from 'lucide-react';
import '../ComponentCSS/Weight.css';
const WeightLossTracker = () => {
  const [height, setHeight] = useState({ feet: '', inches: '', cm: '' });
  const [showHeightForm, setShowHeightForm] = useState(false);
  const [showWeightForm, setShowWeightForm] = useState(false);
  const [showTotalSummary, setTotalSummary] = useState(false);
  const[targetWeight,setTargetWeight]=useState('');
  const [tempTargetWeight, setTempTargetWeight] = useState('');
  const [showTable, setShowTable] = useState(false);
  const[showtarget,setShowTarget]=useState(false);
  const [weightUnit, setWeightUnit] = useState('kg');
  const [displayUnit, setDisplayUnit] = useState('kg');
  const [entries, setEntries] = useState([]);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().slice(0, 5),
    weight: '',
    weightGrams: '',
    notes: '',
  });

  const calculateBMI = (weight, heightData) => {
    let heightInMeters;
    if (heightData.feet) {
      const feet = parseFloat(heightData.feet) || 0;
      const inches = parseFloat(heightData.inches) || 0;
      const totalInches = (feet * 12) + inches;
      heightInMeters = totalInches * 0.0254;
    } else if (heightData.cm) {
      heightInMeters = parseFloat(heightData.cm) / 100;
    } else {
      return 0;
    }
    const weightInKg = weightUnit === 'kg' ? 
    parseFloat(weight) + (parseFloat(formData.weightGrams || 0) / 1000) :
    parseFloat(weight) * 0.453592;

  return heightInMeters > 0 ? (weightInKg / (heightInMeters * heightInMeters)).toFixed(1) : 0;
};
  const getBMICategory = (bmi) => {
    if (bmi < 18.5) return { category: 'Underweight', colorClass: 'yellow' };
    if (bmi < 24.9) return { category: 'Normal', colorClass: 'green' };
    if (bmi < 29.9) return { category: 'Overweight', colorClass: 'orange' };
    return { category: 'Obese', colorClass: 'red' };
  };

  const handleHeightSubmit = async (e) => {
    e.preventDefault();
    setFormData(prev => ({
      ...prev,
      height: { ...height }
    }));
    setShowHeightForm(false);

    // Update all existing entries with new BMI based on new height
    const updatedEntries = entries.map(entry => ({
      ...entry,
      height,
      bmi: calculateBMI(entry.weight, height)
    }));

    try {
      await Promise.all(updatedEntries.map(entry =>
        fetch(`https://studentapp-backend-ccks.onrender.com/api/weight-entries/${entry._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(entry),
        })
      ));
      fetchEntries();
    } catch (error) {
      console.error('Error updating entries with new height:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const bmi = calculateBMI(formData.weight, height);
    const entryData = {
      ...formData,
      height,
      bmi,
      weight: parseFloat(formData.weight) + (formData.weightGrams ? parseFloat(formData.weightGrams) / 1000 : 0)
    };

    try {
      const response = await fetch('https://studentapp-backend-ccks.onrender.com/api/weight-entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entryData),
      });
      const data = await response.json();
      fetchEntries();
      setFormData({
        ...formData,
        weight: '',
        weightGrams: '',
        notes: ''
      });
    } catch (error) {
      console.error('Error saving entry:', error);
    }
  };

  const fetchEntries = async () => {
    try {
      const response = await fetch('https://studentapp-backend-ccks.onrender.com/api/weight-entries');
      const data = await response.json();
      setEntries(data);
      if (data.length > 0 && data[0].height) {
        setHeight(data[0].height);
      }
    } catch (error) {
      console.error('Error fetching entries:', error);
    }
  };

  const deleteEntry = async (id) => {
    try {
      const response = await fetch(`https://studentapp-backend-ccks.onrender.com/api/weight-entries/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        fetchEntries();
      }
    } catch (error) {
      console.error('Error deleting entry:', error);
    }
  };
  const fetchTargetWeight = async () => {
    try {
      const response = await fetch('https://studentapp-backend-ccks.onrender.com/api/target-weight');
      const data = await response.json();
      if (data && data.weight) {
        setTargetWeight(data.weight.toString());
      }
    } catch (error) {
      console.error('Error fetching target weight:', error);
    }
  };
  
  const updateTargetWeight = async (newWeight) => {
    try {
      const response = await fetch('https://studentapp-backend-ccks.onrender.com/api/target-weight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          weight: parseFloat(newWeight),
          unit: weightUnit
        }),
      });
      const data = await response.json();
      setTargetWeight(data.weight.toString());
    } catch (error) {
      console.error('Error updating target weight:', error);
    }
  };
  const handleTargetWeightSubmit = async (e) => {
    e.preventDefault();
    if (tempTargetWeight) {
      await updateTargetWeight(tempTargetWeight);
      setTempTargetWeight(''); // Clear the temporary input after submission
    }
  };
  useEffect(() => {
    fetchEntries();
    fetchTargetWeight(); 
  }, []);

  const currentBMI = entries.length > 0 ? entries[0].bmi : 0;
  const bmiInfo = getBMICategory(currentBMI);
  const totalchange = entries.length >= 2 ? 
  entries[0].weight - entries[entries.length-1].weight : 0;
  const from = entries.length > 0 ? entries[entries.length - 1].date : null;
  const to = entries.length > 0 ? entries[0].date : null;
  const totalchangeper=entries.length>=2?totalchange/(entries[entries.length-1].weight)*100:0;
  const targetleft=entries.length>0?entries[0].weight-targetWeight:targetWeight;
  const currentWeight=entries.length>0?entries[0].weight:0;
  const calculateDaysBetweenDates = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const differenceInTime = end - start; // Difference in milliseconds
    const differenceInDays = differenceInTime / (1000 * 60 * 60 * 24); // Convert to days
    return Math.round(differenceInDays);
  };
  const convertWeight = (weight, fromUnit, toUnit) => {
    if (fromUnit === toUnit) return weight;
    if (fromUnit === 'kg' && toUnit === 'lbs') return weight * 2.20462;
    if (fromUnit === 'lbs' && toUnit === 'kg') return weight / 2.20462;
    return weight;
  };

  // Add toggle function
  const toggleDisplayUnit = () => {
    setDisplayUnit(prev => prev === 'kg' ? 'lbs' : 'kg');
  };
return (
  <div className="weight-tracker">
  
    {/* BMI Card */}
    <div className="abovesection">
  <div className="bmi-snippet">
    <h2>
      BMI: <span className={bmiInfo.colorClass}>{currentBMI}</span>
      <span className="category-label"> ({bmiInfo.category})</span>
    </h2>
    {height && (
      <p className="height-display">
         Height:{" "}
        {height.cm
          ? `${height.cm} cm`
          : `${height.feet}'${height.inches || "0"}"`}
      </p>
    )}
    <span><p>Current Weight: {currentWeight} {weightUnit}</p></span>
    <span><p>Target: {targetWeight} {weightUnit}</p></span>
  </div>
  <div className="internal-marks-guide">
    <h3>weight Entry guide</h3>
    <ul>
      <li>Please enter a different time with each entry</li>
      <li>Adding notes is optional</li>
    </ul>
  </div>
</div>
 <button 
      onClick={() => setShowTarget(!showtarget)} 
      className="toggle-button"
    >
      {showtarget ? <EyeOff className="icon" /> : <Eye className="icon" />}
      Set Target
    </button>
{showtarget &&(
<form onSubmit={handleTargetWeightSubmit} className="target-weight-form">
<div className="form-grid">
<div className="form-group">
        <div className="input-group">
          <input 
            type="number" 
            step="0.1" 
            placeholder="Enter target weight" 
            value={tempTargetWeight} 
            onChange={(e) => setTempTargetWeight(e.target.value)}  
            className="weight-input"
          />
          <button 
            type="submit" 
            className="submit-button"
            disabled={!tempTargetWeight}
          >
            Set Target
          </button>
        </div>
        </div>
        </div>
      </form>)}

    {/* Height Form Toggle */}
    <button 
      onClick={() => setShowHeightForm(!showHeightForm)} 
      className="toggle-button"
    >
      {showHeightForm ? <EyeOff className="icon" /> : <Eye className="icon" />}
      Update Height
    </button>

    {/* Height Form */}
    {showHeightForm && (
      <form onSubmit={handleHeightSubmit} className="height-form">
        <div className="form-grid">
          <div className="form-group">
            <label>Height (Feet)</label>
            <input 
              type="number" 
              value={height.feet} 
              onChange={(e) => setHeight({ 
                ...height, 
                feet: e.target.value,
                inches: height.inches || '0',
                cm: '' 
              })} 
              placeholder="Feet" 
              step="0.01"
            />
          </div>

          <div className="form-group">
            <label>Height (Inches)</label>
            <input 
              type="number" 
              value={height.inches || '0'} 
              onChange={(e) => setHeight({ 
                ...height, 
                inches: e.target.value, 
                cm: '' 
              })} 
              placeholder="Inches" 
              step="0.01"
            />
          </div>

          <div className="form-group">
            <label>Height (cm)</label>
            <input 
              type="number" 
              value={height.cm} 
              onChange={(e) => setHeight({ 
                feet: '', 
                inches: '', 
                cm: e.target.value 
              })} 
              placeholder="Centimeters" 
              step="0.01"
            />
          </div>
        </div>
        <button type="submit" className="submit-button">
          Update Height
        </button>
      </form>
    )}

    {/* Weight Form Toggle */}
    <button 
      onClick={() => setShowWeightForm(!showWeightForm)} 
      className="toggle-button"
    >
      {showWeightForm ? <EyeOff className="icon" /> : <Eye className="icon" />}
      Add Weight
    </button>

    {/* Weight Form */}
    {showWeightForm && (
      <form onSubmit={(e) => {
    e.preventDefault(); // Prevent the default form submission behavior
    handleSubmit(e);     // Pass the event object to handleSubmit
    setShowWeightForm(!showWeightForm); // Toggle weight form visibility
    setShowTable(!showTable);           // Toggle table visibility
  }} className="weight-form">
        <div className="form-grid">
          <div className="form-group">
            <label>Date</label>
            <input 
              type="date" 
              value={formData.date} 
              onChange={(e) => setFormData({ ...formData, date: e.target.value })} 
              required 
            />
          </div>

          <div className="form-group">
            <label>Time</label>
            <input 
              type="time" 
              value={formData.time} 
              onChange={(e) => setFormData({ ...formData, time: e.target.value })} 
              required 
            />
          </div>

          <div className="form-group">
            <label>Weight</label>
            <div className="weight-input-group">
              <input 
                type="number" 
                step="0.1" 
                placeholder="Weight" 
                value={formData.weight} 
                onChange={(e) => setFormData({ ...formData, weight: e.target.value })} 
                required 
                className="weight-input"
              />
              {weightUnit === 'kg' && (
                <input 
                  type="number" 
                  placeholder="Grams" 
                  value={formData.weightGrams} 
                  onChange={(e) => setFormData({ ...formData, weightGrams: e.target.value })} 
                  className="grams-input"
                />
              )}
            </div>
          </div>

          <div className="form-group">
            <label>Weight Unit</label>
            <select 
              value={weightUnit} 
             
              className="unit-select"
            >
              <option value="kg">Kilograms</option>
              <option value="lbs">Pounds</option>
            </select>
          </div>

          <div className="form-group">
            <label>Notes</label>
            <textarea 
              value={formData.notes} 
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })} 
              placeholder="Add notes..." 
              rows="2" 
              className="notes-input"
            />
          </div>
        </div>

        <button
  type="submit"
  className="submit-button"
>
  Add Entry
</button>
      </form>
    )}

    {/* History Toggle */}
    <button 
      onClick={() => setShowTable(!showTable)} 
      className="toggle-button"
    >
      {showTable ? <EyeOff className="icon" /> : <Eye className="icon" />}
      Weight History
    </button>

    {/* Weight History Table */}
    {showTable && (
    <div className="weight-table-container">
      <div className="table-controls">
        <button 
          onClick={toggleDisplayUnit} 
          className="toggle-button unit-toggle"
        >
          <RefreshCw className="icon" />
          Switch to {displayUnit === 'kg' ? 'lbs' : 'kg'}
        </button>
      </div>
      <table className="weight-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Time</th>
            <th>Weight ({displayUnit})</th>
            <th>BMI</th>
            <th>Change</th>
            <th>Notes</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {entries.length === 0 ? (
            <tr>
              <td colSpan="7">
                <div className="empty-table">
                  <p>No weight entries yet. Start tracking your progress!</p>
                </div>
              </td>
            </tr>
          ) : (
            entries.map((entry, index) => {
              const previousWeight = entries[index + 1]?.weight;
              const currentWeight = convertWeight(entry.weight, weightUnit, displayUnit);
              const prevConvertedWeight = previousWeight ? 
                convertWeight(previousWeight, weightUnit, displayUnit) : null;
              const weightChange = prevConvertedWeight ? 
                currentWeight - prevConvertedWeight : 0;
              const weightChangeper = prevConvertedWeight ? 
                ((currentWeight - prevConvertedWeight)/prevConvertedWeight)*100 : 0;

              return (
                <tr key={entry._id}>
                  <td>{entry.date}</td>
                  <td>{entry.time}</td>
                  <td>{currentWeight.toFixed(2)} {displayUnit}</td>
                  <td>{entry.bmi}</td>
                  <td className={`change-cell ${weightChange > 0 ? 'gain' : 'loss'}`}>
                    {weightChange !== 0 && (
                      <div className="weight-change-indicator">
                        {weightChange >= 0 ? 
                          <ArrowUpCircle className="change-icon" /> : 
                          <ArrowDownCircle className="change-icon" />
                        }
                        <span>{Math.abs(weightChange).toFixed(2)}{' '}{displayUnit}</span>
                        <span>({Math.abs(weightChangeper).toFixed(2)}{'%'})</span>
                      </div>
                    )}
                  </td>
                  <td className="notes-cell">{entry.notes}</td>
                  <td className="action-cell">
                    <button 
                      onClick={() => deleteEntry(entry._id)} 
                      className="delete-button"
                    >
                      <Trash2 size={16} className="delete-icon" />
                      
                    </button>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  )}
  <button 
      onClick={() => setTotalSummary(!showTotalSummary)} 
      className="toggle-button"
    >
      {showTotalSummary? <EyeOff className="icon" /> : <Eye className="icon" />}
      Total Summary
    </button>
  {showTotalSummary &&(
  <div className="bmi-snippet">
  <span><h1>Total Summary</h1>
  <span><h3>Current Weight: {convertWeight(currentWeight,weightUnit,displayUnit).toFixed(2)} {displayUnit}</h3></span></span>
  <span>
  <h3>
    Total Weight Change: {' '}
      {entries.length >= 2 ? 
        convertWeight(entries[0].weight - entries[entries.length-1].weight, weightUnit, displayUnit).toFixed(2) 
        : '0'} {displayUnit}{' '}
    {totalchange >= 0 ? (
      <ArrowUpCircle className="change-icon1" style={{ color: 'red' }} />
    ) : (
      <ArrowDownCircle className="change-icon1" style={{ color: 'green' }} />
    )}
  
    
   
  </h3></span>
  <span><h3>Percentage Change : {totalchangeper.toFixed(2)}{'%'} {totalchange >= 0 ? (
      <ArrowUpCircle className="change-icon1" style={{ color: 'red' }} />
    ) : (
      <ArrowDownCircle className="change-icon1" style={{ color: 'green' }} />
    )}</h3></span>
  <span><h3>From :{' '}{from} To:{' '}{to} </h3> </span>
  <span><h3>Total Days : {calculateDaysBetweenDates(from,to)}</h3></span>
  <span><h3>Average Per Day: {((entries.length >= 2 ? 
        convertWeight(entries[0].weight - entries[entries.length-1].weight, weightUnit, displayUnit).toFixed(2) 
        : '0')/calculateDaysBetweenDates(from,to)).toFixed(3)}{displayUnit}{' '}
        {totalchange >= 0 ? (
      <ArrowUpCircle className="change-icon1" style={{ color: 'red' }} />
    ) : (
      <ArrowDownCircle className="change-icon1" style={{ color: 'green' }} />
    )}
  </h3></span>
  <span><h3>Target Left :{targetleft} {targetleft <= 0 ? (
      <ArrowUpCircle className="change-icon1"  />
    ) : (
      <ArrowDownCircle className="change-icon1"  />
    )}</h3>
  </span>
</div>)}
    {/* Toast Notifications Container */}
    <div className="toast-container">
      {/* Toasts will be rendered here dynamically */}
    </div>
  </div>
);};
export default WeightLossTracker;