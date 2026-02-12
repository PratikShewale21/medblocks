import React, { useState } from "react";
import { Link } from "react-router-dom";
import { 
  FaPills, 
  FaChartLine, 
  FaLink, 
  FaSignOutAlt, 
  FaCheckCircle, 
  FaExclamationTriangle 
} from "react-icons/fa";
import { predictAdherence } from "../../api/adherenceApi";
import { useAuth } from "../../context/AuthContext"; // Import Auth Context
import "./PillTracker.css";

const PillTracker = () => {
  const { user, logout } = useAuth(); // Get user and logout function
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [isTaken, setIsTaken] = useState(false);

  // Example state (later this comes from DB / user history)
  const [adherenceData] = useState({
    missed_doses_last_7_days: 2,
    avg_delay_minutes: 45,
    adherence_rate_30_days: 68,
  });

  // Helper to format wallet address
  const formatAddress = (address) => {
    if (!address) return "No Wallet";
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  const handleCheckAdherence = async () => {
    setLoading(true);
    setError(null);
    setIsTaken(true);

    try {
      const response = await predictAdherence(adherenceData);
      setResult(response);
    } catch (err) {
      setError("Unable to fetch adherence prediction");
    } finally {
      setLoading(false);
    }
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
            {/* Display dynamic wallet address */}
            <span>{formatAddress(user?.walletAddress)}</span>
          </div>
          <button className="logout-btn" onClick={logout}>
            <FaSignOutAlt />
            Logout
          </button>
        </div>
      </header>

      <section className="hero">
        <h1>Pill Tracker</h1>
        <p className="hero-subtitle">
          Track your daily medications and analyze your adherence patterns with AI.
        </p>
      </section>

      <main className="container pill-container">
        {/* Medication Card */}
        <div className="card">
          <div className="section-title">
            <FaPills />
            Today's Schedule
          </div>
          
          <div className="med-item">
            <div className="med-info">
              <div className="med-icon">
                <FaPills />
              </div>
              <div>
                <div className="med-name">Metformin (500mg)</div>
                <div className="med-time">
                  <FaCheckCircle className="icon-small" /> 9:00 AM • Before Breakfast
                </div>
              </div>
            </div>
            
            <div className="med-actions">
               {isTaken ? (
                 <span className="status-label status-taken">
                   TAKEN
                 </span>
               ) : (
                 <button 
                   className="btn-action btn-take" 
                   onClick={handleCheckAdherence}
                   disabled={loading}
                 >
                   {loading ? "Processing..." : "Mark as Taken"}
                 </button>
               )}
            </div>
          </div>
          
          {error && <div className="error-box">{error}</div>}
        </div>

        {/* Analysis Card */}
        {(loading || result) && (
          <div className="card">
            <div className="section-title">
              <FaChartLine />
              AI Adherence Analysis
            </div>
            <p className="section-subtitle">Real-time risk assessment based on your intake history.</p>

            {loading ? (
              <div className="loading-state">Analyzing adherence patterns...</div>
            ) : (
              result && (
                <div className={`analysis-box ${result.risk_level.toLowerCase()}`}>
                  <div className="risk-header">
                    <span className="risk-label">RISK LEVEL: {result.risk_level}</span>
                    <span className="risk-score">{result.risk_percentage}%</span>
                  </div>

                  <div className="risk-details">
                    <p>
                      <strong>Miss Next Dose Prediction:</strong>{" "}
                      {result.will_miss_next_dose ? "LIKELY" : "UNLIKELY"}
                    </p>
                  </div>

                  {result.risk_level !== "LOW" && (
                    <div className="ai-suggestion">
                      <FaExclamationTriangle />
                      <span>Smart Suggestion: Keep your medicine visible on your nightstand and enable push reminders.</span>
                    </div>
                  )}
                </div>
              )
            )}
          </div>
        )}
      </main>
    </>
  );
};

export default PillTracker;