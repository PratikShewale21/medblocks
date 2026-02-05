import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FaHeartbeat, 
  FaFolderOpen, 
  FaCapsules, 
  FaUserShield,
  FaCheckCircle,
  FaShieldAlt,
  FaLink as FaLinkIcon,
  FaSignOutAlt
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import './Dashboard.css';

const Dashboard = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      <header>
        <div className="logo">
          <Link to="/patient" style={{ textDecoration: 'none', color: 'inherit' }}>
            Med<span>Blocks</span>
          </Link>
        </div>
        <div className="header-actions">
          <div className="wallet">
            <FaLinkIcon />
            <span>0x71C...A4f</span>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            <FaSignOutAlt />
            Logout
          </button>
        </div>
      </header>

      <section className="hero">
        <h1>Welcome back, Patient</h1>
        <div className="status-strip">
          <span><FaCheckCircle /> Node Connected</span>
          <span><FaShieldAlt /> Vault Encrypted</span>
        </div>
      </section>

      <main className="main-grid">
        <Link to="/patient/ai-scan" className="card-link">
          <div className="card">
            <FaHeartbeat style={{ color: '#3B82F6' }} />
            <h3>AI Risk Scan</h3>
            <p>Run diagnostic ML models on your verified medical history.</p>
          </div>
        </Link>
        <Link to="/patient/secure-vault" className="card-link">
          <div className="card">
            <FaFolderOpen style={{ color: '#10B981' }} />
            <h3>Secure Vault</h3>
            <p>Access your IPFS-stored reports and view AI-generated summaries.</p>
          </div>
        </Link>
        <Link to="/patient/pill-tracker" className="card-link">
          <div className="card">
            <FaCapsules style={{ color: '#F59E0B' }} />
            <h3>Pill Tracker</h3>
            <p>Monitor treatment adherence with predictive behavioral alerts.</p>
          </div>
        </Link>
        <Link to="/patient/share-access" className="card-link">
          <div className="card">
            <FaUserShield style={{ color: '#8B5CF6' }} />
            <h3>Share Access</h3>
            <p>Manage smart contract permissions for your doctors.</p>
          </div>
        </Link>
      </main>

      <section className="feed-section">
        <h2 style={{ marginBottom: '20px' }}>Recent Activity</h2>
        <div className="feed-card">
          <div className="feed-item">
            <div>
              <span className="tag tag-ml">AI Insight</span>
              <span style={{ marginLeft: '10px' }}>Diabetes Risk Scan Complete</span>
            </div>
            <div style={{ fontSize: '0.7rem', color: '#94A3B8' }}>2 mins ago</div>
          </div>
          <div className="feed-item">
            <div>
              <span className="tag tag-bc">Blockchain</span>
              <span style={{ marginLeft: '10px' }}>New CID added to Medical Vault</span>
            </div>
            <div style={{ fontSize: '0.7rem', color: '#94A3B8' }}>1 hour ago</div>
          </div>
          <div className="feed-item">
            <div>
              <span className="tag tag-ml">NLP Summary</span>
              <span style={{ marginLeft: '10px' }}>Blood Report summarized successfully</span>
            </div>
            <div style={{ fontSize: '0.7rem', color: '#94A3B8' }}>Yesterday</div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Dashboard;
