import React, { useState, useEffect } from 'react';
import { Worker, Viewer } from '@react-pdf-viewer/core';
import '@react-pdf-viewer/core/lib/styles/index.css';

const PDFViewer = ({ filePath }) => {
  const [error, setError] = useState(false); // State to track errors

  useEffect(() => {
    // Reset error state when filePath changes
    setError(false);
  }, [filePath]);

  const handleError = (error) => {
    console.error("PDF Error:", error);
    setError(true); // Update error state if there's an issue
  };

  console.log("Rendering PDF from file path:", filePath); // Log filePath to ensure it's correct

  return (
    <div style={{ height: '500px', overflow: 'auto' }}>
      {error ? (
        <div style={{ textAlign: 'center', color: 'red' }}>
          <p>Unable to load the PDF. Please try again later.</p>
        </div>
      ) : (
        <Worker workerUrl={`https://unpkg.com/pdfjs-dist@2.10.377/build/pdf.worker.min.js`}>
          <Viewer fileUrl={filePath} onError={handleError} />
        </Worker>
      )}
    </div>
  );
};

export default PDFViewer;
