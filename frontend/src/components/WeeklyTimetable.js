import React, { useState, useEffect } from "react";
import { Plus, Save, Table as TableIcon ,Download} from "lucide-react";
import * as XLSX from 'xlsx';
import '../ComponentCSS/WeeklyTimetable.css';

const WeeklyTimetable = () => {
  const [excelData, setExcelData] = useState([]);
  const [columnHeaders, setColumnHeaders] = useState([]);
  const [dragging, setDragging] = useState(false);
  const [showUploader, setShowUploader] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showCreator, setShowCreator] = useState(false);
  const [activeCell, setActiveCell] = useState({ row: -1, col: -1 });
  const [newTableConfig, setNewTableConfig] = useState({
    rows: 3,
    columns: 5
  });

  useEffect(() => {
    fetchTimetable();
  }, []);

  const fetchTimetable = async () => {
    try {
      const response = await fetch("https://personalstudentdiary.onrender.com/api/timetable");
      const { headers, data } = await response.json();
      setColumnHeaders(headers);
      setExcelData(data);
    } catch (error) {
      console.error("Failed to fetch timetable:", error);
      alert("Could not fetch timetable data.");
    }
  };

  const handleFileUpload = (file) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        if (jsonData.length > 0) {
          const headers = jsonData[0];
          const dataRows = jsonData.slice(1);
          await saveTimetable(headers, dataRows);
          setColumnHeaders(headers);
          setExcelData(dataRows);
        }
      } catch (error) {
        console.error("Error processing file:", error);
        alert("Error processing the Excel file.");
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const saveTimetable = async (headers, data) => {
    try {
      const response = await fetch("https://personalstudentdiary.onrender.com/api/timetable", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ headers, data }),
      });
      
      if (!response.ok) throw new Error("Failed to save timetable");
      alert("Timetable saved successfully!");
    } catch (error) {
      console.error("Save error:", error);
      alert("Could not save timetable.");
    }
  };

  const handleCellEdit = async (rowIndex, colIndex, value) => {
    try {
      const newData = [...excelData];
      newData[rowIndex][colIndex] = value;
      setExcelData(newData);

      const response = await fetch("https://personalstudentdiary.onrender.com/api/timetable/cell", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          row: rowIndex,
          column: colIndex,
          value: value,
          headers: columnHeaders
        }),
      });

      if (!response.ok) throw new Error("Failed to update cell");
    } catch (error) {
      console.error("Failed to save cell change:", error);
      alert("Failed to save changes");
    }
  };

  const handleHeaderEdit = async (index, value) => {
    try {
      const newHeaders = [...columnHeaders];
      newHeaders[index] = value;
      setColumnHeaders(newHeaders);

      const response = await fetch("https://personalstudentdiary.onrender.com/api/timetable/header", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          headerIndex: index,
          value: value,
          headers: newHeaders
        }),
      });

      if (!response.ok) throw new Error("Failed to update header");
    } catch (error) {
      console.error("Failed to save header change:", error);
      alert("Failed to save header changes");
    }
  };

  const handleKeyDown = (event, rowIndex, colIndex) => {
    const maxRow = excelData.length - 1;
    const maxCol = columnHeaders.length - 1;
    let nextRow = rowIndex;
    let nextCol = colIndex;

    switch (event.key) {
      case 'Tab':
        event.preventDefault();
        if (!event.shiftKey) {
          if (colIndex === maxCol) {
            nextCol = 0;
            nextRow = Math.min(rowIndex + 1, maxRow);
          } else {
            nextCol = colIndex + 1;
          }
        } else {
          if (colIndex === 0) {
            nextCol = maxCol;
            nextRow = Math.max(rowIndex - 1, -1);
          } else {
            nextCol = colIndex - 1;
          }
        }
        break;
      case 'Enter':
        event.preventDefault();
        nextRow = Math.min(rowIndex + 1, maxRow);
        break;
      case 'ArrowUp':
        event.preventDefault();
        nextRow = Math.max(rowIndex - 1, -1);
        break;
      case 'ArrowDown':
        event.preventDefault();
        nextRow = Math.min(rowIndex + 1, maxRow);
        break;
      case 'ArrowLeft':
        nextCol = Math.max(colIndex - 1, 0);
        break;
      case 'ArrowRight':
        nextCol = Math.min(colIndex + 1, maxCol);
        break;
      default:
        return;
    }

    setActiveCell({ row: nextRow, col: nextCol });
    const nextElement = document.querySelector(
      `input[data-row="${nextRow}"][data-col="${nextCol}"]`
    );
    if (nextElement) nextElement.focus();
  };

  const createNewTable = async () => {
    const newHeaders = Array(newTableConfig.columns)
      .fill("")
      .map((_, i) => `Column ${i + 1}`);
    const newRows = Array(newTableConfig.rows)
      .fill()
      .map(() => Array(newTableConfig.columns).fill(""));
    
    try {
      await saveTimetable(newHeaders, newRows);
      setColumnHeaders(newHeaders);
      setExcelData(newRows);
      setShowCreator(false);
    } catch (error) {
      console.error("Failed to create new table:", error);
      alert("Failed to create new table");
    }
  };
  const exportTimetableToExcel = () => {
    const worksheetData = [columnHeaders, ...excelData];
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Weekly Timetable");
    XLSX.writeFile(workbook, "Weekly_Timetable.xlsx");
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4">
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-2xl font-bold">Weekly Timetable</h2>
      <div className="flex gap-2">
        <button
          title="Create table"
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={() => setShowCreator(!showCreator)}
        >
          <TableIcon className="w-5 h-5" />
        </button>
        <button
          title="Edit the table"
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          onClick={() => setIsEditing(!isEditing)}
        >
          {isEditing ? <Save className="w-5 h-5" /> : "Edit"}
        </button>
        <button
          title="Add a table"
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          onClick={() => setShowUploader(!showUploader)}
        >
          {showUploader ? "−" : "+"}
        </button>
        <button
          title="Download timetable"
          className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
          onClick={exportTimetableToExcel}
        >
          <Download className="w-5 h-5" />
        </button>
      </div>
    </div>


      {showCreator && (
        <div className="mb-4 p-4 border rounded bg-gray-50">
          <div className="flex gap-4">
            <input
              type="number"
              min="1"
              className="px-3 py-2 border rounded"
              placeholder="Rows"
              value={newTableConfig.rows}
              onChange={(e) => setNewTableConfig(prev => ({
                ...prev,
                rows: Math.max(1, parseInt(e.target.value) || 1)
              }))}
            />
            <input
              type="number"
              min="1"
              className="px-3 py-2 border rounded"
              placeholder="Columns"
              value={newTableConfig.columns}
              onChange={(e) => setNewTableConfig(prev => ({
                ...prev,
                columns: Math.max(1, parseInt(e.target.value) || 1)
              }))}
            />
            <button
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              onClick={createNewTable}
            >
              Create Table
            </button>
          </div>
        </div>
      )}

      {showUploader && (
        <div className="mb-4 p-4 border rounded bg-gray-50">
          <input
            type="file"
            accept=".xlsx, .xls"
            onChange={(e) => e.target.files[0] && handleFileUpload(e.target.files[0])}
            className="mb-2"
          />
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              const file = e.dataTransfer.files[0];
              if (file) handleFileUpload(file);
            }}
            className={`p-8 border-2 border-dashed rounded text-center ${
              dragging ? "border-blue-500 bg-blue-50" : "border-gray-300"
            }`}
          >
            {dragging ? "Drop the file here..." : "Or drag and drop an Excel file here"}
          </div>
        </div>
      )}

      {columnHeaders.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border">
            <thead>
              <tr>
                {columnHeaders.map((header, index) => (
                  <th key={index} className="border p-2 bg-gray-100">
                    {isEditing ? (
                      <input
                        type="text"
                        value={header}
                        onChange={(e) => handleHeaderEdit(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(e, -1, index)}
                        data-row="-1"
                        data-col={index}
                        className="w-full p-1 border rounded"
                        autoFocus={activeCell.row === -1 && activeCell.col === index}
                      />
                    ) : (
                      header
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {excelData.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {row.map((cell, cellIndex) => (
                    <td key={cellIndex} className="border p-2">
                      {isEditing ? (
                        <input
                          type="text"
                          value={cell}
                          onChange={(e) => handleCellEdit(rowIndex, cellIndex, e.target.value)}
                          onKeyDown={(e) => handleKeyDown(e, rowIndex, cellIndex)}
                          data-row={rowIndex}
                          data-col={cellIndex}
                          className={`w-full p-1 border rounded ${
                            activeCell.row === rowIndex && activeCell.col === cellIndex
                              ? 'ring-2 ring-blue-500'
                              : ''
                          }`}
                          autoFocus={activeCell.row === rowIndex && activeCell.col === cellIndex}
                        />
                      ) : (
                        cell
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default WeeklyTimetable;