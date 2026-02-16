import React, { useState } from "react";
import { FaFileMedical, FaChartLine, FaCalendarAlt, FaDownload, FaFilter, FaSearch, FaEye, FaClock, FaCheckCircle, FaExclamationTriangle, FaTimes, FaSpinner, FaFileUpload } from "react-icons/fa";
import "./ReportSummary.css";

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ hasError: true, error });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h2>Something went wrong</h2>
          <p>{this.state.error?.message || 'An error occurred while rendering report.'}</p>
          <button onClick={() => this.setState({ hasError: false, error: null })}>
            Try Again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function ReportSummary() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [selectedReport, setSelectedReport] = useState(null);
  const [error, setError] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  // API Configuration
  const API_BASE_URL = 'http://localhost:8002';

  const handleFileSelect = (file) => {
    if (file && file.type === 'application/pdf') {
      setUploadedFile(file);
      setError(null);
    } else {
      setError('Please upload a PDF file');
    }
  };

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

  const formatFileName = (fileName) => {
    if (fileName.length > 20) {
      return fileName.substring(0, 17) + '...';
    }
    return fileName;
  };

  // Handle file upload
  const handleUploadReport = async (file) => {
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_BASE_URL}/upload/summarize-pdf`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Debug: Log the entire backend response
      console.log('Backend response:', data);
      console.log('Prediction data:', data.prediction);
      
      if (data.success) {
        // Add new report to the list
        const predictionData = data.prediction || {};
        const summaryData = predictionData.summary || {};
        
        // Debug: Log each field we're trying to access
        console.log('Executive summary:', summaryData.executive_summary);
        console.log('Key findings:', summaryData.key_findings);
        console.log('Risk assessment:', summaryData.risk_assessment);
        console.log('Recommendations:', summaryData.recommendations);
        console.log('Follow up:', summaryData.follow_up);
        
        // Debug: Log all keys in prediction object
        console.log('All prediction keys:', Object.keys(predictionData));
        console.log('Full prediction object:', JSON.stringify(predictionData, null, 2));
        
        // Create completely safe report object - access nested summary object
        const newReport = {
          id: reports.length + 1,
          title: `Medical Report - ${new Date().toLocaleDateString()}`,
          date: new Date().toISOString().split('T')[0],
          type: "AI Summary",
          status: "completed",
          summary: typeof summaryData.patient_summary === 'string' ? summaryData.patient_summary : 'Report processed successfully',
          recommendations: Array.isArray(summaryData.recommendations) ? summaryData.recommendations : [],
          insights: Array.isArray(summaryData.insights) ? summaryData.insights : [],
          executiveSummary: typeof summaryData.executive_summary === 'string' ? summaryData.executive_summary : '',
          keyFindings: typeof summaryData.key_findings === 'string' ? summaryData.key_findings : '',
          riskAssessment: typeof summaryData.risk_assessment === 'string' ? summaryData.risk_assessment : '',
          followUp: typeof summaryData.follow_up === 'string' ? summaryData.follow_up : ''
        };
        
        // Log to debug
        console.log('New report created:', newReport);
        console.log('Current reports array:', reports);
        console.log('About to set reports to:', [newReport, ...reports]);
        
        setReports([newReport, ...reports]);
        console.log('Reports after set:', [newReport, ...reports]);
      } else {
        setError('Failed to process report: ' + (data.message || 'Unknown error'));
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError('Failed to connect to analysis service. Please ensure backend is running on port 8002.');
    } finally {
      setLoading(false);
    }
  };

  // Filter reports based on search and type
  const filteredReports = reports.filter(report => {
    const matchesSearch = report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.summary.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || report.type.toLowerCase().includes(filterType.toLowerCase());
    return matchesSearch && matchesFilter;
  });

  // Helper functions
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return '#10B981';
      case 'processing': return '#F59E0B';
      case 'failed': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getRiskColor = (level) => {
    switch (level) {
      case 'low': return '#10B981';
      case 'moderate': return '#F59E0B';
      case 'high': return '#EF4444';
      default: return '#6B7280';
    }
  };

  return (
    <ErrorBoundary>
      <div className="report-summary-container">
        {/* Header */}
        <div className="summary-header">
          <div className="header-content">
            <div className="header-icon">
              <FaFileMedical />
            </div>
            <div>
              <h1>Medical Report Summary</h1>
              <p>AI-generated comprehensive health insights and analysis</p>
            </div>
          </div>
          
        </div>

        <div className="summary-content">
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
                  id="pdfFileSummary"
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
                      onClick={() => document.getElementById('pdfFileSummary').click()}
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
                      onClick={() => document.getElementById('pdfFileSummary').click()}
                    >
                      Change File
                    </button>
                  </div>
                )}
              </div>
              
              <button 
                className={`analyze-button ${loading ? "loading" : ""}`} 
                onClick={() => handleUploadReport(uploadedFile)} 
                disabled={!uploadedFile || loading}
              >
                {loading ? (
                  <>
                    <FaSpinner className="button-spinner" />
                    Generating Summary...
                  </>
                ) : (
                  <>
                    <FaChartLine />
                    Generate Summary
                  </>
                )}
              </button>
              
              {error && (
                <div className="error-message">
                  <FaExclamationTriangle />
                  {error}
                </div>
              )}
            </div>
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

        {/* Search and Filter */}
        <div className="controls-section">
          <div className="search-bar">
            <FaSearch />
            <input
              type="text"
              placeholder="Search reports..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="filter-controls">
            <div className="filter-dropdown">
              <FaFilter />
              <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                <option value="all">All Reports</option>
                <option value="diabetes">Diabetes Analysis</option>
                <option value="medication">Medication Reports</option>
                <option value="laboratory">Lab Results</option>
              </select>
            </div>
          </div>
        </div>

        {/* Reports Grid */}
        <div className="reports-grid">
          {filteredReports.map((report) => (
            <div key={report.id} className="report-card" onClick={() => setSelectedReport(report)}>
              <div className="report-header">
                <div className="report-info">
                  <h3>{report.title}</h3>
                  <div className="report-meta">
                    <span className="report-date">
                      <FaCalendarAlt />
                      {formatDate(report.date)}
                    </span>
                    <span className={`report-type ${report.type.toLowerCase()}`}>
                      {report.type}
                    </span>
                    <span className={`report-status ${report.status}`} style={{ 
                      backgroundColor: getStatusColor(report.status) 
                    }}>
                      {report.status}
                    </span>
                  </div>
                </div>
                <div className="report-actions">
                  <button className="view-btn">
                    <FaEye />
                  </button>
                  <button className="download-btn">
                    <FaDownload />
                  </button>
                </div>
              </div>

              <div className="report-summary">
                <p>{typeof report.summary === 'string' ? report.summary : 'Report summary available'}</p>
              </div>

              {/* Recommendations */}
              {report.recommendations && (
                <div className="recommendations-section">
                  <h4>
                    <FaChartLine />
                    AI Recommendations
                  </h4>
                  <div className="recommendations-list">
                    {(Array.isArray(report.recommendations) ? report.recommendations : []).map((rec, index) => (
                      <div key={index} className="recommendation-item">
                        <FaCheckCircle />
                        <span>{rec}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Executive Summary */}
              {report.executiveSummary && typeof report.executiveSummary === 'string' && (
                <div className="detail-section">
                  <h4>Executive Summary</h4>
                  <p style={{backgroundColor: '#e8f5e8', padding: '10px', border: '2px solid #e8f5e8'}}>{report.executiveSummary}</p>
                </div>
              )}

              {/* Key Findings */}
              {report.keyFindings && typeof report.keyFindings === 'string' && (
                <div className="detail-section">
                  <h4>Key Findings</h4>
                  <p style={{backgroundColor: '#fff3cd', padding: '10px', border: '2px solid #fff3cd'}}>{report.keyFindings}</p>
                </div>
              )}

              {/* Risk Assessment */}
              {report.riskAssessment && typeof report.riskAssessment === 'string' && (
                <div className="detail-section">
                  <h4>Risk Assessment</h4>
                  <p style={{backgroundColor: '#f8d7da', padding: '10px', border: '2px solid #f8d7da'}}>{report.riskAssessment}</p>
                </div>
              )}

              {/* Follow Up - REMOVED */}
            </div>
          ))}
        </div>

        {/* Report Detail Modal */}
        {selectedReport && (
          <div className="modal-overlay" onClick={() => setSelectedReport(null)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>{selectedReport.title}</h2>
                <button className="close-btn" onClick={() => setSelectedReport(null)}>
                  ×
                </button>
              </div>
              <div className="modal-body">
                <div className="report-details">
                  <div className="detail-section">
                    <h4>Report Information</h4>
                    <div className="detail-grid">
                      <div className="detail-item">
                        <span className="detail-label">Date:</span>
                        <span className="detail-value">{formatDate(selectedReport.date)}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Type:</span>
                        <span className="detail-value">{selectedReport.type}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Status:</span>
                        <span className="detail-value" style={{ 
                          color: getStatusColor(selectedReport.status) 
                        }}>
                          {selectedReport.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="detail-section">
                    <h4>Summary</h4>
                    <p>{typeof selectedReport.summary === 'string' ? selectedReport.summary : 'Report summary available'}</p>
                  </div>

                  {selectedReport.recommendations && (
                    <div className="detail-section">
                      <h4>Recommendations</h4>
                      <ul>
                        {(Array.isArray(selectedReport.recommendations) ? selectedReport.recommendations : []).map((rec, index) => (
                          <li key={index}>{rec}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {selectedReport.executiveSummary && typeof selectedReport.executiveSummary === 'string' && (
                    <div className="detail-section">
                      <h4>Executive Summary</h4>
                      <p>{selectedReport.executiveSummary}</p>
                    </div>
                  )}

                  {selectedReport.keyFindings && typeof selectedReport.keyFindings === 'string' && (
                    <div className="detail-section">
                      <h4>Key Findings</h4>
                      <p>{selectedReport.keyFindings}</p>
                    </div>
                  )}

                  {selectedReport.riskAssessment && typeof selectedReport.riskAssessment === 'string' && (
                    <div className="detail-section">
                      <h4>Risk Assessment</h4>
                      <p>{selectedReport.riskAssessment}</p>
                    </div>
                  )}
                  {/* Follow Up - REMOVED */}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
}
