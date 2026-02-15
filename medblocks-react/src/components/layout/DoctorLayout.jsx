import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import { ethers } from 'ethers';
import { 
  FaHome, 
  FaUsers, 
  FaShieldAlt, 
  FaCog, 
  FaSignOutAlt,
  FaLink as FaLinkIcon
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import './DoctorLayout.css';

const DoctorLayout = () => {
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
    return location.pathname === path;
  };

  return (
    <div className="doctor-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo">
            <Link to="/doctor" style={{ textDecoration: 'none', color: 'inherit' }}>
              Med<span>Blocks</span>
            </Link>
          </div>
        </div>
        
        <nav className="sidebar-nav">
          <Link to="/doctor" className={`nav-item ${isActive('/doctor') ? 'active' : ''}`}>
            <FaHome />
            <span>Dashboard</span>
          </Link>
          <Link to="/doctor/patients" className={`nav-item ${isActive('/doctor/patients') ? 'active' : ''}`}>
            <FaUsers />
            <span>My Patients</span>
          </Link>
          <Link to="/doctor/access" className={`nav-item ${isActive('/doctor/access') ? 'active' : ''}`}>
            <FaShieldAlt />
            <span>Access Manager</span>
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

export default DoctorLayout;