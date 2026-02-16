import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import { ethers } from 'ethers';
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
  
  // State to store the connected wallet address
  const [walletAddress, setWalletAddress] = useState("");

  // Fetch the wallet address on load
  useEffect(() => {
    const fetchWallet = async () => {
      if (window.ethereum) {
        try {
          const provider = new ethers.BrowserProvider(window.ethereum);
          const signer = await provider.getSigner();
          const address = await signer.getAddress();
          setWalletAddress(address);
        } catch (err) {
          console.error("Wallet not connected", err);
        }
      }
    };
    fetchWallet();
  }, []);

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  const isActive = (path) => {
    if (path === '/patient') {
      return location.pathname === '/patient';
    }
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
          <Link to="/patient" className={`nav-item ${isActive('/patient') ? 'active' : ''}`}>
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
            {/* Display dynamic wallet address here */}
            <span>
              {walletAddress 
                ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` 
                : "Not Connected"}
            </span>
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