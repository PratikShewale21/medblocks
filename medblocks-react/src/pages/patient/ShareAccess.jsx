import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import axios from "axios";
import { Link } from "react-router-dom";
import {
  FaUserMd,
  FaClock,
  FaLink,
  FaSignOutAlt,
  FaPlus,
  FaBell,
  FaSpinner 
} from "react-icons/fa";
import "./ShareAccess.css";

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

const ShareAccess = () => {
  const loadDoctors = async () => {
    try {
      const signer = await connectWallet();
      if (!signer) return;

      const patient = await signer.getAddress();
      setPatientWallet(patient);

      const res = await axios.get("http://localhost:8000/access/doctors");
      const list = res.data;
      const updated = [];

      // Check blockchain status for all doctors
      for (let d of list) {
        const check = await axios.get("http://localhost:8000/access/check", {
          params: { patient, doctor: d.wallet },
        });

        updated.push({
          ...d,
          active: check.data.hasAccess,
        });
      }

      setDoctors(updated);

      // ==========================================
      // NEW: AUTO-REMOVE ACCEPTED REQUESTS
      // ==========================================
      const storedReqs = JSON.parse(localStorage.getItem("patientAccessRequests") || "[]");
      
      // Filter out requests where the doctor is ALREADY active on the blockchain
      const pendingReqs = storedReqs.filter(req => {
        const docNode = updated.find(d => d.wallet.toLowerCase() === req.doctorWallet.toLowerCase());
        return !(docNode && docNode.active); // Keep it ONLY if they are NOT active
      });
      
      // If we removed any, update local storage and UI
      if (storedReqs.length !== pendingReqs.length) {
         localStorage.setItem("patientAccessRequests", JSON.stringify(pendingReqs));
         setRequests(pendingReqs);
      } else {
         // Otherwise just load normally
         setRequests(storedReqs);
      }

    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadDoctors();
  }, []);

  const [doctors, setDoctors] = useState([]);
  const [patientWallet, setPatientWallet] = useState("");
  const [requests, setRequests] = useState([]);
  const [processingWallets, setProcessingWallets] = useState({});

  const CONTRACT_ADDRESS = import.meta.env.VITE_ACCESS_CONTROL_ADDRESS;

  // Periodically check for new requests
  React.useEffect(() => {
    const interval = setInterval(() => {
      // We only pull new requests, the cleanup happens in loadDoctors
      const storedRequests = JSON.parse(localStorage.getItem("patientAccessRequests") || "[]");
      // Prevent overwriting if lengths match (avoids UI flicker)
      setRequests(prev => storedRequests.length !== prev.length ? storedRequests : prev);
    }, 2000); 

    return () => clearInterval(interval);
  }, []);

  const [newDoctor, setNewDoctor] = useState({ name: "", wallet: "" });
  const [activeTab, setActiveTab] = useState("shared");

  const handleToggleAccess = async (doctor) => {
    try {
      setDoctors((prev) =>
        prev.map((d) => d.wallet === doctor.wallet ? { ...d, active: !doctor.active } : d),
      );

      if (doctor.active) {
        await revokeAccess(doctor.wallet);
      } else {
        await grantAccess(doctor.wallet);
      }

      await loadDoctors();
    } catch (err) {
      console.error(err);
      await loadDoctors();
      alert("Transaction failed");
    }
  };

  const handleDeclineRequest = (requestId) => {
    setRequests((prev) => prev.map((req) => req.id === requestId ? { ...req, status: "declined" } : req));
    const updatedRequests = requests.map((req) => req.id === requestId ? { ...req, status: "declined" } : req);
    localStorage.setItem("patientAccessRequests", JSON.stringify(updatedRequests));
  };

  const handleAddDoctor = async () => {
    if (!newDoctor.name || !newDoctor.wallet) return alert("Fill all fields");
    if (!ethers.isAddress(newDoctor.wallet)) return alert("Invalid wallet");

    try {
      await axios.post("http://localhost:8000/access/add-doctor", {
        name: newDoctor.name,
        wallet: newDoctor.wallet,
      });

      setNewDoctor({ name: "", wallet: "" });
      await loadDoctors();
      alert("Doctor added!");
    } catch (err) {
      console.error(err);
      alert("Failed to add doctor");
    }
  };

  const grantAccess = async (doctorWallet) => {
    setProcessingWallets((prev) => ({ ...prev, [doctorWallet]: true }));

    try {
      const signer = await connectWallet();
      if (!signer) return;

      const patient = await signer.getAddress();
      const nonce = Date.now();

      const hash = ethers.solidityPackedKeccak256(
        ["address", "address", "bool", "uint256", "uint256", "address"],
        [patient, doctorWallet, true, 0, nonce, CONTRACT_ADDRESS],
      );

      const signature = await signer.signMessage(ethers.getBytes(hash));

      const res = await axios.post("http://localhost:8000/access/gasless-grant", {
        patient,
        doctor: doctorWallet,
        nonce,
        signature,
      });

      const txHash = res.data.tx_hash;
      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.waitForTransaction(txHash);

      await loadDoctors(); // This will trigger the auto-cleanup!
    } catch (err) {
      console.error(err);
      await loadDoctors();
    } finally {
      setProcessingWallets((prev) => ({ ...prev, [doctorWallet]: false }));
    }
  };

  const revokeAccess = async (doctorWallet) => {
    setProcessingWallets((prev) => ({ ...prev, [doctorWallet]: true }));

    try {
      const signer = await connectWallet();
      if (!signer) return;

      const patient = await signer.getAddress();
      const nonce = Date.now();

      const hash = ethers.solidityPackedKeccak256(
        ["address", "address", "uint256", "address"],
        [patient, doctorWallet, nonce, CONTRACT_ADDRESS],
      );

      const signature = await signer.signMessage(ethers.getBytes(hash));

      const res = await axios.post("http://localhost:8000/access/gasless-revoke", {
        patient,
        doctor: doctorWallet,
        nonce,
        signature,
      });

      const txHash = res.data.tx_hash;
      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.waitForTransaction(txHash);

      await loadDoctors();
    } catch (err) {
      console.error(err);
      await loadDoctors();
    } finally {
      setProcessingWallets((prev) => ({ ...prev, [doctorWallet]: false }));
    }
  };

  const handleApproveRequest = async (requestId) => {
    const request = requests.find((r) => r.id === requestId);
    if (!request) return;

    try {
      // Save doctor to backend DB
      await axios.post("http://localhost:8000/access/add-doctor", {
        name: request.doctorName,
        wallet: request.doctorWallet,
      });
    } catch (err) {
      console.log("Doctor exists, continuing...");
    }

    // Set local status to approved
    setRequests((prev) => prev.map((req) => req.id === requestId ? { ...req, status: "approved" } : req));
    const updatedRequests = requests.map((req) => req.id === requestId ? { ...req, status: "approved" } : req);
    localStorage.setItem("patientAccessRequests", JSON.stringify(updatedRequests));

    // Trigger MetaMask
    await grantAccess(request.doctorWallet);
  };

  return (
    <>
      <header>
        <Link to="/patient" className="logo">
          Med<span>Blocks</span>
        </Link>
        <div className="header-actions">
          <div className="wallet">
            <FaLink />
            <span>
              {patientWallet
                ? patientWallet.slice(0, 6) + "..." + patientWallet.slice(-4)
                : "Not Connected"}
            </span>
          </div>
        </div>
      </header>

      <section className="hero">
        <h1>Share Access</h1>
        <p className="hero-subtitle">
          Manage who has permission to view your medical records and AI
          summaries.
        </p>
      </section>

      <main className="container share-container">
        {/* Add Doctor Section */}
        <div className="card">
          <div className="section-title">
            <FaUserMd />
            Add Doctor
          </div>
          <div className="add-doctor-form">
            <div className="form-group">
              <label>Doctor's Name</label>
              <input
                type="text"
                placeholder="Enter doctor's name"
                value={newDoctor.name}
                onChange={(e) => setNewDoctor({ ...newDoctor, name: e.target.value })}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label>Wallet Address</label>
              <input
                type="text"
                placeholder="0x..."
                value={newDoctor.wallet}
                onChange={(e) => setNewDoctor({ ...newDoctor, wallet: e.target.value })}
                className="form-input"
              />
            </div>
            <button className="btn-add-doctor" onClick={handleAddDoctor}>
              <FaPlus />
              Add Doctor
            </button>
          </div>
        </div>

        {/* Access Management Tabs */}
        <div className="card">
          <div className="section-title">
            <FaUserMd />
            Manage Access
          </div>

          <div className="access-tabs">
            <div
              className={`tab ${activeTab === "shared" ? "active" : ""}`}
              onClick={() => setActiveTab("shared")}
            >
              Shared ({doctors.filter((d) => d.active).length})
            </div>
            <div
              className={`tab ${activeTab === "revoked" ? "active" : ""}`}
              onClick={() => setActiveTab("revoked")}
            >
              Revoked ({doctors.filter((d) => !d.active).length})
            </div>
          </div>

          <div className="doctors-list">
            {doctors
              .filter((doctor) => activeTab === "shared" ? doctor.active : !doctor.active)
              .map((doctor) => {
                const isProcessing = processingWallets[doctor.wallet];

                return (
                  <div key={doctor.id} className="dr-item">
                    <div className="dr-info">
                      <div className="dr-avatar">
                        <FaUserMd />
                      </div>
                      <div>
                        <div className="dr-name">{doctor.name}</div>
                        <div className="dr-wallet">{doctor.wallet}</div>
                      </div>
                    </div>
                    <div className="dr-actions">
                      {isProcessing ? (
                        <span className="status-label processing">
                          <FaSpinner className="spinner-icon" style={{ animation: 'spin 1s linear infinite' }} /> Processing...
                        </span>
                      ) : (
                        <>
                          <span className={`status-label ${doctor.active ? "status-active" : "status-revoked"}`}>
                            {doctor.active ? "ACTIVE" : "REVOKED"}
                          </span>
                          <label className="switch">
                            <input
                              type="checkbox"
                              checked={doctor.active}
                              onChange={() => handleToggleAccess(doctor)}
                            />
                            <span className="slider"></span>
                          </label>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Notifications Section */}
        <div className="card">
          <div className="section-title">
            <FaBell />
            Doctor Requests
          </div>
          <p className="section-subtitle">
            Doctors requesting access to your medical records
          </p>

          {requests.map((request) => {
            const isProcessing = processingWallets[request.doctorWallet];
            
            return (
              <div key={request.id} className="req-item">
                <div className="req-content">
                  <div className="req-doctor">{request.doctorName}</div>
                  <div className="req-hospital">{request.hospital || "MedBlocks Network"}</div>
                  <div className="req-meta">
                    <span>Wallet: {request.doctorWallet}</span>
                    <span>•</span>
                    <span>{request.timestamp}</span>
                  </div>
                  <div className="req-access">
                    Requested: {request.requestedAccess}
                  </div>
                </div>
                
                {/* DYNAMIC BUTTON LOGIC */}
                <div className="req-buttons">
                  {request.status === "pending" ? (
                    <>
                      <button
                        className="btn-action btn-approve"
                        onClick={() => handleApproveRequest(request.id)}
                        disabled={isProcessing}
                      >
                        {isProcessing ? <><FaSpinner className="spinner-icon" style={{animation: 'spin 1s linear infinite'}}/> Processing...</> : "Approve"}
                      </button>
                      <button
                        className="btn-action btn-decline"
                        onClick={() => handleDeclineRequest(request.id)}
                        disabled={isProcessing}
                      >
                        Decline
                      </button>
                    </>
                  ) : request.status === "declined" ? (
                    <>
                      <button className="btn-action btn-decline" disabled>
                        Declined
                      </button>
                      <button
                        className="btn-action"
                        style={{ backgroundColor: "#f59e0b", color: "white", marginLeft: "10px" }}
                        onClick={() => handleApproveRequest(request.id)}
                        disabled={isProcessing}
                      >
                        {isProcessing ? "Processing..." : "Approve Anyway"}
                      </button>
                    </>
                  ) : (
                    <button
                      className="btn-action"
                      style={{ backgroundColor: isProcessing ? "#9ca3af" : "#f59e0b", color: "white" }}
                      onClick={() => handleApproveRequest(request.id)}
                      disabled={isProcessing}
                    >
                      {isProcessing ? (
                        <><FaSpinner className="spinner-icon" style={{animation: 'spin 1s linear infinite'}}/> Waiting for Signature...</>
                      ) : (
                        "Retry Signature"
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {requests.length === 0 && (
            <div className="empty-requests">
              <FaBell />
              <h3>No pending requests</h3>
              <p>When doctors request access, they'll appear here</p>
            </div>
          )}
        </div>
      </main>
    </>
  );
};

export default ShareAccess;