import React, { useState, useEffect } from 'react';
import { X, Download, ZoomIn, ZoomOut, RotateCw } from 'lucide-react';
import { Document, Page, pdfjs } from 'react-pdf';
import {  
  Eye, 
  EyeOff, 
   } from 'lucide-react';
   pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@4.8.69/build/pdf.worker.min.js`;
import '../ComponentCSS/PDFManager.css'
const PDFManager = () => {
  const [pdfs, setPdfs] = useState([]);
  const [file, setFile] = useState(null);
  const [selectedPDF, setSelectedPDF] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const[showdocument , setdocument]=useState(false);
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [workerError, setWorkerError] = useState(false);

  useEffect(() => {
    loadPDFWorker().catch(() => setWorkerError(true));
    fetchPDFs();
  }, []);
  const loadPDFWorker = async () => {
    try {
      await pdfjs.getDocument(`https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`);
    } catch (error) {
      console.error('PDF Worker failed to load:', error);
      // Fallback to local worker if CDN fails
      pdfjs.GlobalWorkerOptions.workerSrc = `/pdf.worker.min.js`;
    }
  };
  const fetchPDFs = async () => {
    try {
      setLoading(true);
      const response = await fetch('https://studentapp-backend-ccks.onrender.com/api/pdfs');
      if (!response.ok) throw new Error('Failed to fetch PDFs');
      const data = await response.json();
      setPdfs(data);
    } catch (error) {
      alert('Failed to fetch PDFs');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile?.type === 'application/pdf') {
      setFile(selectedFile);
    } else {
      alert('Please select a valid PDF file');
      e.target.value = '';
    }
  };

  const uploadPDF = async () => {
    if (!file) {
      alert('Please select a file first');
      return;
    }

    const formData = new FormData();
    formData.append('pdf', file);

    try {
      setLoading(true);
      const response = await fetch('https://studentapp-backend-ccks.onrender.com/api/upload', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) throw new Error('Upload failed');
      await fetchPDFs();
      setFile(null);
      alert('PDF uploaded successfully');
    } catch (error) {
      alert('Failed to upload PDF');
    } finally {
      setLoading(false);
    }
  };

  const deletePDF = async (id) => {
    if (window.confirm('Are you sure you want to delete this PDF?')) {
      try {
        setLoading(true);
        const response = await fetch(`https://studentapp-backend-ccks.onrender.com/api/pdfs/${id}`, {
          method: 'DELETE',
        });
        if (!response.ok) throw new Error('Delete failed');
        await fetchPDFs();
        if (selectedPDF?._id === id) {
          setSelectedPDF(null);
          setIsViewerOpen(false);
        }
        alert('PDF deleted successfully');
      } catch (error) {
        alert('Failed to delete PDF');
      } finally {
        setLoading(false);
      }
    }
  };

  const openPDFViewer = (pdf) => {
    setSelectedPDF(pdf);
    setIsViewerOpen(true);
    setScale(1);
    setRotation(0);
  };

  const handleDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  const zoomIn = () => setScale((prev) => Math.min(prev + 0.2, 3));
  const zoomOut = () => setScale((prev) => Math.max(prev - 0.2, 0.5));
  const rotate = () => setRotation((prev) => (prev + 90) % 360);

  const downloadPDF = async (id, name) => {
    try {
      const response = await fetch(`https://studentapp-backend-ccks.onrender.com/api/pdfs/${id}`);
      if (!response.ok) throw new Error('Download failed');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = name;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      alert('Failed to download PDF');
    }
  };

  return (
    <div className="pdf-manager-container">
      <div className="pdf-manager-header">
        <h1 className="pdf-manager-title">Document Manager</h1>
        <div className="pdf-manager-upload-section">
          <div className="pdf-manager-file-input-wrapper">
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              id="pdf-manager-file-input"
            />
            <label htmlFor="pdf-manager-file-input" className="pdf-manager-file-label">
              Choose PDF
            </label>
          </div>
          <button
            className="pdf-manager-btn-primary"
            onClick={uploadPDF}
            disabled={!file || loading}
          >
            {loading ? 'Uploading...' : 'Upload Document'}
          </button>
        </div>
      </div>
  
      <div className="pdf-manager-content">
      <button className=" toggle-button"onClick={()=>setdocument(!showdocument)}>{showdocument? <EyeOff className="icon" /> : <Eye className="icon" />}Open PDFs</button>
      {showdocument &&(
        <div className="pdf-manager-list-container">
          {loading && !isViewerOpen && (
            <div className="pdf-manager-loading">
              <div className="pdf-manager-spinner"></div>
              <p className="pdf-manager-loading-text">Loading PDF...</p>
            </div>
          )}
          <ul className="pdf-manager-list">
            {pdfs.map((pdf) => (
              <li key={pdf._id} className="pdf-manager-list-item">
                <span className="pdf-manager-list-item-name">{pdf.name}</span>
                <div className="pdf-manager-actions">
                  <button
                    className="pdf-manager-btn-secondary"
                    onClick={() => openPDFViewer(pdf)}
                  >
                    View
                  </button>
                  <button
                    className="pdf-manager-btn-icon pdf-manager-download"
                    onClick={() => downloadPDF(pdf._id, pdf.name)}
                  >
                    <Download size={16} />
                  </button>
                  <button
                    className="pdf-manager-btn-icon pdf-manager-delete"
                    onClick={() => deletePDF(pdf._id)}
                  >
                    <X size={16} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>)}
        
        {isViewerOpen && selectedPDF && (
          <div className="pdf-manager-viewer">
            <div className="pdf-manager-viewer-header">
              <h3 className="pdf-manager-viewer-title">{selectedPDF.name}</h3>
              <div className="pdf-manager-viewer-controls">
                <button onClick={zoomOut} className="pdf-manager-btn-icon pdf-manager-zoom-out">
                  <ZoomOut size={20} />
                </button>
                <button onClick={zoomIn} className="pdf-manager-btn-icon pdf-manager-zoom-in">
                  <ZoomIn size={20} />
                </button>
                <button onClick={rotate} className="pdf-manager-btn-icon pdf-manager-rotate">
                  <RotateCw size={20} />
                </button>
                <button onClick={() => setIsViewerOpen(false)} className="pdf-manager-btn-icon pdf-manager-close">
                  <X size={20} />
                </button>
              </div>
            </div>
            <div className="pdf-manager-document-container">
              <Document
                file={`https://studentapp-backend-ccks.onrender.com/api/pdfs/${selectedPDF._id}`}
                onLoadSuccess={handleDocumentLoadSuccess}
                loading={
                  <div className="pdf-manager-loading">
                    <div className="pdf-manager-spinner"></div>
                    <p className="pdf-manager-loading-text">Loading PDF...</p>
                  </div>
                }
              >
                <div className="pdf-manager-pages-container">
                  {Array.from(new Array(numPages), (el, index) => (
                    <Page
                      key={`page_${index + 1}`}
                      pageNumber={index + 1}
                      scale={scale}
                      rotate={rotation}
                      className="pdf-manager-page"
                      renderTextLayer={false}
                      renderAnnotationLayer={false}
                    />
                  ))}
                </div>
              </Document>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};  
export default PDFManager;