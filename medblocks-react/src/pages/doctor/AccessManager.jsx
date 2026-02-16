import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import axios from 'axios';
import { 
  FaSearch, 
  FaFileExport, 
  FaUserPlus, 
  FaEllipsisV, 
  FaUserTimes, 
  FaCheck, 
  FaTimes, 
  FaCircle, 
  FaClock, 
  FaBell, 
  FaUser,
  FaSpinner
} from 'react-icons/fa';
import './AccessManager.css';

/* ================= WALLET CONNECTION ================= */
const connectWallet = async () => {
  if (!window.ethereum) {
    alert("Please install MetaMask!");
    return null;
  }
  await window.ethereum.request({ method: "eth_requestAccounts" });
  const provider = new ethers.BrowserProvider(window.ethereum);
  return await provider.getSigner();
};

const AccessManager = () => {
  const [activeTab, setActiveTab] = useState('active');
  const [query, setQuery] = useState('');
  const [doctorWallet, setDoctorWallet] = useState('');
  const [loading, setLoading] = useState(true);

  // Data States
  const [patients, setPatients] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [newPatient, setNewPatient] = useState({ name: '', wallet: '' });

  /* ================= INITIALIZATION & SYNC ================= */
  
  // Only fetches the data, DOES NOT prompt MetaMask
  const fetchPatientData = async (docAddress) => {
    try {
      // 1. Load requests sent by THIS doctor
      const allRequests = JSON.parse(localStorage.getItem('patientAccessRequests') || '[]');
      const myRequests = allRequests.filter(
        req => req.doctorWallet.toLowerCase() === docAddress.toLowerCase()
      );
      setSentRequests(myRequests);

      // 2. Load the doctor's patient list and check REAL blockchain status
      const storedPatients = JSON.parse(localStorage.getItem(`doctorPatients_${docAddress}`) || '[]');
      const updatedPatients = [];

      for (let p of storedPatients) {
        try {
          // Check the smart contract via backend
          const res = await axios.get("http://localhost:8000/access/check", {
            params: {
              patient: p.wallet,
              doctor: docAddress
            }
          });
          
          updatedPatients.push({
            ...p,
            status: res.data.hasAccess ? 'active' : 'revoked'
          });
        } catch (err) {
          console.error("Failed to check access for", p.wallet, err);
          updatedPatients.push(p); // Keep existing status if network fails
        }
      }

      setPatients(updatedPatients);
    } catch (err) {
      console.error("Error loading patient data:", err);
    }
  };

  useEffect(() => {
    let activeDocWallet = "";

    const initSetup = async () => {
      try {
        const signer = await connectWallet();
        if (signer) {
          activeDocWallet = await signer.getAddress();
          setDoctorWallet(activeDocWallet);
          await fetchPatientData(activeDocWallet);
        }
      } catch (err) {
        console.error("Failed to initialize wallet", err);
      } finally {
        setLoading(false);
      }
    };

    initSetup();

    // Only refresh the data every 5 seconds, not the wallet connection!
    const interval = setInterval(() => {
      if (activeDocWallet) {
        fetchPatientData(activeDocWallet);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  /* ================= ACTIONS ================= */
  
  const handleAddPatient = () => {
    if (!newPatient.name || !newPatient.wallet) {
      alert('Please fill in both patient name and wallet address');
      return;
    }

    if (!ethers.isAddress(newPatient.wallet)) {
      alert('Invalid Ethereum wallet address format.');
      return;
    }

    if (!doctorWallet) {
      alert('Wallet not connected. Please refresh and connect MetaMask.');
      return;
    }

    // 1. Create a request that will appear on the patient's dashboard
    const patientRequest = {
      id: Date.now(),
      doctorName: 'Dr. Smith', // Placeholder
      doctorWallet: doctorWallet,
      patientName: newPatient.name,
      wallet: newPatient.wallet, // Patient's wallet
      requestedAccess: 'Full Medical Records',
      timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
      status: 'pending'
    };

    const existingRequests = JSON.parse(localStorage.getItem('patientAccessRequests') || '[]');
    existingRequests.push(patientRequest);
    localStorage.setItem('patientAccessRequests', JSON.stringify(existingRequests));

    // 2. Add to doctor's personal roster of patients
    const storedPatients = JSON.parse(localStorage.getItem(`doctorPatients_${doctorWallet}`) || '[]');
    
    if (!storedPatients.find(p => p.wallet.toLowerCase() === newPatient.wallet.toLowerCase())) {
      storedPatients.push({
        id: Date.now().toString(),
        name: newPatient.name,
        wallet: newPatient.wallet,
        status: 'pending',
        lastAccessed: 'Never'
      });
      localStorage.setItem(`doctorPatients_${doctorWallet}`, JSON.stringify(storedPatients));
    }

    setNewPatient({ name: '', wallet: '' });
    alert(`Access request sent to ${newPatient.name}!`);
    fetchPatientData(doctorWallet);
  };

  const handleCancelRequest = (requestId) => {
    const allRequests = JSON.parse(localStorage.getItem('patientAccessRequests') || '[]');
    const updatedRequests = allRequests.filter(req => req.id !== requestId);
    localStorage.setItem('patientAccessRequests', JSON.stringify(updatedRequests));
    fetchPatientData(doctorWallet);
  };

  /* ================= FILTERING ================= */
  const filteredPatients = patients.filter((p) => {
    const tabMatch =
      activeTab === 'history' ? true :
      activeTab === 'active' ? p.status === 'active' :
      activeTab === 'pending' ? p.status === 'pending' :
      activeTab === 'revoked' ? p.status === 'revoked' : true;
    const text = `${p.name} ${p.wallet}`.toLowerCase();
    return tabMatch && text.includes(query.toLowerCase());
  });

  return (
    <>
      <div className="access-manager-header">
        <div className="header-content">
          <h1>Access Manager</h1>
          <p>Manage permissions and request access to patient records</p>
        </div>
        <div className="header-actions">
          <button className="btn-grant" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <FaUserPlus />
            <span>Request Access</span>
          </button>
        </div>
      </div>

      <div className="access-search">
        <div className="search-bar">
          <FaSearch />
          <input 
            value={query} 
            onChange={(e) => setQuery(e.target.value)} 
            type="text" 
            placeholder="Search patients by name or wallet address..." 
          />
        </div>
      </div>

      <div className="access-container">
        
        {/* Add Patient Section */}
        <div className="add-patient-section">
          <div className="section-header">
            <FaUser />
            <h2>Request Patient Access</h2>
          </div>
          <div className="add-patient-form">
            <div className="form-group">
              <label>Patient Name</label>
              <input
                type="text"
                placeholder="Enter patient name"
                value={newPatient.name}
                onChange={(e) => setNewPatient({...newPatient, name: e.target.value})}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label>Patient Wallet Address</label>
              <input
                type="text"
                placeholder="0x..."
                value={newPatient.wallet}
                onChange={(e) => setNewPatient({...newPatient, wallet: e.target.value})}
                className="form-input"
              />
            </div>
            <button className="btn-add-patient" onClick={handleAddPatient}>
              <FaUserPlus />
              Send Request
            </button>
          </div>
        </div>

        {/* Sent Requests Notifications */}
        <div className="notifications-section">
          <div className="section-header">
            <FaBell />
            <h2>Sent Access Requests</h2>
          </div>
          <p className="section-subtitle">Track the status of access requests you sent to patients</p>
          
          <div className="requests-grid">
            {sentRequests.map((request) => (
              <div key={request.id} className="request-card">
                <div className="request-header">
                  <div className="patient-info">
                    <div className="patient-avatar">
                      <FaUser />
                    </div>
                    <div className="patient-details">
                      <h3>{request.patientName}</h3>
                      <span className="wallet-badge">
                        {request.wallet.slice(0,6)}...{request.wallet.slice(-4)}
                      </span>
                    </div>
                  </div>
                  <div className="request-status">
                    {request.status === 'pending' && <span className="status-badge status-pending"><FaClock /> Pending</span>}
                    {request.status === 'approved' && <span className="status-badge status-active"><FaCircle /> Approved</span>}
                    {request.status === 'declined' && <span className="status-badge status-revoked"><FaTimes /> Declined</span>}
                  </div>
                </div>
                
                <div className="request-content">
                  <div className="request-details">
                    <div className="request-access">Requested: {request.requestedAccess}</div>
                    <div className="request-time">Sent: {request.timestamp}</div>
                  </div>
                </div>
                
                <div className="request-actions">
                  {request.status === 'pending' ? (
                    <button className="btn-reject" onClick={() => handleCancelRequest(request.id)}>
                      <FaTimes /> Cancel Request
                    </button>
                  ) : (
                    <button className="btn-details" disabled>
                      {request.status === 'approved' ? 'Patient Approved' : 'Patient Declined'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          {sentRequests.length === 0 && (
            <div className="empty-requests">
              <FaBell />
              <h3>No pending requests</h3>
              <p>Send a request above to access a patient's medical records.</p>
            </div>
          )}
        </div>

        {/* Access Management Tabs */}
        <div className="access-tabs">
          <div className={`tab ${activeTab === 'active' ? 'active' : ''}`} onClick={() => setActiveTab('active')}>
            <span className="tab-count">{patients.filter(p => p.status === 'active').length}</span>
            Active Patients
          </div>
          <div className={`tab ${activeTab === 'revoked' ? 'active' : ''}`} onClick={() => setActiveTab('revoked')}>
            <span className="tab-count">{patients.filter(p => p.status === 'revoked').length}</span>
            No Access / Revoked
          </div>
          <div className={`tab ${activeTab === 'history' ? 'active' : ''}`} onClick={() => setActiveTab('history')}>
            <span className="tab-count">{patients.length}</span>
            All Patients
          </div>
        </div>

        {loading ? (
           <div className="empty-state">
              <FaSpinner className="spinner-icon" style={{fontSize: '2rem', animation: 'spin 1s linear infinite'}} />
              <h3>Syncing with Blockchain...</h3>
           </div>
        ) : (
          <div className="access-grid">
            {filteredPatients.map((p) => (
              <div key={p.id} className="access-card">
                <div className="card-header">
                  <div className="user-info">
                    <div className="user-avatar"><FaUser /></div>
                    <div className="user-details">
                      <h3>{p.name}</h3>
                      <p>{p.wallet.slice(0,8)}...{p.wallet.slice(-4)}</p>
                      <span className="role-badge">Patient</span>
                    </div>
                  </div>
                  <div className="status-section">
                    {p.status === 'active' && <span className="status-badge status-active"><FaCircle /> Active Access</span>}
                    {p.status === 'pending' && <span className="status-badge status-pending"><FaClock /> Pending</span>}
                    {p.status === 'revoked' && <span className="status-badge status-revoked"><FaCircle /> Revoked</span>}
                  </div>
                </div>
                
                <div className="card-content">
                  <div className="permissions-section">
                    <h4>Permissions</h4>
                    <div className="permissions-list">
                      <span className="permission-tag">View Medical Records</span>
                      {p.status === 'active' && <span className="permission-tag">AI Summaries</span>}
                    </div>
                  </div>
                </div>
                
                <div className="card-actions">
                  {p.status === 'active' ? (
                    <button className="btn-approve" onClick={() => window.location.href = `/doctor/patients?wallet=${p.wallet}`}>
                      <FaEllipsisV /> View Records
                    </button>
                  ) : (
                    <button className="btn-details" disabled>
                      Requires Patient Approval
                    </button>
                  )}
                </div>
              </div>
            ))}
            
            {filteredPatients.length === 0 && (
              <div className="empty-state">
                <div className="empty-icon">
                  <FaSearch />
                </div>
                <h3>No patients found</h3>
                <p>Try sending a request to a new patient wallet above.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default AccessManager;