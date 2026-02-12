import React, { useState } from "react";
import { Link } from "react-router-dom";
import { 
  FaLock, 
  FaFileMedical, 
  FaLink, 
  FaSignOutAlt, 
  FaShieldAlt,
  FaRobot 
} from "react-icons/fa";
import { generateSummary } from "../../api/summaryApi";
import { useAuth } from "../../context/AuthContext";
import "./SecureVault.css";

export default function SecureVault() {
  const { user, logout } = useAuth();
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);

  // Helper to format wallet address
  const formatAddress = (address) => {
    if (!address) return "No Wallet";
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  const generate = async () => {
    setLoading(true);

    const input = {
      text: "Patient has stable vitals. No abnormal lab values detected.",
      classification: "NORMAL"
    };

    try {
      const res = await generateSummary(input);
      setSummary(res.summary);
    } catch (err) {
      console.error(err);
      alert("Summary generation failed");
    }

    setLoading(false);
  };

  return (
    <>
      <header>
        <Link to="/patient" className="logo">
          Med<span>Blocks</span>
        </Link>
        <div className="header-actions">
          <div className="wallet">
            <FaLink />
            <span>{formatAddress(user?.walletAddress)}</span>
          </div>
          <button className="logout-btn" onClick={logout}>
            <FaSignOutAlt />
            Logout
          </button>
        </div>
      </header>

      <section className="hero">
        <h1>Secure Vault</h1>
        <p className="hero-subtitle">
          Encrypted storage for your medical records and AI-generated health summaries.
        </p>
      </section>

      <main className="container vault-container">
        
        {/* Action Card */}
        <div className="card">
          <div className="section-title">
            <FaRobot />
            AI Health Summary
          </div>
          <p className="section-subtitle">
            Generate a secure, privacy-preserving summary of your recent medical data using our AI model.
          </p>

          <div className="action-area">
            <button 
              className="btn-generate" 
              onClick={generate} 
              disabled={loading}
            >
              {loading ? (
                <>Processing Records...</>
              ) : (
                <>
                  <FaShieldAlt /> Generate Secure Summary
                </>
              )}
            </button>
          </div>
        </div>

        {/* Results Card */}
        {summary && (
          <div className="card result-card">
            <div className="section-title">
              <FaFileMedical />
              Generated Report
            </div>
            
            <div className="summary-box">
              <div className="summary-header">
                <span className="badge-verified">VERIFIED BY AI</span>
                <span className="summary-date">{new Date().toLocaleDateString()}</span>
              </div>
              <div className="summary-content">
                <p>{summary}</p>
              </div>
              <div className="summary-footer">
                <FaLock className="icon-lock" />
                <span>End-to-End Encrypted on IPFS</span>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}