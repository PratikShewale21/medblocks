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
  FaSignOutAlt,
  FaFileMedical,
  FaHome
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
      <section className="hero">
        <h1>Welcome back, Patient</h1>
        <p>Manage your health records with AI-powered insights and secure blockchain storage</p>
      </section>

      <main className="dashboard-content">
        <section className="section">
          <h2 className="section-title">Quick Actions</h2>
          <div className="cards">
            <Link to="/patient/ai-scan" className="card">
              <div className="card-header">
                <div className="card-icon">
                  <FaHeartbeat />
                </div>
                <h3 className="card-title">AI Risk Scan</h3>
              </div>
              <p className="card-desc">Run diagnostic ML models on your verified medical history</p>
              <div className="card-action">→</div>
            </Link>
            <Link to="/patient/secure-vault" className="card">
              <div className="card-header">
                <div className="card-icon">
                  <FaFolderOpen />
                </div>
                <h3 className="card-title">Secure Vault</h3>
              </div>
              <p className="card-desc">Access your IPFS-stored reports and view AI-generated summaries</p>
              <div className="card-action">→</div>
            </Link>
            <Link to="/patient/pill-tracker" className="card">
              <div className="card-header">
                <div className="card-icon">
                  <FaCapsules />
                </div>
                <h3 className="card-title">Pill Tracker</h3>
              </div>
              <p className="card-desc">Monitor treatment adherence with predictive behavioral alerts</p>
              <div className="card-action">→</div>
            </Link>
            <Link to="/patient/share-access" className="card">
              <div className="card-header">
                <div className="card-icon">
                  <FaUserShield />
                </div>
                <h3 className="card-title">Share Access</h3>
              </div>
              <p className="card-desc">Manage smart contract permissions for your doctors</p>
              <div className="card-action">→</div>
            </Link>
            <Link to="/patient/report-summary" className="card">
              <div className="card-header">
                <div className="card-icon">
                  <FaFileMedical />
                </div>
                <h3 className="card-title">Report Summary</h3>
              </div>
              <p className="card-desc">View comprehensive AI-generated medical summaries and insights</p>
              <div className="card-action">→</div>
            </Link>
          </div>
        </section>
      </main>

      <footer className="status-bar">
        <div className="status">
          <div className="status-dot"></div>
          <span>Node Connected</span>
        </div>
        <div className="status">
          <div className="status-dot"></div>
          <span>Vault Encrypted</span>
        </div>
      </footer>
    </>
  );
};

export default Dashboard;

