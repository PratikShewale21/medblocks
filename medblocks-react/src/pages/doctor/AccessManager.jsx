import React, { useState } from 'react';
import { FaSearch, FaLink, FaFileExport, FaUserPlus, FaEllipsisV, FaUserTimes, FaCheck, FaTimes, FaCircle, FaClock, FaBell, FaUser } from 'react-icons/fa';
import './AccessManager.css';

const AccessManager = () => {
  const [activeTab, setActiveTab] = useState('active');
  const [query, setQuery] = useState('');

  const [rows, setRows] = useState([
    {
      id: 'DS',
      name: 'Dr. Sarah Johnson',
      email: 'sarah.j@example.com',
      role: 'Doctor',
      permissions: ['View Records', 'Add Notes'],
      lastAccessed: '2 hours ago',
      status: 'active'
    },
    {
      id: 'RN',
      name: 'Nurse Robert Chen',
      email: 'robert.c@example.com',
      role: 'Nurse',
      permissions: ['View Records'],
      lastAccessed: '1 day ago',
      status: 'active'
    },
    {
      id: 'AM',
      name: 'Dr. Michael Brown',
      email: 'michael.b@example.com',
      role: 'Specialist',
      permissions: ['View Records', 'Add Notes', 'Request Tests'],
      lastAccessed: 'Pending',
      status: 'pending'
    }
  ]);

  const [newPatient, setNewPatient] = useState({
    name: '',
    wallet: ''
  });

  const [patientRequests, setPatientRequests] = useState([
    {
      id: 1,
      patientName: 'Sarah Connor',
      wallet: '0x8f2a...b9c1',
      condition: 'Diabetes Type 2',
      requestedAccess: 'Full Medical Records',
      timestamp: '30 minutes ago',
      status: 'pending'
    },
    {
      id: 2,
      patientName: 'John Doe',
      wallet: '0x3d4e...a5f2',
      condition: 'Hypertension',
      requestedAccess: 'Diagnostic Reports Only',
      timestamp: '2 hours ago',
      status: 'approved'
    }
  ]);

  const filtered = rows.filter((r) => {
    const tabMatch =
      activeTab === 'history' ? true :
      activeTab === 'active' ? r.status === 'active' :
      activeTab === 'pending' ? r.status === 'pending' :
      activeTab === 'revoked' ? r.status === 'revoked' : true;
    const text = `${r.name} ${r.email} ${r.role} ${r.permissions.join(' ')} ${r.lastAccessed} ${r.status}`.toLowerCase();
    return tabMatch && text.includes(query.toLowerCase());
  });

  const setStatus = (rowId, status) => {
    setRows((prev) => prev.map((r) => (r.id === rowId ? { ...r, status } : r)));
  };

  const handleAddPatient = () => {
    if (newPatient.name && newPatient.wallet) {
      // Create a request that will appear in patient's Share Access
      const patientRequest = {
        id: Date.now(),
        doctorName: 'Dr. Sarah Johnson', // This would be the current logged-in doctor
        doctorWallet: '0x9F2A...B9C1', // This would be the current doctor's wallet
        patientName: newPatient.name,
        patientWallet: newPatient.wallet,
        requestedAccess: 'Full Medical Records Access',
        timestamp: 'Just now',
        status: 'pending'
      };

      // Store the request in localStorage for patient side to pick up
      const existingRequests = JSON.parse(localStorage.getItem('patientAccessRequests') || '[]');
      existingRequests.push(patientRequest);
      localStorage.setItem('patientAccessRequests', JSON.stringify(existingRequests));

      // Also add to doctor's own records for tracking
      const newId = Math.max(...rows.map(r => parseInt(r.id) || 0), 0) + 1;
      setRows((prev) => [...prev, {
        id: newId.toString(),
        name: newPatient.name,
        email: `${newPatient.name.toLowerCase().replace(' ', '.')}@example.com`,
        role: 'Patient',
        permissions: ['View Records'],
        lastAccessed: 'Never',
        status: 'pending'
      }]);
      
      setNewPatient({ name: '', wallet: '' });
      alert(`Access request sent to ${newPatient.name}! They will need to approve it from their Share Access page.`);
    } else {
      alert('Please fill in both patient name and wallet address');
    }
  };

  const handleApprovePatientRequest = (requestId) => {
    const request = patientRequests.find(r => r.id === requestId);
    if (request) {
      setPatientRequests(prev => prev.map(req => 
        req.id === requestId 
          ? { ...req, status: 'approved' }
          : req
      ));
      alert(`Access granted to ${request.patientName}!`);
    }
  };

  const handleDeclinePatientRequest = (requestId) => {
    setPatientRequests(prev => prev.map(req => 
      req.id === requestId 
        ? { ...req, status: 'declined' }
        : req
    ));
  };

  return (
    <>
      <div className="access-manager-header">
        <div className="header-content">
          <h1>Access Manager</h1>
          <p>Manage permissions and access requests for patient records</p>
        </div>
        <div className="header-actions">
          <button className="btn-export" onClick={() => console.log('Export')}>
            <FaFileExport />
            <span>Export</span>
          </button>
          <button className="btn-grant" onClick={() => console.log('Grant Access')}>
            <FaUserPlus />
            <span>Grant Access</span>
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
            placeholder="Search by name, email, or role..." 
          />
        </div>
      </div>

      <div className="access-container">
        {/* Add Patient Section */}
        <div className="add-patient-section">
          <div className="section-header">
            <FaUser />
            <h2>Add Patient</h2>
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
              <label>Wallet Address</label>
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
              Add Patient
            </button>
          </div>
        </div>

        {/* Patient Requests Notifications */}
        <div className="notifications-section">
          <div className="section-header">
            <FaBell />
            <h2>Patient Requests</h2>
          </div>
          <p className="section-subtitle">Patients requesting access to their medical records</p>
          
          <div className="requests-grid">
            {patientRequests.map((request) => (
              <div key={request.id} className="request-card">
                <div className="request-header">
                  <div className="patient-info">
                    <div className="patient-avatar">
                      <FaUser />
                    </div>
                    <div className="patient-details">
                      <h3>{request.patientName}</h3>
                      <p>Condition: {request.condition}</p>
                      <span className="wallet-badge">{request.wallet}</span>
                    </div>
                  </div>
                  <div className="request-status">
                    {request.status === 'pending' && <span className="status-badge status-pending"><FaClock /> Pending</span>}
                    {request.status === 'approved' && <span className="status-badge status-active"><FaCircle /> Approved</span>}
                    {request.status === 'declined' && <span className="status-badge status-revoked"><FaCircle /> Declined</span>}
                  </div>
                </div>
                
                <div className="request-content">
                  <div className="request-details">
                    <div className="request-access">Requested: {request.requestedAccess}</div>
                    <div className="request-time">{request.timestamp}</div>
                  </div>
                </div>
                
                <div className="request-actions">
                  {request.status === 'pending' ? (
                    <>
                      <button className="btn-approve" onClick={() => handleApprovePatientRequest(request.id)}>
                        <FaCheck />
                        Approve
                      </button>
                      <button className="btn-reject" onClick={() => handleDeclinePatientRequest(request.id)}>
                        <FaTimes />
                        Decline
                      </button>
                    </>
                  ) : (
                    <button className="btn-details" disabled>
                      {request.status === 'approved' ? 'Approved' : 'Declined'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          {patientRequests.length === 0 && (
            <div className="empty-requests">
              <FaBell />
              <h3>No patient requests</h3>
              <p>When patients request access, they'll appear here</p>
            </div>
          )}
        </div>

        {/* Access Management Tabs */}
        <div className="access-tabs">
          <div className={`tab ${activeTab === 'active' ? 'active' : ''}`} onClick={() => setActiveTab('active')}>
            <span className="tab-count">{rows.filter(r => r.status === 'active').length}</span>
            Active Access
          </div>
          <div className={`tab ${activeTab === 'pending' ? 'active' : ''}`} onClick={() => setActiveTab('pending')}>
            <span className="tab-count">{rows.filter(r => r.status === 'pending').length}</span>
            Pending Requests
          </div>
          <div className={`tab ${activeTab === 'history' ? 'active' : ''}`} onClick={() => setActiveTab('history')}>
            <span className="tab-count">{rows.length}</span>
            Access History
          </div>
          <div className={`tab ${activeTab === 'revoked' ? 'active' : ''}`} onClick={() => setActiveTab('revoked')}>
            <span className="tab-count">{rows.filter(r => r.status === 'revoked').length}</span>
            Revoked
          </div>
        </div>

        <div className="access-grid">
          {filtered.map((r) => (
            <div key={r.id} className="access-card">
              <div className="card-header">
                <div className="user-info">
                  <div className="user-avatar">{r.id}</div>
                  <div className="user-details">
                    <h3>{r.name}</h3>
                    <p>{r.email}</p>
                    <span className="role-badge">{r.role}</span>
                  </div>
                </div>
                <div className="status-section">
                  {r.status === 'active' && <span className="status-badge status-active"><FaCircle /> Active</span>}
                  {r.status === 'pending' && <span className="status-badge status-pending"><FaClock /> Pending</span>}
                  {r.status === 'revoked' && <span className="status-badge status-revoked"><FaCircle /> Revoked</span>}
                </div>
              </div>
              
              <div className="card-content">
                <div className="permissions-section">
                  <h4>Permissions</h4>
                  <div className="permissions-list">
                    {r.permissions.map((p) => (
                      <span key={p} className="permission-tag">{p}</span>
                    ))}
                  </div>
                </div>
                
                <div className="meta-section">
                  <div className="meta-item">
                    <FaClock />
                    <span>{r.lastAccessed}</span>
                  </div>
                </div>
              </div>
              
              <div className="card-actions">
                {r.status === 'pending' ? (
                  <>
                    <button className="btn-approve" onClick={() => setStatus(r.id, 'active')}>
                      <FaCheck />
                      Approve
                    </button>
                    <button className="btn-reject" onClick={() => setStatus(r.id, 'revoked')}>
                      <FaTimes />
                      Reject
                    </button>
                  </>
                ) : (
                  <>
                    <button className="btn-revoke" onClick={() => setStatus(r.id, 'revoked')}>
                      <FaUserTimes />
                      Revoke
                    </button>
                    <button className="btn-details" onClick={() => console.log('View details', r.id)}>
                      <FaEllipsisV />
                      Details
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
          
          {filtered.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon">
                <FaSearch />
              </div>
              <h3>No results found</h3>
              <p>Try adjusting your search criteria or selecting a different tab.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AccessManager;
