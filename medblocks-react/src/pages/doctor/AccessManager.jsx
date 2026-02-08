import React, { useState } from 'react';
import { FaSearch, FaLink, FaFileExport, FaUserPlus, FaEllipsisV, FaUserTimes, FaCheck, FaTimes, FaCircle, FaClock } from 'react-icons/fa';
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

  return (
    <>
      <div className="header">
        <div className="search-bar">
          <FaSearch style={{ color: '#94A3B8' }} />
          <input value={query} onChange={(e) => setQuery(e.target.value)} type="text" placeholder="Search access logs..." />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div className="wallet"><FaLink /> 0x71C...A4f</div>
        </div>
      </div>

      <div className="access-container">
        <div className="access-header">
          <h2>Access Manager</h2>
          <div className="access-actions">
            <button className="btn btn-outline" type="button" onClick={() => console.log('Export')}
            >
              <FaFileExport /> Export
            </button>
            <button className="btn btn-primary" type="button" onClick={() => console.log('Grant Access')}
            >
              <FaUserPlus /> Grant Access
            </button>
          </div>
        </div>

        <div className="access-tabs">
          <div className={`tab ${activeTab === 'active' ? 'active' : ''}`} onClick={() => setActiveTab('active')}>Active Access</div>
          <div className={`tab ${activeTab === 'pending' ? 'active' : ''}`} onClick={() => setActiveTab('pending')}>Pending Requests</div>
          <div className={`tab ${activeTab === 'history' ? 'active' : ''}`} onClick={() => setActiveTab('history')}>Access History</div>
          <div className={`tab ${activeTab === 'revoked' ? 'active' : ''}`} onClick={() => setActiveTab('revoked')}>Revoked</div>
        </div>

        <div className="table-responsive">
          <table className="access-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Permissions</th>
                <th>Last Accessed</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id}>
                  <td>
                    <div className="user-info">
                      <div className="user-avatar">{r.id}</div>
                      <div>
                        <div className="user-name">{r.name}</div>
                        <div className="user-email">{r.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>{r.role}</td>
                  <td>
                    {r.permissions.map((p) => (
                      <span key={p} className="permission-tag">{p}</span>
                    ))}
                  </td>
                  <td>{r.lastAccessed}</td>
                  <td>
                    {r.status === 'active' && <span className="status-badge status-active"><FaCircle /> Active</span>}
                    {r.status === 'pending' && <span className="status-badge status-pending"><FaClock /> Pending Approval</span>}
                    {r.status === 'revoked' && <span className="status-badge status-revoked"><FaCircle /> Revoked</span>}
                  </td>
                  <td>
                    {r.status === 'pending' ? (
                      <>
                        <button className="action-btn" title="Approve" style={{ color: '#10B981' }} onClick={() => setStatus(r.id, 'active')}>
                          <FaCheck />
                        </button>
                        <button className="action-btn" title="Reject" style={{ color: '#EF4444' }} onClick={() => setStatus(r.id, 'revoked')}>
                          <FaTimes />
                        </button>
                      </>
                    ) : (
                      <>
                        <button className="action-btn" title="Revoke Access" onClick={() => setStatus(r.id, 'revoked')}>
                          <FaUserTimes />
                        </button>
                        <button className="action-btn" title="View Details" onClick={() => console.log('View details', r.id)}>
                          <FaEllipsisV />
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6}>
                    <div className="empty-state">
                      <h3>No results</h3>
                      <p>Try changing your search or tab.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default AccessManager;
