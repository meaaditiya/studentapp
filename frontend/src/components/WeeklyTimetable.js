import React, { useState, useEffect } from "react";
import axios from "axios";
import * as XLSX from "xlsx"; // Import XLSX for Excel file handling

function WeeklyTimetable() {
  const [excelData, setExcelData] = useState([]);
  const [columnHeaders, setColumnHeaders] = useState([]);
  const [dragging, setDragging] = useState(false); // State to handle drag-and-drop events
  const [showUploader, setShowUploader] = useState(false); // State to toggle file upload visibility

  // Fetch timetable data from the server when the component loads
  useEffect(() => {
    const fetchTimetable = async () => {
      try {
        const response = await axios.get("http://192.168.1.42:5000/api/timetable");
        const { headers, data } = response.data;

        setColumnHeaders(headers);
        setExcelData(data);
      } catch (error) {
        alert("Could not fetch timetable data.");
      }
    };

    fetchTimetable();
  }, []);

  // Handle file upload and parse the Excel file
  const handleFileUpload = (file) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });

      const firstSheetName = workbook.SheetNames[0];
      const worksheet = XLSX.utils.sheet_to_json(workbook.Sheets[firstSheetName], {
        header: 1,
      });

      if (worksheet.length > 0) {
        const headers = worksheet[0];
        const dataRows = worksheet.slice(1);

        setColumnHeaders(headers);
        setExcelData(dataRows);

        saveTimetable(headers, dataRows);
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const saveTimetable = async (headers, data) => {
    try {
      await axios.post("http://192.168.1.42:5000/api/timetable", { headers, data });
      alert("Timetable uploaded successfully!");
    } catch (error) {
      alert("Could not upload timetable.");
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => {
    setDragging(false);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragging(false);
    const file = event.dataTransfer.files[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const toggleUploader = () => {
    setShowUploader(!showUploader);
  };

  return (
    <div className="weekly-timetable">
      <h2>Weekly Timetable</h2>

      {/* Circular plus button to toggle file uploader */}
      <button
        className="plus-button"
        onClick={toggleUploader}
        title={showUploader ? "Hide Upload Area" : "Show Upload Area"}
      >
        {showUploader ? "−" : "+"} {/* Change the icon based on state */}
      </button>

      {/* Conditionally render file input and drag-drop area */}
      {showUploader && (
        <div className="upload-area">
          {/* File input */}
          <input
            type="file"
            accept=".xlsx, .xls"
            onChange={handleFileChange}
            className="custom-file-input"
          />

          {/* Drag and drop area */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`drag-drop-area ${dragging ? "dragging" : ""}`}
          >
            {dragging ? "Drop the file here..." : "Or drag and drop an Excel file here"}
          </div>
        </div>
      )}

      {/* Display Excel Data */}
      {excelData.length > 0 && (
        <table>
          <thead>
            <tr>
              {columnHeaders.map((header, index) => (
                <th key={index}>{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {excelData.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default WeeklyTimetable;
