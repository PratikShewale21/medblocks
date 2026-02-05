import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaFilePdf, FaMagic, FaLink } from 'react-icons/fa';
import './AiScan.css';

const AiScan = () => {
  const [selectedDoc, setSelectedDoc] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [extractedData, setExtractedData] = useState({
    glucose: '--',
    bp: '--',
    age: '--',
    bmi: '--'
  });

  const documents = [
    {
      name: 'Blood_Report_Dec25.pdf',
      ipfs: 'QmXy...p8q'
    },
    {
      name: 'Annual_Checkup_2025.pdf',
      ipfs: 'QmZb...3k2'
    }
  ];

  const handleProcess = async () => {
    setIsProcessing(true);
    
    // Simulate AI processing
    setTimeout(() => {
      setExtractedData({
        glucose: '112 mg/dL',
        bp: '125/82 mmHg',
        age: '45 years',
        bmi: '26.8 kg/m²'
      });
      setIsProcessing(false);
      setShowResult(true);
    }, 3000);
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
        <h1>AI Risk Scan</h1>
        <p className="hero-subtitle">Select a report from your vault to begin automated diagnostic extraction.</p>
      </section>

      <main className="container">
        <div className="selection-card">
          <h3>Select Source</h3>
          {documents.map((doc, index) => (
            <div 
              key={index}
              className={`doc-item ${selectedDoc === index ? 'selected' : ''}`}
              onClick={() => setSelectedDoc(index)}
            >
              <FaFilePdf className="icon-red" />
              <div>
                <p className="doc-name">{doc.name}</p>
                <p className="doc-meta">IPFS: {doc.ipfs}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="analysis-card">
          <h3>Automated Data Extraction</h3>
          <p className="analysis-subtitle">The AI will mine clinical entities from selected document.</p>

          <div className="extraction-grid">
            <div className="data-point">
              <div className="data-label">Blood Glucose</div>
              <div className="data-value" id="val-glucose">{extractedData.glucose}</div>
            </div>
            <div className="data-point">
              <div className="data-label">Systolic BP</div>
              <div className="data-value" id="val-bp">{extractedData.bp}</div>
            </div>
            <div className="data-point">
              <div className="data-label">Age (Extracted)</div>
              <div className="data-value" id="val-age">{extractedData.age}</div>
            </div>
            <div className="data-point">
              <div className="data-label">BMI (Extracted)</div>
              <div className="data-value" id="val-bmi">{extractedData.bmi}</div>
            </div>
          </div>

          <button 
            className="btn-process" 
            onClick={handleProcess}
            disabled={isProcessing}
          >
            <FaMagic />
            {isProcessing ? 'Processing...' : 'Run AI Analysis'}
          </button>

          {showResult && (
            <div id="result" className="result-overlay" style={{ display: 'block' }}>
              <span className="status-badge">Analysis Complete</span>
              <div className="risk-score">Diabetes Risk: 12%</div>
              <p className="verification-text">
                Values verified against Blockchain CID: 0x7a...f4d. The extraction is accurate based on current clinical standards.
              </p>
            </div>
          )}
        </div>
      </main>
    </>
  );
};

export default AiScan;
