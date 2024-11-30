import React, { useState, useEffect } from "react";
import axios from "axios";
import * as XLSX from "xlsx";

const ExcelTables = () => {
  const [excelTables, setExcelTables] = useState([]);
  const [dragging, setDragging] = useState(false);
  const [showUploader, setShowUploader] = useState(false);
  const [tableTitle, setTableTitle] = useState("");

  useEffect(() => {
    const fetchExcelTables = async () => {
      try {
        const response = await axios.get("http://192.168.1.35:5000/tables");
        setExcelTables(response.data);
      } catch (error) {
        alert("Could not fetch File data.");
      }
    };

    fetchExcelTables();
  }, []);

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

        const newExcelTable = { headers, data: dataRows, title: tableTitle };
        setExcelTables((prev) => [...prev, newExcelTable]);
        saveExcelTable(headers, dataRows, tableTitle);
        setTableTitle("");
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const saveExcelTable = async (headers, data, title) => {
    try {
      await axios.post("http://192.168.1.35:5000/tables", { headers, data, title });
      alert("File uploaded successfully!");
    } catch (error) {
      alert("Could not upload File.");
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

  const deleteExcelTable = async (title) => {
    try {
      const encodedTitle = encodeURIComponent(title);
      const response = await axios.delete(`http://192.168.1.35:5000/tables/${encodedTitle}`);

      if (response.status === 200) {
        const updatedExcelTables = excelTables.filter((excelTable) => excelTable.title !== title);
        setExcelTables(updatedExcelTables);
        alert("Table deleted successfully!");
      }
    } catch (error) {
      alert("Could not delete table.");
    }
  };

  const toggleUploader = () => {
    setShowUploader(!showUploader);
  };

  return (
    <div className="excel-tables-component">
      <h1 className="excel-title">Excel Tables</h1>
      <button className="circular-upload-button" onClick={toggleUploader}>
        {showUploader ? "-" : "+"}
      </button>

      {showUploader && (
        <div className="upload-area">
          <input
            type="text"
            value={tableTitle}
            onChange={(e) => setTableTitle(e.target.value)}
            placeholder="Enter table title"
            className="title-input"
          />
          <input
            type="file"
            accept=".xlsx, .xls"
            onChange={handleFileChange}
            className="file-input"
          />
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`drag-drop-area-custom ${dragging ? "dragging" : ""}`}
          >
            {dragging ? "Drop the file here..." : "Or drag and drop an Excel file here"}
          </div>
        </div>
      )}

      {excelTables.map((excelTable, index) => (
        <div key={index} className="timetable-container">
          <h3 className="table-title">{excelTable.title || `Table ${index + 1}`}</h3>
          <button className="delete-button" onClick={() => deleteExcelTable(excelTable.title)}>
            Delete Table
          </button>
          <table className="styled-table" border="1">
            <thead>
              <tr>
                {excelTable.headers.map((header, headerIndex) => (
                  <th key={headerIndex}>{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {excelTable.data.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {row.map((cell, cellIndex) => (
                    <td key={cellIndex}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
};

export default ExcelTables;