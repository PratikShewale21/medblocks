import React, { useState } from "react";
import { FaHeartbeat, FaUserMd, FaChartLine, FaShieldAlt, FaExclamationTriangle, FaCheckCircle, FaFileUpload, FaFileMedical } from "react-icons/fa";
import "./AiScan.css";

export default function AiScan() {
  const [result, setResult] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [extractedData, setExtractedData] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState(null);

  // API Configuration
  const API_BASE_URL = 'http://localhost:8002';

  // Handle file selection
  const handleFileSelect = (file) => {
    if (file && file.type === 'application/pdf') {
      setUploadedFile(file);
      setError(null);
      setResult(null);
      setExtractedData(null);
    } else {
      setError('Please upload a PDF file');
    }
  };

  // Handle drag events
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  // Upload and analyze medical report
  const uploadAndAnalyze = async () => {
    if (!uploadedFile) {
      setError('Please select a medical report first');
      return;
    }

    setUploading(true);
    setError(null);
    setResult(null);
    setExtractedData(null);

    try {
      console.log('Starting upload for file:', uploadedFile.name);
      
      const formData = new FormData();
      formData.append('file', uploadedFile);

      console.log('Sending request to:', `${API_BASE_URL}/upload/diabetes-report`);
      
      const response = await fetch(`${API_BASE_URL}/upload/diabetes-report`, {
        method: 'POST',
        body: formData
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Full response structure:', JSON.stringify(data, null, 2));
      
      if (data.success) {
        console.log('Extracted data:', data.extracted_data);
        console.log('Prediction result:', data.prediction);
        console.log('Available keys in data.prediction:', Object.keys(data.prediction || {}));
        
        setExtractedData(data.extracted_data);
        setResult(data.prediction);
      } else {
        console.error('API returned success=false:', data);
        setError('Failed to analyze medical report: ' + (data.message || 'Unknown error'));
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError('Failed to connect to the analysis service. Please ensure the backend is running on port 8002. Error: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const getRiskColor = (level) => {
    switch(level?.toLowerCase()) {
      case 'high': return '#ef4444';
      case 'moderate': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#6b7280';
    }
  };

  const formatFileName = (fileName) => {
    if (fileName.length > 20) {
      return fileName.substring(0, 17) + '...';
    }
    return fileName;
  };

  return (
    <div className="ai-scan-container">
      <div className="scan-header">
        <div className="header-content">
          <div className="header-icon">
            <FaFileMedical />
          </div>
          <div>
            <h1>AI Diabetes Risk Assessment</h1>
            <p>Upload medical reports for advanced predictive analysis</p>
          </div>
        </div>
      
      </div>

      <div className="scan-content">
        {/* Upload Section */}
        <div className="upload-section">
          <div className="upload-card">
            <h3>Medical Report Upload</h3>
            
            <div 
              className={`upload-area ${dragActive ? 'drag-active' : ''} ${uploadedFile ? 'has-file' : ''}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                type="file"
                id="pdfFile"
                accept=".pdf"
                onChange={(e) => e.target.files[0] && handleFileSelect(e.target.files[0])}
                style={{ display: 'none' }}
              />
              
              {!uploadedFile ? (
                <div className="upload-prompt">
                  <FaFileUpload className="upload-icon" />
                  <h4>Upload Medical Report</h4>
                  <p>Drag & drop PDF here or click to browse</p>
                  <button 
                    className="browse-btn"
                    onClick={() => document.getElementById('pdfFile').click()}
                  >
                    Choose File
                  </button>
                </div>
              ) : (
                <div className="file-selected">
                  <FaFileMedical className="file-icon" />
                  <div className="file-info">
                    <h4>{formatFileName(uploadedFile.name)}</h4>
                    <p>{(uploadedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                  <button 
                    className="change-file-btn"
                    onClick={() => document.getElementById('pdfFile').click()}
                  >
                    Change File
                  </button>
                </div>
              )}
            </div>
            
            <button 
              className={`analyze-button ${uploading ? "loading" : ""}`} 
              onClick={uploadAndAnalyze} 
              disabled={!uploadedFile || uploading}
            >
              {uploading ? (
                <>
                  <div className="spinner"></div>
                  Analyzing Medical Report...
                </>
              ) : (
                <>
                  <FaChartLine />
                  Analyze Report
                </>
              )}
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="error-section">
            <div className="error-card">
              <FaExclamationTriangle />
              <p>{error}</p>
            </div>
          </div>
        )}

        {/* Extracted Data Display */}
        {extractedData && (
          <div className="extracted-data-section">
            <div className="data-card">
              <h3>Extracted Medical Data</h3>
              <div className="data-grid">
                {Object.entries(extractedData).map(([key, value]) => (
                  <div key={key} className="data-item">
                    <span className="data-label">{key.replace(/_/g, ' ').toUpperCase()}</span>
                    <span className="data-value">{value || 'Not detected'}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Results Section */}
        {result && result.diabetes_prediction && (
          <div className="results-section">
            <div className="result-card">
              <div className="result-header">
                <h3>Diabetes Risk Analysis</h3>
                {result.diabetes_prediction.risk_level && (
                  <div 
                    className="risk-badge" 
                    style={{ backgroundColor: getRiskColor(result.diabetes_prediction.risk_level) }}
                  >
                    {result.diabetes_prediction.risk_level} RISK
                  </div>
                )}
              </div>

              {result.diabetes_prediction.prediction !== undefined && (
                <div className="prediction-display">
                  <div className="prediction-status">
                    {result.diabetes_prediction.prediction === 1 ? (
                      <div className="status-indicator high-risk">
                        <FaExclamationTriangle />
                        <span>Diabetes Risk Detected</span>
                      </div>
                    ) : (
                      <div className="status-indicator normal">
                        <FaCheckCircle />
                        <span>Normal Health Indicators</span>
                      </div>
                    )}
                  </div>
                  
                  {result.diabetes_prediction.risk_percentage && (
                    <div className="risk-score">
                      <div className="score-circle">
                        <div className="score-value">{result.diabetes_prediction.risk_percentage}%</div>
                        <div className="score-label">Risk Score</div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Summary Display */}
              {result.diabetes_prediction.summary && (
                <div className="summary-section">
                  <h4>
                    <FaUserMd />
                    Medical Summary
                  </h4>
                  <div className="summary-content">
                    <p>{result.diabetes_prediction.summary}</p>
                  </div>
                </div>
              )}

              {/* Warnings */}
              {result.diabetes_prediction.warnings && result.diabetes_prediction.warnings.length > 0 && (
                <div className="warnings-section">
                  <h4>Warnings</h4>
                  <div className="warnings-list">
                    {result.diabetes_prediction.warnings.map((warning, index) => (
                      <div key={index} className="warning-item">
                        <FaExclamationTriangle />
                        <span>{warning}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="action-buttons">
                <button 
                  className="btn-secondary"
                  onClick={() => {
                    const reportData = {
                      prediction: result.diabetes_prediction,
                      extractedData: extractedData,
                      timestamp: new Date().toISOString(),
                      fileName: uploadedFile.name
                    };
                    
                    const blob = new Blob([JSON.stringify(reportData, null, 2)], {
                      type: 'application/json'
                    });
                    
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `diabetes-report-${Date.now()}.json`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                  }}
                >
                  Download Report
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
