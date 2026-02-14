import React, { useState, useEffect, useRef } from 'react';
import { FaLock, FaUpload, FaDownload, FaEye, FaShieldAlt, FaDatabase, FaCheckCircle, FaExclamationTriangle, FaTimes, FaFolderOpen, FaFileAlt, FaClock, FaUsers, FaNetworkWired } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import './SecureVault.css';

const SecureVault = () => {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [recordType, setRecordType] = useState('Prescription');
  const [notes, setNotes] = useState('');
  const [accessStatus, setAccessStatus] = useState(null);
  const [showSecurityInfo, setShowSecurityInfo] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(null);
  const [viewingFile, setViewingFile] = useState(null);
  const [downloadingFile, setDownloadingFile] = useState(null);
  const fileInputRef = useRef(null);

  // Mock data for demonstration
  const mockRecords = [
    {
      id: 1,
      fileName: 'blood_test_results.pdf',
      fileType: 'application/pdf',
      fileSize: '2.4 MB',
      recordType: 'Lab Report',
      uploadDate: '2024-01-15',
      addedBy: 'Dr. Sarah Johnson',
      verified: true,
      ipfsHash: 'QmXoypizjP3W3Uv6XJ1F9Q7V8H5K9s2L7m',
      transactionHash: '0x742d35Cc6634C05329E5d3A8D4F8E6B7A9F2E7',
      etherscanLink: 'https://sepolia.etherscan.io/tx/0x742d35Cc6634C05329E5d3A8D4F8E6B7A9F2E7'
    },
    {
      id: 2,
      fileName: 'mri_scan.jpg',
      fileType: 'image/jpeg',
      fileSize: '1.8 MB',
      recordType: 'MRI',
      uploadDate: '2024-01-10',
      addedBy: 'Dr. Michael Chen',
      verified: true,
      ipfsHash: 'QmY8pLz7vQ9K2m6W3X1J4F9Q7V8H5K9s2L7m',
      transactionHash: '0x9a1b2c3d4e5f6a7b8c9d0e1f2g3h4i5j6',
      etherscanLink: 'https://sepolia.etherscan.io/tx/0x9a1b2c3d4e5f6a7b8c9d0e1f2g3h4i5j6'
    },
    {
      id: 3,
      fileName: 'insurance_policy.pdf',
      fileType: 'application/pdf',
      fileSize: '3.1 MB',
      recordType: 'Insurance',
      uploadDate: '2024-01-05',
      addedBy: 'Patient',
      verified: true,
      ipfsHash: 'QmZ3n4o5p6q7r8s9t0u1v2w3x4y5z6',
      transactionHash: '0xb2c3d4e5f6a7b8c9d0e1f2g3h4i5j6',
      etherscanLink: 'https://sepolia.etherscan.io/tx/0xb2c3d4e5f6a7b8c9d0e1f2g3h4i5j6'
    }
  ];

  useEffect(() => {
    // Load records from localStorage or use mock data
    const storedRecords = JSON.parse(localStorage.getItem('medicalRecords') || '[]');
    if (storedRecords.length === 0) {
      setRecords(mockRecords);
      localStorage.setItem('medicalRecords', JSON.stringify(mockRecords));
    } else {
      setRecords(storedRecords);
    }

    // Load access status
    const storedAccess = JSON.parse(localStorage.getItem('accessStatus') || null);
    setAccessStatus(storedAccess);

    // Check for upload success message
    const successMessage = localStorage.getItem('uploadSuccess');
    if (successMessage) {
      setUploadSuccess(successMessage);
      setTimeout(() => localStorage.removeItem('uploadSuccess'), 5000);
    }
  }, []);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setUploadProgress(0);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      setSelectedFile(files[0]);
      setUploadProgress(0);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setLoading(true);
    setUploadProgress(0);

    // Simulate upload progress
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 200);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newRecord = {
        id: Date.now(),
        fileName: selectedFile.name,
        fileType: selectedFile.type,
        fileSize: `${(selectedFile.size / 1024 / 1024).toFixed(1)} MB`,
        recordType: recordType,
        uploadDate: new Date().toISOString().split('T')[0],
        addedBy: user?.name || 'Patient',
        verified: false,
        ipfsHash: `Qm${Math.random().toString(36).substring(2, 15)}...${Math.random().toString(36).substring(2, 15)}`,
        transactionHash: `0x${Math.random().toString(16).substring(2, 66)}`,
        etherscanLink: `https://sepolia.etherscan.io/tx/0x${Math.random().toString(16).substring(2, 66)}`
      };

      const updatedRecords = [...records, newRecord];
      setRecords(updatedRecords);
      localStorage.setItem('medicalRecords', JSON.stringify(updatedRecords));

      setUploadProgress(100);
      setUploadSuccess({
        fileName: selectedFile.name,
        ipfsHash: newRecord.ipfsHash,
        transactionHash: newRecord.transactionHash
      });

      setSelectedFile(null);
      setNotes('');
      setRecordType('Prescription');
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setLoading(false);
      clearInterval(progressInterval);
      setUploadProgress(0);
    }
  };

  const handleView = async (record) => {
    if (viewingFile === record.id) return; // Prevent multiple clicks
    
    setViewingFile(record.id);
    
    try {
      // Simulate loading from IPFS
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Create a mock file for demonstration
      const mockFileContent = generateMockFileContent(record);
      
      // Create blob URL for viewing
      const blob = new Blob([mockFileContent], { type: record.fileType });
      const fileUrl = URL.createObjectURL(blob);
      
      // Open in new tab for viewing
      window.open(fileUrl, '_blank');
      
      // Clean up the URL after a delay
      setTimeout(() => URL.revokeObjectURL(fileUrl), 1000);
      
      showNotification(`Viewing ${record.fileName}`, 'info');
    } catch (error) {
      console.error('Error viewing file:', error);
      showNotification('Failed to view file', 'error');
    } finally {
      setViewingFile(null);
    }
  };

  const handleDownload = async (record) => {
    if (downloadingFile === record.id) return; // Prevent multiple clicks
    
    setDownloadingFile(record.id);
    
    try {
      // Simulate downloading from IPFS
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Create a mock file for demonstration
      const mockFileContent = generateMockFileContent(record);
      
      // Create blob and download
      const blob = new Blob([mockFileContent], { type: record.fileType });
      const fileUrl = URL.createObjectURL(blob);
      
      // Create download link
      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = record.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up the URL
      URL.revokeObjectURL(fileUrl);
      
      // Show success message
      showNotification(`${record.fileName} downloaded successfully!`, 'success');
    } catch (error) {
      console.error('Error downloading file:', error);
      showNotification('Failed to download file', 'error');
    } finally {
      setDownloadingFile(null);
    }
  };

  const generateMockFileContent = (record) => {
    // Generate realistic mock content based on record type
    const timestamp = new Date().toLocaleString();
    
    switch (record.recordType) {
      case 'Lab Report':
        return `LABORATORY REPORT
Patient: ${user?.name || 'John Doe'}
Date: ${timestamp}
Report ID: ${record.id}

BLOOD CHEMISTRY:
- Glucose: 95 mg/dL (Normal: 70-100)
- Cholesterol: 185 mg/dL (Normal: <200)
- Triglycerides: 120 mg/dL (Normal: <150)
- HDL: 45 mg/dL (Normal: >40)
- LDL: 110 mg/dL (Normal: <100)

COMPLETE BLOOD COUNT (CBC):
- White Blood Cells: 7.2 x10^9/L (Normal: 4.5-11.0)
- Red Blood Cells: 4.8 x10^12/L (Normal: 4.5-5.5)
- Hemoglobin: 14.5 g/dL (Normal: 13.5-17.5)
- Hematocrit: 43% (Normal: 41-50)
- Platelets: 250 x10^9/L (Normal: 150-450)

URINALYSIS:
- Color: Yellow
- Appearance: Clear
- pH: 6.5 (Normal: 4.5-8.0)
- Protein: Negative
- Glucose: Negative
- Ketones: Negative

IMPRESSION:
All laboratory values are within normal limits. No acute abnormalities detected.

RECOMMENDATIONS:
- Continue current medications as prescribed
- Maintain healthy diet and exercise
- Follow up in 3 months or as needed

This report is electronically signed and verified on the blockchain.
IPFS Hash: ${record.ipfsHash}
Transaction Hash: ${record.transactionHash}`;

      case 'MRI':
        return `MAGNETIC RESONANCE IMAGING REPORT
Patient: ${user?.name || 'John Doe'}
Date: ${timestamp}
Study ID: ${record.id}

EXAMINATION: Brain MRI without contrast
TECHNIQUE: T1-weighted, T2-weighted, FLAIR sequences
FIELD OF VIEW: 22 cm

FINDINGS:

BRAIN:
- Ventricles and sulci are normal in size and configuration
- No evidence of acute infarction or hemorrhage
- No space-occupying lesion detected
- Basal ganglia and thalami appear normal
- Cerebellum and brainstem appear normal
- Post-contrast images show no abnormal enhancement

SINUSES:
- Mild mucosal thickening in maxillary sinuses
- No evidence of acute sinusitis
- Air-fluid levels not seen

CONCLUSION:
No acute intracranial pathology identified. Brain parenchyma appears normal.
Mild inflammatory changes in maxillary sinuses may represent chronic sinusitis.

RECOMMENDATIONS:
- No acute findings requiring immediate intervention
- Consider ENT evaluation for chronic sinusitis symptoms
- Routine follow-up not required unless clinically indicated

This report is electronically signed and verified on the blockchain.
IPFS Hash: ${record.ipfsHash}
Transaction Hash: ${record.transactionHash}`;

      case 'Prescription':
        return `PRESCRIPTION
Patient: ${user?.name || 'John Doe'}
Date: ${timestamp}
Prescription ID: ${record.id}

PRESCRIBED MEDICATIONS:

1. Metformin 500 mg
   - Take 1 tablet twice daily with meals
   - For Type 2 Diabetes Mellitus
   - Quantity: 60 tablets (30 days)
   - Refills: 3

2. Lisinopril 10 mg
   - Take 1 tablet once daily in the morning
   - For Hypertension
   - Quantity: 30 tablets (30 days)
   - Refills: 3

3. Atorvastatin 20 mg
   - Take 1 tablet once daily at bedtime
   - For Hyperlipidemia
   - Quantity: 30 tablets (30 days)
   - Refills: 3

INSTRUCTIONS:
- Take all medications as prescribed
- Do not skip doses
- Contact your doctor if you experience any side effects
- Keep all follow-up appointments
- Store medications in a cool, dry place

PRESCRIBER: Dr. Sarah Johnson
LICENSE: MD123456
DEA #: AB1234567

This prescription is electronically signed and verified on the blockchain.
IPFS Hash: ${record.ipfsHash}
Transaction Hash: ${record.transactionHash}`;

      case 'Discharge':
        return `HOSPITAL DISCHARGE SUMMARY
Patient: ${user?.name || 'John Doe'}
Date of Admission: ${new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}
Date of Discharge: ${timestamp}
MRN: ${record.id}

ADMITTING DIAGNOSIS:
- Community-acquired pneumonia
- Type 2 Diabetes Mellitus
- Hypertension

HOSPITAL COURSE:
Patient was admitted for 7 days for treatment of community-acquired pneumonia.
Received appropriate antibiotic therapy with significant clinical improvement.
Blood glucose and blood pressure were monitored and optimized.

DISCHARGE CONDITION:
- Afebrile for 48 hours
- Respiratory symptoms resolved
- Vital signs stable
- Blood glucose controlled
- Blood pressure controlled

MEDICATIONS ON DISCHARGE:
1. Amoxicillin 875 mg - Complete course
2. Metformin 500 mg - Continue as prescribed
3. Lisinopril 10 mg - Continue as prescribed

FOLLOW-UP INSTRUCTIONS:
- Follow up with primary care physician in 1 week
- Complete antibiotic course as prescribed
- Monitor blood glucose daily
- Monitor blood pressure daily
- Return to ER if fever, shortness of breath, or worsening symptoms

ACTIVITY RESTRICTIONS:
- Light activity only for 3 days
- No heavy lifting for 1 week
- No strenuous exercise until cleared by physician

DIETARY RECOMMENDATIONS:
- Maintain diabetic diet
- Low sodium diet for hypertension
- Increase fluid intake
- Avoid alcohol until fully recovered

DISCHARGING PHYSICIAN: Dr. Michael Chen
DEA #: AB9876543

This discharge summary is electronically signed and verified on the blockchain.
IPFS Hash: ${record.ipfsHash}
Transaction Hash: ${record.transactionHash}`;

      case 'Insurance':
        return `INSURANCE CLAIM SUMMARY
Patient: ${user?.name || 'John Doe'}
Policy Number: POL123456789
Claim ID: ${record.id}
Date of Service: ${timestamp}

SERVICE DETAILS:
Provider: City General Hospital
Service Type: Inpatient Hospitalization
Dates of Service: ${new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toLocaleDateString()} - ${new Date().toLocaleDateString()}

DIAGNOSIS CODES:
- ICD-10 J18.9 - Pneumonia, unspecified organism
- ICD-10 E11.9 - Type 2 diabetes mellitus without complications
- ICD-10 I10 - Essential (primary) hypertension

PROCEDURES:
- Chest X-ray (2 views)
- Complete blood count
- Comprehensive metabolic panel
- Blood cultures
- Urinalysis

CHARGES:
- Room & Board: $2,500.00
- Emergency Room: $1,200.00
- Laboratory Tests: $850.00
- Radiology: $450.00
- Medications: $1,100.00
- Physician Services: $1,800.00
- Total Charges: $7,900.00

INSURANCE COVERAGE:
- Covered Amount: $7,900.00
- Patient Responsibility: $0.00
- Deductible: $500.00 (Met)
- Co-insurance: 20% (Waived)

STATUS: APPROVED
Payment Method: Direct billing to insurance company
Expected Payment: 14 business days

ADDITIONAL INFORMATION:
Pre-authorization obtained for inpatient stay.
All services deemed medically necessary.
No out-of-network services provided.

This claim summary is electronically signed and verified on the blockchain.
IPFS Hash: ${record.ipfsHash}
Transaction Hash: ${record.transactionHash}`;

      default:
        return `MEDICAL RECORD
Patient: ${user?.name || 'John Doe'}
Date: ${timestamp}
Record ID: ${record.id}
Record Type: ${record.recordType}

This is a medical record for ${record.recordType}.
The file contains relevant medical information that has been
encrypted and stored securely on the IPFS network.

File Details:
- File Name: ${record.fileName}
- File Type: ${record.fileType}
- File Size: ${record.fileSize}
- Upload Date: ${record.uploadDate}
- Added By: ${record.addedBy}
- Verification Status: ${record.verified ? 'Verified' : 'Pending'}

SECURITY INFORMATION:
- Encrypted using AES-256 encryption
- Stored on IPFS decentralized network
- Verified on Ethereum blockchain
- Patient-controlled access

This medical record is electronically signed and verified on the blockchain.
IPFS Hash: ${record.ipfsHash}
Transaction Hash: ${record.transactionHash}`;
    }
  };

  const showNotification = (message, type = 'info') => {
    // Create a simple notification (in production, use a proper toast library)
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 16px 20px;
      background: ${type === 'success' ? 'var(--success)' : 'var(--primary)'};
      color: white;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      z-index: 1000;
      font-size: 14px;
      max-width: 300px;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 3000);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getRecordIcon = (fileType) => {
    if (fileType.includes('pdf')) return '📄';
    if (fileType.includes('image')) return '🖼️';
    return '📄';
  };

  return (
    <div className="secure-vault">
      {/* Header Section */}
      <header className="vault-header">
        <div className="header-left">
          <div className="logo">
            <FaLock />
            <span>Secure Vault</span>
          </div>
          <div className="wallet-info">
            <span className="wallet-address">
              {user?.walletAddress ? `${user.walletAddress.slice(0, 6)}...${user.walletAddress.slice(-4)}` : 'Not Connected'}
            </span>
            <span className="network">Sepolia Testnet</span>
          </div>
        </div>
        <div className="header-right">
          <div className="status-indicators">
            <div className="status-item">
              <FaUsers />
              <span>{accessStatus?.doctorCount || 0} Doctors</span>
            </div>
            <div className="status-item">
              <FaClock />
              <span>{accessStatus?.lastAccess || 'Never'}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Upload Section */}
      <section className="upload-section">
        <div className="upload-card">
          <div className="upload-header">
            <h3>Upload Medical Records</h3>
            <p>Securely store your medical records on the blockchain</p>
          </div>
          
          <div 
            className={`upload-area ${dragActive ? 'drag-active' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="upload-icon">
              <FaUpload />
            </div>
            <div className="upload-text">
              <h4>Drag & drop your files here</h4>
              <p>or click to browse</p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileSelect}
              className="hidden-input"
            />
          </div>

          {selectedFile && (
            <div className="file-info">
              <div className="file-details">
                <div className="file-icon">
                  {getRecordIcon(selectedFile.type)}
                </div>
                <div className="file-meta">
                  <h4>{selectedFile.name}</h4>
                  <p>{formatFileSize(selectedFile.size)}</p>
                </div>
              </div>
              
              <div className="upload-options">
                <div className="form-group">
                  <label>Record Type</label>
                  <select 
                    value={recordType} 
                    onChange={(e) => setRecordType(e.target.value)}
                    className="form-select"
                  >
                    <option value="Prescription">Prescription</option>
                    <option value="Lab Report">Lab Report</option>
                    <option value="MRI">MRI</option>
                    <option value="Discharge">Discharge</option>
                    <option value="Insurance">Insurance</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Notes (Optional)</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add any relevant notes about this record..."
                    className="form-textarea"
                    rows={3}
                  />
                </div>
              </div>
              
              <button 
                className="upload-btn"
                onClick={handleUpload}
                disabled={loading}
              >
                <FaLock />
                {loading ? 'Encrypting & Uploading...' : 'Encrypt & Upload'}
              </button>
              
              {uploadProgress > 0 && (
                <div className="progress-bar">
                  <div 
                    className="progress-fill"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Records List */}
      <section className="records-section">
        <div className="section-header">
          <h3>Your Medical Records</h3>
          <p>Securely stored on IPFS with blockchain verification</p>
        </div>
        
        <div className="records-grid">
          {records.map((record) => (
            <div key={record.id} className="record-card">
              <div className="record-header">
                <div className="record-icon">
                  {getRecordIcon(record.fileType)}
                </div>
                <div className="record-meta">
                  <h4>{record.fileName}</h4>
                  <span className="record-type">{record.recordType}</span>
                  <span className="record-date">{record.uploadDate}</span>
                  <span className="added-by">Added by {record.addedBy}</span>
                </div>
                <div className="verification-badge">
                  {record.verified ? (
                    <>
                      <FaCheckCircle className="verified-icon" />
                      <span>Verified</span>
                    </>
                  ) : (
                    <>
                      <FaExclamationTriangle className="pending-icon" />
                      <span>Pending</span>
                    </>
                  )}
                </div>
              </div>
              
              <div className="record-actions">
                <button 
                  className={`action-btn view-btn ${viewingFile === record.id ? 'loading' : ''}`}
                  onClick={() => handleView(record)}
                  disabled={viewingFile === record.id || downloadingFile === record.id}
                >
                  {viewingFile === record.id ? (
                    <>
                      <div className="spinner"></div>
                      <span>Loading...</span>
                    </>
                  ) : (
                    <>
                      <FaEye />
                      <span>View</span>
                    </>
                  )}
                </button>
                <button 
                  className={`action-btn download-btn ${downloadingFile === record.id ? 'loading' : ''}`}
                  onClick={() => handleDownload(record)}
                  disabled={viewingFile === record.id || downloadingFile === record.id}
                >
                  {downloadingFile === record.id ? (
                    <>
                      <div className="spinner"></div>
                      <span>Downloading...</span>
                    </>
                  ) : (
                    <>
                      <FaDownload />
                      <span>Download</span>
                    </>
                  )}
                </button>
              </div>
              
              {record.ipfsHash && (
                <div className="record-hash">
                  <span className="hash-label">IPFS Hash:</span>
                  <code className="hash-value">{record.ipfsHash}</code>
                </div>
              )}
            </div>
          ))}
        </div>
        
        {records.length === 0 && (
          <div className="empty-state">
            <FaFolderOpen />
            <h3>No Medical Records Yet</h3>
            <p>Upload your first medical record to get started</p>
          </div>
        )}
      </section>

      {/* Access Status Panel */}
      <section className="access-panel">
        <div className="panel-header">
          <h3>Access Status</h3>
          <p>Manage who can view your medical records</p>
        </div>
        
        <div className="status-info">
          <div className="status-item">
            <span className="status-label">Doctors with Access:</span>
            <span className="status-value">{accessStatus?.doctorCount || 0}</span>
          </div>
          <div className="status-item">
            <span className="status-label">Last Access:</span>
            <span className="status-value">{accessStatus?.lastAccess || 'Never'}</span>
          </div>
        </div>
        
        <div className="panel-actions">
          <button className="link-btn" onClick={() => window.location.href = '/patient/share-access'}>
            <FaUsers />
            Manage Access
          </button>
        </div>
      </section>

      {/* Security Info Panel */}
      <section className="security-panel">
        <div className="panel-header">
          <h3>Security Information</h3>
          <button 
            className="toggle-btn"
            onClick={() => setShowSecurityInfo(!showSecurityInfo)}
          >
            {showSecurityInfo ? 'Hide Details' : 'Show Details'}
          </button>
        </div>
        
        <div className={`security-badges ${showSecurityInfo ? 'expanded' : ''}`}>
          <div className="security-badge">
            <FaShieldAlt className="badge-icon" />
            <span>AES-256 Encryption</span>
          </div>
          <div className="security-badge">
            <FaDatabase className="badge-icon" />
            <span>IPFS Storage</span>
          </div>
          <div className="security-badge">
            <FaNetworkWired className="badge-icon" />
            <span>Blockchain Verified</span>
          </div>
          <div className="security-badge">
            <FaLock className="upload-icon" />
            <span>Patient Controlled</span>
          </div>
        </div>
        
        {showSecurityInfo && (
          <div className="security-details">
            <h4>How It Works:</h4>
            <p>Your medical records are encrypted using AES-256 encryption before being stored on IPFS. Each upload creates a unique hash that's recorded on the blockchain, ensuring data integrity and immutability.</p>
            <p>Only doctors you've granted access to can view your records, and you maintain full control over who can see your medical information.</p>
            <p>The blockchain verification ensures that your records haven't been tampered with since upload.</p>
          </div>
        )}
      </section>

      {/* Success Message */}
      {uploadSuccess && (
        <div className="success-message">
          <FaCheckCircle className="success-icon" />
          <div className="success-content">
            <h4>Upload Successful!</h4>
            <p>{uploadSuccess.fileName}</p>
            <div className="success-details">
              <div className="detail-item">
                <span>IPFS Hash:</span>
                <code>{uploadSuccess.ipfsHash}</code>
              </div>
              <div className="detail-item">
                <span>Transaction:</span>
                <code>{uploadSuccess.transactionHash}</code>
              </div>
            </div>
            <div className="etherscan-link">
              <a 
                href={uploadSuccess.etherscanLink} 
                target="_blank" 
                rel="noopener noreferrer"
                className="etherscan-btn"
              >
                View on Etherscan
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SecureVault;
