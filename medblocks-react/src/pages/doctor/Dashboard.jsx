import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { 
  FaUsers, 
  FaFolderOpen, 
  FaShieldAlt, 
  FaLink, 
  FaCheckCircle,
  FaArrowRight
} from 'react-icons/fa';
import "./Dashboard.css";

const Dashboard = () => {
  const [stats, setStats] = useState({
    activePatients: 0,
    networkName: "Connecting...",
    walletConnected: false,
    doctorAddress: ""
  });

  useEffect(() => {
    const fetchDashboardState = async () => {
      if (window.ethereum) {
        try {
          const provider = new ethers.BrowserProvider(window.ethereum);
          const signer = await provider.getSigner();
          const address = await signer.getAddress();
          const network = await provider.getNetwork();
          
          const stored = JSON.parse(localStorage.getItem(`doctorPatients_${address}`) || '[]');
          
          setStats({
            activePatients: stored.length,
            networkName: network.name === 'unknown' ? 'Hardhat / Local' : network.name,
            walletConnected: true,
            doctorAddress: address
          });
        } catch (err) {
          console.error("Dashboard sync error:", err);
        }
      }
    };
    fetchDashboardState();
  }, []);

  return (
    <div className="dashboard-container">
      {/* Header Section */}
      <header className="dashboard-header">
        <div className="header-text">
          <h1>Doctor <span>Portal</span></h1>
          <p>Secure Blockchain Medical Records Management System</p>
        </div>
        <div className={`connection-badge ${stats.walletConnected ? 'online' : 'offline'}`}>
          {stats.walletConnected && <span className="pulse-dot"></span>}
          {stats.walletConnected ? "Blockchain Live" : "Connection Offline"}
        </div>
      </header>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon patient-bg"><FaUsers /></div>
          <div className = "stat-info">
            <h3>{stats.activePatients}</h3>
            <p>Authorized Patients</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon vault-bg"><FaFolderOpen /></div>
          <div className="stat-info">
            <h3>Encrypted</h3>
            <p>Storage Integrity</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon network-bg"><FaShieldAlt /></div>
          <div className="stat-info">
            <h3>{stats.networkName.toUpperCase()}</h3>
            <p>Active Network</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon wallet-bg">
            {stats.walletConnected ? <FaCheckCircle style={{color: '#10b981'}}/> : <FaLink />}
          </div>
          <div className="stat-info">
            <h3>{stats.walletConnected ? "Linked" : "Disconnected"}</h3>
            <p>MetaMask Status</p>
          </div>
        </div>
      </div>

      {/* Full-Width Quick Access Section */}
      <div className="dashboard-content-full">
        <section className="dashboard-section actions">
          <h3>Quick Access</h3>
          <div className="action-grid-full">
            <div className="action-card-item" onClick={() => window.location.href='/doctor/patients'}>
              <div className="action-details">
                <h4>Medical Vaults</h4>
                <p>View decrypted health records & images</p>
              </div>
              <FaArrowRight />
            </div>
            
            <div className="action-card-item" onClick={() => window.location.href='/doctor/access'}>
              <div className="action-details">
                <h4>Access Manager</h4>
                <p>Request new permissions from patients</p>
              </div>
              <FaArrowRight />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;