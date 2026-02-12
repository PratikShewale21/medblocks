// import React from 'react';
// import { 
//   FaSearch,
//   FaExclamationTriangle,
//   FaRobot,
//   FaLink,
//   FaPills
// } from 'react-icons/fa';
// import './Dashboard.css';

// const Dashboard = () => {
//   return (
//     <>
//       <div className="header">
//         <div className="search-bar">
//           <FaSearch style={{ color: '#94A3B8' }} />
//           <input type="text" placeholder="Search by Wallet Address (0x...) or Patient ID" />
//         </div>
//         <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
//           <span style={{ fontSize: '0.8rem', color: '#64748B' }}>
//             Chain: <strong>Sepolia Testnet</strong>
//           </span>
//           <img
//             src="https://i.pravatar.cc/40?img=12"
//             style={{ borderRadius: '50%', border: '2px solid var(--accent)' }}
//             alt="Doctor Avatar"
//           />
//         </div>
//       </div>

//       <div className="dashboard-grid">
//         <div className="left-col">
//           <div className="card">
//             <div className="card-header">
//               <div className="card-title">
//                 <FaExclamationTriangle style={{ color: 'var(--risk)' }} /> High Risk Alerts (ML-Powered)
//               </div>
//               <span style={{ fontSize: '0.75rem', color: '#64748B' }}>Updating in real-time</span>
//             </div>

//             <div className="patient-row">
//               <div><strong>Sarah Connor</strong><br /><small>Last Visit: 2 days ago</small></div>
//               <div className="risk-score high-risk">88% Diabetes Risk</div>
//               <button className="btn-view" onClick={() => console.log('View patient data')}>View Decrypted Data</button>
//             </div>
//             <div className="patient-row">
//               <div><strong>John Doe</strong><br /><small>Last Visit: 1 week ago</small></div>
//               <div className="risk-score" style={{ background: '#FEF3C7', color: '#92400E' }}>62% Hypertension</div>
//               <button className="btn-view" onClick={() => console.log('View patient data')}>View Decrypted Data</button>
//             </div>
//             <div className="patient-row">
//               <div><strong>Ellen Ripley</strong><br /><small>Last Visit: Yesterday</small></div>
//               <div className="risk-score" style={{ background: '#D1FAE5', color: '#065F46' }}>12% Stable</div>
//               <button className="btn-view" onClick={() => console.log('View patient data')}>View Decrypted Data</button>
//             </div>
//           </div>

//           <div className="card">
//             <div className="card-title"><FaRobot style={{ color: 'var(--accent)' }} /> Smart Summaries (NLP)</div>
//             <div style={{ marginTop: '20px' }}>
//               <p style={{ fontSize: '0.9rem', fontWeight: 600 }}>Latest Scan: Blood_Report_Jan2026.pdf</p>
//               <div className="summary-box">
//                 <p style={{ fontSize: '0.85rem', lineHeight: '1.5' }}>
//                   Patient shows elevated HbA1c (7.2%). Fasting glucose is 126 mg/dL. AI recommends immediate lifestyle intervention and potential Metformin startup.
//                 </p>
//                 <span className="hash-code">IPFS CID: QmXoyp...78hj | Verified by AI-Node #4</span>
//               </div>
//             </div>
//           </div>
//         </div>

//         <div className="right-col">
//           <div className="card" style={{ borderTop: '4px solid var(--accent)' }}>
//             <div className="card-title"><FaLink /> Blockchain Access</div>
//             <div style={{ marginTop: '20px' }}>
//               <button className="btn-view" style={{ width: '100%', marginBottom: '20px', padding: '12px' }} onClick={() => console.log('Request patient access')}>
//                 + Request Patient Access
//               </button>

//               <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '10px' }}>Pending Requests</div>
//               <div className="patient-row" style={{ padding: '10px 0' }}>
//                 <span style={{ fontSize: '0.8rem' }}>0x8f2a...b9c1</span>
//                 <span className="status-pill pending">PENDING</span>
//               </div>
//               <div className="patient-row" style={{ padding: '10px 0' }}>
//                 <span style={{ fontSize: '0.8rem' }}>0x3d4e...a5f2</span>
//                 <span className="status-pill approved">APPROVED</span>
//               </div>
//               <p style={{ fontSize: '0.7rem', color: '#94A3B8', marginTop: '15px' }}>Note: Access is cryptographically revoked after 24 hours.</p>
//             </div>
//           </div>

//           <div className="card">
//             <div className="card-title"><FaPills style={{ color: 'var(--success)' }} /> Adherence Logs</div>
//             <p style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '10px' }}>Verified Behavioral History</p>
//             <div style={{ textAlign: 'center', marginTop: '15px' }}>
//               <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--success)' }}>94%</div>
//               <small>Patient Trust Score</small>
//             </div>
//           </div>
//         </div>
//       </div>
//     </>
//   );
// };

// export default Dashboard;

import React from 'react';
import { 
  FaSearch,
  FaExclamationTriangle,
  FaRobot,
  FaLink,
  FaPills
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext'; // Import useAuth hook
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth(); // Access the authenticated user object

  // Helper to format the wallet address for display
  const formatAddress = (address) => {
    if (!address) return "Not Connected";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <>
      <div className="header">
        <div className="search-bar">
          <FaSearch style={{ color: '#94A3B8' }} />
          <input type="text" placeholder="Search by Wallet Address (0x...) or Patient ID" />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ textAlign: 'right', marginRight: '10px' }}>
            <div style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>
              Dr. {user?.name || 'Physician'} {/* Display actual doctor name */}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
              Wallet: {formatAddress(user?.walletAddress)} {/* Display actual wallet address */}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <span style={{ fontSize: '0.8rem', color: '#64748B' }}>
              Chain: <strong>Sepolia Testnet</strong>
            </span>
            <img
              src={user?.avatar || "https://i.pravatar.cc/40?img=12"}
              style={{ borderRadius: '50%', border: '2px solid var(--accent)' }}
              alt="Doctor Avatar"
            />
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="left-col">
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <FaExclamationTriangle style={{ color: 'var(--risk)' }} /> High Risk Alerts (ML-Powered)
              </div>
              <span style={{ fontSize: '0.75rem', color: '#64748B' }}>Updating in real-time</span>
            </div>

            <div className="patient-row">
              <div><strong>Sarah Connor</strong><br /><small>Last Visit: 2 days ago</small></div>
              <div className="risk-score high-risk">88% Diabetes Risk</div>
              <button className="btn-view" onClick={() => console.log('View patient data')}>View Decrypted Data</button>
            </div>
            <div className="patient-row">
              <div><strong>John Doe</strong><br /><small>Last Visit: 1 week ago</small></div>
              <div className="risk-score" style={{ background: '#FEF3C7', color: '#92400E' }}>62% Hypertension</div>
              <button className="btn-view" onClick={() => console.log('View patient data')}>View Decrypted Data</button>
            </div>
            <div className="patient-row">
              <div><strong>Ellen Ripley</strong><br /><small>Last Visit: Yesterday</small></div>
              <div className="risk-score" style={{ background: '#D1FAE5', color: '#065F46' }}>12% Stable</div>
              <button className="btn-view" onClick={() => console.log('View patient data')}>View Decrypted Data</button>
            </div>
          </div>

          <div className="card">
            <div className="card-title"><FaRobot style={{ color: 'var(--accent)' }} /> Smart Summaries (NLP)</div>
            <div style={{ marginTop: '20px' }}>
              <p style={{ fontSize: '0.9rem', fontWeight: 600 }}>Latest Scan: Blood_Report_Jan2026.pdf</p>
              <div className="summary-box">
                <p style={{ fontSize: '0.85rem', lineHeight: '1.5' }}>
                  Patient shows elevated HbA1c (7.2%). Fasting glucose is 126 mg/dL. AI recommends immediate lifestyle intervention and potential Metformin startup.
                </p>
                <span className="hash-code">IPFS CID: QmXoyp...78hj | Verified by AI-Node #4</span>
              </div>
            </div>
          </div>
        </div>

        <div className="right-col">
          <div className="card" style={{ borderTop: '4px solid var(--accent)' }}>
            <div className="card-title"><FaLink /> Blockchain Access</div>
            <div style={{ marginTop: '20px' }}>
              <button className="btn-view" style={{ width: '100%', marginBottom: '20px', padding: '12px' }} onClick={() => console.log('Request patient access')}>
                + Request Patient Access
              </button>

              <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '10px' }}>Pending Requests</div>
              <div className="patient-row" style={{ padding: '10px 0' }}>
                <span style={{ fontSize: '0.8rem' }}>0x8f2a...b9c1</span>
                <span className="status-pill pending">PENDING</span>
              </div>
              <div className="patient-row" style={{ padding: '10px 0' }}>
                <span style={{ fontSize: '0.8rem' }}>0x3d4e...a5f2</span>
                <span className="status-pill approved">APPROVED</span>
              </div>
              <p style={{ fontSize: '0.7rem', color: '#94A3B8', marginTop: '15px' }}>Note: Access is cryptographically revoked after 24 hours.</p>
            </div>
          </div>

          <div className="card">
            <div className="card-title"><FaPills style={{ color: 'var(--success)' }} /> Adherence Logs</div>
            <p style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '10px' }}>Verified Behavioral History</p>
            <div style={{ textAlign: 'center', marginTop: '15px' }}>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--success)' }}>94%</div>
              <small>Patient Trust Score</small>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;