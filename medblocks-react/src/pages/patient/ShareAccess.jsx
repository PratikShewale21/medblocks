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
  FaSpinner // <--- ADDED: Spinner icon
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

      for (let d of list) {
        const check = await axios.get("http://localhost:8000/access/check", {
          params: {
            patient,
            doctor: d.wallet,
          },
        });

        updated.push({
          ...d,
          active: check.data.hasAccess,
        });
      }

      setDoctors(updated);
    } catch (err) {
      console.error(err);
      alert("Failed to load doctors");
    }
  };

  useEffect(() => {
    loadDoctors();
  }, []);

  const [doctors, setDoctors] = useState([]);
  const [patientWallet, setPatientWallet] = useState("");
  const [requests, setRequests] = useState([]);
  
  // <--- ADDED: Track which wallet is currently processing a blockchain transaction --->
  const [processingWallets, setProcessingWallets] = useState({});

  const CONTRACT_ADDRESS = import.meta.env.VITE_ACCESS_CONTROL_ADDRESS;
  console.log("Contract:", CONTRACT_ADDRESS);

  // Load requests from localStorage (from doctor side)
  React.useEffect(() => {
    const storedRequests = JSON.parse(
      localStorage.getItem("patientAccessRequests") || "[]",
    );
    setRequests(storedRequests);
  }, []);

  // Periodically check for new requests
  React.useEffect(() => {
    const interval = setInterval(() => {
      const storedRequests = JSON.parse(
        localStorage.getItem("patientAccessRequests") || "[]",
      );
      setRequests(storedRequests);
    }, 2000); // Check every 2 seconds

    return () => clearInterval(interval);
  }, []);

  const [newDoctor, setNewDoctor] = useState({
    name: "",
    wallet: "",
  });

  const [activeTab, setActiveTab] = useState("shared");

  const handleToggleAccess = async (doctor) => {
    try {
      // Optimistic UI update (instant change)
      setDoctors((prev) =>
        prev.map((d) =>
          d.wallet === doctor.wallet ? { ...d, active: !doctor.active } : d,
        ),
      );

      if (doctor.active) {
        await revokeAccess(doctor.wallet);
      } else {
        await grantAccess(doctor.wallet);
      }

      // Re-sync with blockchain (safety)
      await loadDoctors();
    } catch (err) {
      console.error(err);

      // Rollback if failed
      await loadDoctors();

      alert("Transaction failed");
    }
  };

  const handleDeclineRequest = (requestId) => {
    setRequests((prev) =>
      prev.map((req) =>
        req.id === requestId ? { ...req, status: "declined" } : req,
      ),
    );

    // Update localStorage to sync with doctor side
    const updatedRequests = requests.map((req) =>
      req.id === requestId ? { ...req, status: "declined" } : req,
    );
    localStorage.setItem(
      "patientAccessRequests",
      JSON.stringify(updatedRequests),
    );
  };

  const handleAddDoctor = async () => {
    if (!newDoctor.name || !newDoctor.wallet) {
      alert("Fill all fields");
      return;
    }

    if (!ethers.isAddress(newDoctor.wallet)) {
      alert("Invalid wallet");
      return;
    }

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

  const handleApproveRequest = (requestId) => {
    const request = requests.find((r) => r.id === requestId);
    if (request) {
      const newId = Math.max(...doctors.map((d) => d.id), 0) + 1;
      setDoctors((prev) => [
        ...prev,
        {
          id: newId,
          name: request.doctorName,
          wallet: request.doctorWallet,
          active: true,
        },
      ]);

      // Update request status
      setRequests((prev) =>
        prev.map((req) =>
          req.id === requestId ? { ...req, status: "approved" } : req,
        ),
      );

      // Update localStorage to sync with doctor side
      const updatedRequests = requests.map((req) =>
        req.id === requestId ? { ...req, status: "approved" } : req,
      );
      localStorage.setItem(
        "patientAccessRequests",
        JSON.stringify(updatedRequests),
      );

      alert(`Access granted to ${request.doctorName}!`);
    }
  };

  const grantAccess = async (doctorWallet) => {
    // <--- ADDED: Start loading state for this wallet --->
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

      // Call backend
      const res = await axios.post(
        "http://localhost:8000/access/gasless-grant",
        {
          patient,
          doctor: doctorWallet,
          nonce,
          signature,
        },
      );

      const txHash = res.data.tx_hash;

      // ⏳ WAIT for blockchain confirmation
      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.waitForTransaction(txHash);

      // ✅ Now reload after mined
      await loadDoctors();
    } catch (err) {
      console.error(err);
      alert("Grant failed");
      await loadDoctors();
    } finally {
      // <--- ADDED: Stop loading state regardless of success or failure --->
      setProcessingWallets((prev) => ({ ...prev, [doctorWallet]: false }));
    }
  };

  const revokeAccess = async (doctorWallet) => {
    // <--- ADDED: Start loading state for this wallet --->
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

      // Call backend
      const res = await axios.post(
        "http://localhost:8000/access/gasless-revoke",
        {
          patient,
          doctor: doctorWallet,
          nonce,
          signature,
        },
      );

      const txHash = res.data.tx_hash;

      // ⏳ WAIT for blockchain confirmation
      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.waitForTransaction(txHash);

      // ✅ Reload after mined
      await loadDoctors();
    } catch (err) {
      console.error(err);
      alert("Revoke failed");
      await loadDoctors();
    } finally {
      // <--- ADDED: Stop loading state regardless of success or failure --->
      setProcessingWallets((prev) => ({ ...prev, [doctorWallet]: false }));
    }
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
          <button className="logout-btn">
            <FaSignOutAlt />
            Logout
          </button>
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
                onChange={(e) =>
                  setNewDoctor({ ...newDoctor, name: e.target.value })
                }
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label>Wallet Address</label>
              <input
                type="text"
                placeholder="0x..."
                value={newDoctor.wallet}
                onChange={(e) =>
                  setNewDoctor({ ...newDoctor, wallet: e.target.value })
                }
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
              .filter((doctor) =>
                activeTab === "shared" ? doctor.active : !doctor.active,
              )
              .map((doctor) => {
                // <--- ADDED: Check if this specific doctor's wallet is processing --->
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
                        // ONLY show the processing text/spinner when loading
                        <span className="status-label processing">
                          <FaSpinner className="spinner-icon" /> Processing...
                        </span>
                      ) : (
                        // Show BOTH the status label AND the toggle switch when NOT loading
                        <>
                          <span
                            className={`status-label ${doctor.active ? "status-active" : "status-revoked"}`}
                          >
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

          {requests.map((request) => (
            <div key={request.id} className="req-item">
              <div className="req-content">
                <div className="req-doctor">{request.doctorName}</div>
                <div className="req-hospital">{request.hospital}</div>
                <div className="req-meta">
                  <span>Wallet: {request.wallet}</span>
                  <span>•</span>
                  <span>{request.timestamp}</span>
                </div>
                <div className="req-access">
                  Requested: {request.requestedAccess}
                </div>
              </div>
              <div className="req-buttons">
                {request.status === "pending" ? (
                  <>
                    <button
                      className="btn-action btn-approve"
                      onClick={() => handleApproveRequest(request.id)}
                    >
                      Approve
                    </button>
                    <button
                      className="btn-action btn-decline"
                      onClick={() => handleDeclineRequest(request.id)}
                    >
                      Decline
                    </button>
                  </>
                ) : request.status === "declined" ? (
                  <button className="btn-action btn-decline" disabled>
                    Declined
                  </button>
                ) : (
                  <button className="btn-action btn-approve" disabled>
                    Approved
                  </button>
                )}
              </div>
            </div>
          ))}

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