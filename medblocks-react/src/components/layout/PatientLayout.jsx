import React from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import { 
  FaHeartbeat, 
  FaFolderOpen, 
  FaCapsules, 
  FaUserShield,
  FaLink as FaLinkIcon,
  FaSignOutAlt,
  FaFileMedical,
  FaHome
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import './PatientLayout.css';

const PatientLayout = () => {
  const { logout } = useAuth();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="patient-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo">
            <Link to="/patient" style={{ textDecoration: 'none', color: 'inherit' }}>
              Med<span>Blocks</span>
            </Link>
          </div>
        </div>
        
        <nav className="sidebar-nav">
          <Link to="/patient/dashboard" className={`nav-item ${isActive('/patient/dashboard') ? 'active' : ''}`}>
            <FaHome />
            <span>Dashboard</span>
          </Link>
          <Link to="/patient/ai-scan" className={`nav-item ${isActive('/patient/ai-scan') ? 'active' : ''}`}>
            <FaHeartbeat />
            <span>AI Risk Scan</span>
          </Link>
          <Link to="/patient/secure-vault" className={`nav-item ${isActive('/patient/secure-vault') ? 'active' : ''}`}>
            <FaFolderOpen />
            <span>Secure Vault</span>
          </Link>
          <Link to="/patient/pill-tracker" className={`nav-item ${isActive('/patient/pill-tracker') ? 'active' : ''}`}>
            <FaCapsules />
            <span>Pill Tracker</span>
          </Link>
          <Link to="/patient/share-access" className={`nav-item ${isActive('/patient/share-access') ? 'active' : ''}`}>
            <FaUserShield />
            <span>Share Access</span>
          </Link>
          <Link to="/patient/report-summary" className={`nav-item ${isActive('/patient/report-summary') ? 'active' : ''}`}>
            <FaFileMedical />
            <span>Report Summary</span>
          </Link>
        </nav>

        <div className="sidebar-footer">
          <div className="wallet">
            <FaLinkIcon />
            <span>0x71C...A4f</span>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            <FaSignOutAlt />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="main-content">
        <Outlet />
      </div>
    </div>
  );
};

export default PatientLayout;
