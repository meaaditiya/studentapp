import React, { useState, useEffect } from 'react';
import axios from 'axios';
// Replace with your actual CSS file name

const PDFManager = () => {
  const [pdfs, setPdfs] = useState([]);
  const [file, setFile] = useState(null);

  useEffect(() => {
    fetchPDFs();
  }, []);

  // Fetch all PDFs
  const fetchPDFs = async () => {
    try {
      const res = await axios.get('http://192.168.1.42:5000/api/pdfs'); // Updated URL
      setPdfs(res.data);
    } catch (error) {
     /* console.error("Failed to fetch PDFs");*/
    }
  };

  // Handle file selection
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  // Upload PDF
  const uploadPDF = async () => {
    const formData = new FormData();
    formData.append('pdf', file);

    try {
      await axios.post('http://192.168.1.42:5000/api/upload', formData); // Updated URL
      fetchPDFs();
      alert("PDF uploaded successfully");
    } catch (error) {
     /* console.error("Failed to upload PDF");*/
    }
  };

  // Delete PDF
  const deletePDF = async (id) => {
    try {
      await axios.delete(`http://192.168.1.42:5000/api/pdfs/${id}`); // Updated URL
      fetchPDFs();
      alert("PDF deleted successfully");
    } catch (error) {
      /*console.error("Failed to delete PDF");*/
    }
  };

  // Open PDF in Edge
  const openPDF = (id) => {
    window.open(`http://192.168.1.42:5000/api/pdfs/${id}`, '_blank'); // Updated URL
  };

  return (
    <div className="pdf-manager">
      <h1 className="pdf-manager-title">Document Manager</h1>

      <input type="file" className="pdf-file-input" onChange={handleFileChange} />
      <button className="pdf-upload-button" onClick={uploadPDF}>Upload Document</button>

      <h2 className="pdf-list-title">Available Documents</h2>
      <ul className="pdf-list">
        {pdfs.map((pdf) => (
          <li key={pdf._id} className="pdf-list-item">
            {pdf.name}
            <div className="pdf-list-buttons">
              <button className="pdf-view-button" onClick={() => openPDF(pdf._id)}>View</button>
              <button className="pdf-delete-button" onClick={() => deletePDF(pdf._id)}>Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PDFManager;
