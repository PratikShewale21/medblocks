import React, { useState, useEffect, useRef } from "react";
import { ethers } from "ethers";
import axios from "axios";
import {
  FaLock,
  FaUpload,
  FaDownload,
  FaShieldAlt,
  FaDatabase,
  FaCheckCircle,
  FaExclamationTriangle,
  FaFolderOpen,
  FaClock,
  FaUsers,
  FaNetworkWired,
} from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import "./SecureVault.css";

/* ================= WALLET ================= */

const connectWallet = async () => {
  if (!window.ethereum) {
    alert("Install MetaMask");
    return null;
  }

  await window.ethereum.request({
    method: "eth_requestAccounts",
  });

  const provider = new ethers.BrowserProvider(window.ethereum);
  return await provider.getSigner();
};

/* ================= COMPONENT ================= */

const SecureVault = () => {
  const { user } = useAuth();

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [recordType, setRecordType] = useState("Prescription");
  const [notes, setNotes] = useState("");
  const [accessStatus, setAccessStatus] = useState(null);
  const [showSecurityInfo, setShowSecurityInfo] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(null);
  const [downloadingFile, setDownloadingFile] = useState(null);

  const fileInputRef = useRef(null);

  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

  const loadAccessStatus = async () => {
    try {
      const signer = await connectWallet();
      if (!signer) return;

      const patient = await signer.getAddress();

      const res = await axios.get("http://localhost:8000/access/count", {
        params: {
          patient: patient,
        },
      });

      setAccessStatus({
        doctorCount: res.data.doctorCount,
        lastAccess: "Live",
      });
    } catch (err) {
      console.error("Failed to load access status", err);
    }
  };

  /* ================= HELPERS ================= */

  const formatFileSize = (bytes) => {
    if (!bytes) return "-";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (bytes / Math.pow(k, i)).toFixed(2) + " " + sizes[i];
  };

  const getRecordIcon = (fileType) => {
    if (!fileType) return "📄";
    if (fileType.includes("pdf")) return "📄";
    if (fileType.includes("image")) return "🖼️";
    return "📄";
  };

  /* ================= LOAD RECORDS ================= */

  const loadRecords = async () => {
    try {
      const signer = await connectWallet();
      if (!signer) return;

      const address = await signer.getAddress();

      const res = await axios.get(`http://localhost:8000/records/${address}`, {
        params: {
          requester_address: address,
        },
      });

      const formatted = (res.data.records || []).map((r) => ({
        id: r.cid,
        cid: r.cid,
        fileName: r.filename,
        fileType: r.filename?.endsWith(".pdf")
          ? "application/pdf"
          : "application/octet-stream",
        fileSize: "-",
        recordType: r.record_type,
        uploadDate: "-", // Future enhancement: pull real date from SC
        addedBy: "Patient",
        verified: true,
        ipfsHash: r.cid,
        transactionHash: r.transaction_hash || "",
        etherscanLink: r.transaction_hash
          ? `https://sepolia.etherscan.io/tx/${r.transaction_hash}`
          : "",
      }));

      setRecords(formatted);
    } catch (err) {
      console.error(err);
      alert("Failed to load records");
    }
  };

  useEffect(() => {
    loadRecords();
    loadAccessStatus();
  }, []);

  /* ================= FILE SELECT ================= */

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > MAX_FILE_SIZE) {
        alert("File is too large! Please upload a file smaller than 10MB.");
        // Reset the input so they can pick a new file
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }
      setSelectedFile(file);
      setUploadProgress(0);
      setUploadSuccess(null);
    }
  };

  /* ================= DRAG ================= */

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
      const file = files[0];
      if (file.size > MAX_FILE_SIZE) {
        alert("File is too large! Please drop a file smaller than 10MB.");
        return;
      }
      setSelectedFile(file);
      setUploadProgress(0);
      setUploadSuccess(null);
    }
  };

  const clearSelection = () => {
    setSelectedFile(null);
    setUploadProgress(0);
    setUploadSuccess(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  /* ================= UPLOAD ================= */

  const handleUpload = async () => {
    if (!selectedFile) {
      alert("Select file first");
      return;
    }

    try {
      setLoading(true);
      setUploadProgress(0);
      setUploadSuccess(null);

      const signer = await connectWallet();
      if (!signer) return;

      const patient = await signer.getAddress();

      const form = new FormData();
      form.append("file", selectedFile);
      form.append("patient_address", patient);
      form.append("record_type", recordType);

      // Upload with Real-Time Progress
      const response = await axios.post(
        "http://localhost:8000/records/upload",
        form,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            // Cap at 90% while waiting for the blockchain transaction to be mined
            setUploadProgress(percentCompleted < 90 ? percentCompleted : 90);
          },
        }
      );

      // Once the blockchain confirms, bump to 100%
      setUploadProgress(100);

      // Wait a bit so blockchain + backend sync cleanly
      await new Promise((r) => setTimeout(r, 1500));

      await loadRecords();

      setUploadSuccess({
        fileName: response.data.filename,
        ipfsHash: response.data.cid,
        transactionHash: response.data.transaction_hash,
        etherscanLink: `https://sepolia.etherscan.io/tx/${response.data.transaction_hash}`,
      });

      // Reset form
      setSelectedFile(null);
      setNotes("");
      setRecordType("Prescription");
      if (fileInputRef.current) fileInputRef.current.value = "";

    } catch (err) {
      console.error(err);
      alert("Upload failed");
    } finally {
      setLoading(false);
      // Don't reset uploadProgress to 0 immediately so the user can see it hit 100%
      setTimeout(() => setUploadProgress(0), 3000); 
    }
  };

  /* ================= DOWNLOAD ================= */

  const handleDownload = async (record) => {
    try {
      setDownloadingFile(record.cid);

      const signer = await connectWallet();
      if (!signer) return;

      const addr = await signer.getAddress();

      const res = await axios.get(
        `http://localhost:8000/records/view/${record.cid}`,
        {
          params: {
            patient_address: addr,
            requester_address: addr,
          },
          responseType: "blob", 
        }
      );

      const blob = new Blob([res.data]);

      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = record.fileName; 
      document.body.appendChild(link);

      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error(err);
      alert("Download failed");
    } finally {
      setDownloadingFile(null);
    }
  };

  /* ================= UI ================= */

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
              {user?.walletAddress
                ? `${user.walletAddress.slice(0, 6)}...${user.walletAddress.slice(-4)}`
                : "Not Connected"}
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
              <span>{accessStatus?.lastAccess || "Never"}</span>
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

          {!selectedFile && (
            <div
              className={`upload-area ${dragActive ? "drag-active" : ""}`}
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
                <p>or click to browse (Max 10MB)</p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileSelect}
                className="hidden-input"
              />
            </div>
          )}

          {selectedFile && (
            <div className="file-info">
              <button
                className="clear-file-btn"
                onClick={clearSelection}
                disabled={loading}
                style={{
                  float: "right",
                  background: "none",
                  border: "none",
                  color: "#ef4444",
                  cursor: loading ? "not-allowed" : "pointer",
                  fontSize: "14px",
                  fontWeight: "bold",
                  opacity: loading ? 0.5 : 1
                }}
              >
                ✕ Remove
              </button>

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
                    disabled={loading}
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
                    disabled={loading}
                  />
                </div>
              </div>

              <button
                className="upload-btn"
                onClick={handleUpload}
                disabled={loading}
              >
                <FaLock />
                {loading ? `Encrypting & Uploading (${uploadProgress}%)...` : "Encrypt & Upload"}
              </button>

              {uploadProgress > 0 && (
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${uploadProgress}%`, transition: 'width 0.2s ease-in-out' }}
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
                  className={`action-btn download-btn ${
                    downloadingFile === record.id ? "loading" : ""
                  }`}
                  onClick={() => handleDownload(record)}
                  disabled={downloadingFile === record.id}
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
            <span className="status-value">
              {accessStatus?.doctorCount || 0}
            </span>
          </div>
          <div className="status-item">
            <span className="status-label">Last Access:</span>
            <span className="status-value">
              {accessStatus?.lastAccess || "Never"}
            </span>
          </div>
        </div>

        <div className="panel-actions">
          <button
            className="link-btn"
            onClick={() => (window.location.href = "/patient/share-access")}
          >
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
            {showSecurityInfo ? "Hide Details" : "Show Details"}
          </button>
        </div>

        <div
          className={`security-badges ${showSecurityInfo ? "expanded" : ""}`}
        >
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
            <p>
              Your medical records are encrypted using AES-256 encryption before
              being stored on IPFS. Each upload creates a unique hash that's
              recorded on the blockchain, ensuring data integrity and
              immutability.
            </p>
            <p>
              Only doctors you've granted access to can view your records, and
              you maintain full control over who can see your medical
              information.
            </p>
            <p>
              The blockchain verification ensures that your records haven't been
              tampered with since upload.
            </p>
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