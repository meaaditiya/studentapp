import React, { useState, useEffect } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import '../ComponentCSS/ExcelTables.css';
const ExcelTables = () => {
  const [excelTables, setExcelTables] = useState([]);
  const [dragging, setDragging] = useState(false);
  const [showUploader, setShowUploader] = useState(false);
  const [tableTitle, setTableTitle] = useState("");

  useEffect(() => {
    const fetchExcelTables = async () => {
      try {
        const response = await axios.get("http://192.168.1.41:5000/tables");
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
      await axios.post("http://192.168.1.41:5000/tables", { headers, data, title });
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
    if (!window.confirm("Are you sure you want to delete this Table?")) {
      return;
    }
    try {
      const encodedTitle = encodeURIComponent(title);
      const response = await axios.delete(`http://192.168.1.41:5000/tables/${encodedTitle}`);

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
    <div className="et-main-container">
      <h1 className="et-main-title">Excel Tables</h1>
      <button className="et-upload-toggle-btn" onClick={toggleUploader}>
        {showUploader ? "-" : "+"}
      </button>

      {showUploader && (
        <div className="et-upload-section">
          <input
            type="text"
            value={tableTitle}
            onChange={(e) => setTableTitle(e.target.value)}
            placeholder="Enter table title"
            className="et-title-input"
          />
          <input
            type="file"
            accept=".xlsx, .xls"
            onChange={handleFileChange}
            className="et-file-input"
          />
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`et-drag-drop-zone ${dragging ? "et-dragging" : ""}`}
          >
            {dragging ? "Drop the file here..." : "Or drag and drop an Excel file here"}
          </div>
        </div>
      )}

      <div className="et-tables-wrapper">
        {excelTables.map((excelTable, index) => (
          <div key={index} className="et-table-container">
            <div className="et-table-header">
              <h3 className="et-table-title">
                {excelTable.title || `Table ${index + 1}`}
              </h3>
              <button 
                className="et-delete-btn"
                onClick={() => deleteExcelTable(excelTable.title)}
              >
                Delete Table
              </button>
            </div>
            <div className="et-table-scroll-container">
              <table className="et-data-table">
                <thead className="et-table-head">
                  <tr>
                    {excelTable.headers.map((header, headerIndex) => (
                      <th key={headerIndex} className="et-table-header-cell">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="et-table-body">
                  {excelTable.data.map((row, rowIndex) => (
                    <tr key={rowIndex} className="et-table-row">
                      {row.map((cell, cellIndex) => (
                        <td key={cellIndex} className="et-table-cell">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExcelTables;