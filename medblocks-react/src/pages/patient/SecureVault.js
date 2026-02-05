import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaFilePdf, FaFileImage, FaCloudUploadAlt, FaLink, FaCheckDouble } from 'react-icons/fa';
import './SecureVault.css';

const SecureVault = () => {
  const [files] = useState([
    {
      id: 1,
      name: 'Blood Test Report.pdf',
      date: 'Dec 15, 2025',
      size: '2.4 MB',
      type: 'pdf',
      verified: true
    },
    {
      id: 2,
      name: 'Radiology_Scan_Xray.pdf',
      date: 'Dec 20, 2025',
      size: '5.1 MB',
      type: 'pdf',
      verified: true
    },
    {
      id: 3,
      name: 'MRI Scan Output.jpg',
      date: 'Jan 05, 2026',
      size: '8.2 MB',
      type: 'image',
      verified: true
    }
  ]);

  const handleUpload = () => {
    // Simulate file upload
    alert('Upload functionality would open file picker');
  };

  const handleViewSummary = (fileId) => {
    // Simulate viewing summary
    alert(`Viewing AI-generated summary for file ${fileId}`);
  };

  return (
    <>
      <header>
        <Link to="/patient" className="logo">MedBlocks</Link>
        <div className="wallet">
          <FaLink />
          <span>0x71C...A4f</span>
        </div>
      </header>

      <section className="hero">
        <h1>Secure Vault</h1>
        <button className="btn-upload" onClick={handleUpload}>
          <FaCloudUploadAlt />
          Upload New Report
        </button>
      </section>

      <main className="container">
        {files.map((file) => (
          <div key={file.id} className="file-card">
            <div className={`file-icon ${file.type === 'image' ? 'mri-icon' : ''}`}>
              {file.type === 'image' ? (
                <FaFileImage />
              ) : (
                <FaFilePdf />
              )}
            </div>
            <div className="file-info">
              <div className="file-name">{file.name}</div>
              <div className="file-date">{file.date} • {file.size}</div>
            </div>
            <span className="tag-verified">
              <FaCheckDouble />
              Blockchain Verified
            </span>
            <button 
              className="btn-summary"
              onClick={() => handleViewSummary(file.id)}
            >
              View Summary
            </button>
          </div>
        ))}
      </main>
    </>
  );
};

export default SecureVault;
