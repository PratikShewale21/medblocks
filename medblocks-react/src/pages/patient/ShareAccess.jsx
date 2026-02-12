import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaUserMd, 
  FaClock, 
  FaLink, 
  FaSignOutAlt
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext'; // Import Auth Context
import './ShareAccess.css';

const ShareAccess = () => {
  const { user, logout } = useAuth(); // Get user and logout function

  const [doctors, setDoctors] = useState([
    {
      id: 1,
      name: 'Dr. Sarah Smith',
      wallet: '0x9a2...e4f1',
      active: true
    },
    {
      id: 2,
      name: 'Dr. James Wilson',
      wallet: '0x3b1...c8d9',
      active: false
    }
  ]);

  const [requests, setRequests] = useState([
    {
      id: 1,
      hospital: 'City General Hospital',
      requestedAccess: 'Full Vault Access (24h)',
      status: 'pending'
    }
  ]);

  // Helper to format wallet address
  const formatAddress = (address) => {
    if (!address) return "No Wallet";
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  const handleToggleAccess = (doctorId) => {
    setDoctors(prev => prev.map(doctor => 
      doctor.id === doctorId 
        ? { ...doctor, active: !doctor.active }
        : doctor
    ));
    
    const doctor = doctors.find(d => d.id === doctorId);
    const action = doctor.active ? 'revoked' : 'granted';
    alert(`Access ${action} to ${doctor.name}`);
  };

  const handleApproveRequest = (requestId) => {
    alert('Smart Contract Call Initiated...');
    setRequests(prev => prev.map(req => 
      req.id === requestId 
        ? { ...req, status: 'approved' }
        : req
    ));
  };

  const handleDeclineRequest = (requestId) => {
    setRequests(prev => prev.map(req => 
      req.id === requestId 
        ? { ...req, status: 'declined' }
        : req
    ));
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
            {/* Display dynamic wallet address */}
            <span>{formatAddress(user?.walletAddress)}</span>
          </div>
          <button className="logout-btn" onClick={logout}>
            <FaSignOutAlt />
            Logout
          </button>
        </div>
      </header>

      <section className="hero">
        <h1>Share Access</h1>
        <p className="hero-subtitle">Manage who has permission to view your medical records and AI summaries.</p>
      </section>

      <main className="container share-container">
        <div className="card">
          <div className="section-title">
            <FaUserMd />
            Authorized Doctors
          </div>
          
          {doctors.map((doctor) => (
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
                <span className={`status-label ${doctor.active ? 'status-active' : 'status-revoked'}`}>
                  {doctor.active ? 'ACTIVE' : 'REVOKED'}
                </span>
                <label className="switch">
                  <input 
                    type="checkbox" 
                    checked={doctor.active}
                    onChange={() => handleToggleAccess(doctor.id)}
                  />
                  <span className="slider"></span>
                </label>
              </div>
            </div>
          ))}
        </div>

        <div className="card">
          <div className="section-title">
            <FaClock />
            Access Requests
          </div>
          <p className="section-subtitle">New doctors requesting access to your diagnostic vault.</p>
          
          {requests.map((request) => (
            <div key={request.id} className="req-item">
              <div>
                <div className="req-hospital">{request.hospital}</div>
                <div className="req-meta">Requested: {request.requestedAccess}</div>
              </div>
              <div className="req-buttons">
                {request.status === 'pending' ? (
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
                ) : request.status === 'declined' ? (
                  <button className="btn-action btn-decline" disabled>
                    Declined
                  </button>
                ) : (
                  <button className="btn-action btn-approve" disabled>
                    Request Approved
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>
    </>
  );
};

export default ShareAccess;