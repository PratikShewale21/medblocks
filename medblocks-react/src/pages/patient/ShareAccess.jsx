import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaUserMd, 
  FaClock, 
  FaLink, 
  FaSignOutAlt,
  FaPlus,
  FaBell
} from 'react-icons/fa';
import './ShareAccess.css';

const ShareAccess = () => {
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

  const [requests, setRequests] = useState([]);

  // Load requests from localStorage (from doctor side)
  React.useEffect(() => {
    const storedRequests = JSON.parse(localStorage.getItem('patientAccessRequests') || '[]');
    setRequests(storedRequests);
  }, []);

  // Periodically check for new requests
  React.useEffect(() => {
    const interval = setInterval(() => {
      const storedRequests = JSON.parse(localStorage.getItem('patientAccessRequests') || '[]');
      setRequests(storedRequests);
    }, 2000); // Check every 2 seconds

    return () => clearInterval(interval);
  }, []);

  const [newDoctor, setNewDoctor] = useState({
    name: '',
    wallet: ''
  });

  const [activeTab, setActiveTab] = useState('shared');

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

  
  const handleDeclineRequest = (requestId) => {
  setRequests(prev => prev.map(req => 
    req.id === requestId 
      ? { ...req, status: 'declined' }
      : req
  ));
  
  // Update localStorage to sync with doctor side
  const updatedRequests = requests.map(req => 
    req.id === requestId 
      ? { ...req, status: 'declined' }
      : req
  );
  localStorage.setItem('patientAccessRequests', JSON.stringify(updatedRequests));
};

  const handleAddDoctor = () => {
    if (newDoctor.name && newDoctor.wallet) {
      const newId = Math.max(...doctors.map(d => d.id), 0) + 1;
      setDoctors(prev => [...prev, {
        id: newId,
        name: newDoctor.name,
        wallet: newDoctor.wallet,
        active: false
      }]);
      setNewDoctor({ name: '', wallet: '' });
      alert(`Dr. ${newDoctor.name} added successfully!`);
    } else {
      alert('Please fill in both doctor name and wallet address');
    }
  };

  const handleApproveRequest = (requestId) => {
    const request = requests.find(r => r.id === requestId);
    if (request) {
      const newId = Math.max(...doctors.map(d => d.id), 0) + 1;
      setDoctors(prev => [...prev, {
        id: newId,
        name: request.doctorName,
        wallet: request.doctorWallet,
        active: true
      }]);
      
      // Update request status
      setRequests(prev => prev.map(req => 
        req.id === requestId 
          ? { ...req, status: 'approved' }
          : req
      ));
      
      // Update localStorage to sync with doctor side
      const updatedRequests = requests.map(req => 
        req.id === requestId 
          ? { ...req, status: 'approved' }
          : req
      );
      localStorage.setItem('patientAccessRequests', JSON.stringify(updatedRequests));
      
      alert(`Access granted to ${request.doctorName}!`);
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
            <span>0x71C...A4f</span>
          </div>
          <button className="logout-btn">
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
                onChange={(e) => setNewDoctor({...newDoctor, name: e.target.value})}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label>Wallet Address</label>
              <input
                type="text"
                placeholder="0x..."
                value={newDoctor.wallet}
                onChange={(e) => setNewDoctor({...newDoctor, wallet: e.target.value})}
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
              className={`tab ${activeTab === 'shared' ? 'active' : ''}`}
              onClick={() => setActiveTab('shared')}
            >
              Shared ({doctors.filter(d => d.active).length})
            </div>
            <div 
              className={`tab ${activeTab === 'revoked' ? 'active' : ''}`}
              onClick={() => setActiveTab('revoked')}
            >
              Revoked ({doctors.filter(d => !d.active).length})
            </div>
          </div>
          
          <div className="doctors-list">
            {doctors
              .filter(doctor => activeTab === 'shared' ? doctor.active : !doctor.active)
              .map((doctor) => (
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
        </div>

        {/* Notifications Section */}
        <div className="card">
          <div className="section-title">
            <FaBell />
            Doctor Requests
          </div>
          <p className="section-subtitle">Doctors requesting access to your medical records</p>
          
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
                <div className="req-access">Requested: {request.requestedAccess}</div>
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
