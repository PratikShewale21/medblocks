import React, { useState } from "react";
import { Link } from "react-router-dom";
import { 
  FaHeartbeat, 
  FaMicroscope, 
  FaLink, 
  FaSignOutAlt, 
  FaChartLine, // Replaced invalid FaActivity with FaChartLine
  FaFileMedical // Added for better medical context
} from "react-icons/fa";
import { predictDiabetes } from "../../api/diabetesApi";
import { useAuth } from "../../context/AuthContext";
import "./AiScan.css";

export default function AiScan() {
  const { user, logout } = useAuth();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Hardcoded inputs (Simulating data fetched from sensors/EHR)
  const vitals = {
    pregnancies: 5,
    glucose: 166,
    bp: 72,
    skin: 19,
    insulin: 175,
    bmi: 25.8,
    dpf: 0.587,
    age: 51
  };

  // Helper to format wallet address
  const formatAddress = (address) => {
    if (!address) return "No Wallet";
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  const runScan = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await predictDiabetes(vitals);
      setResult(res);
    } catch (err) {
      console.error(err);
      setError("Analysis failed. Please try again later.");
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
            <span>{formatAddress(user?.walletAddress)}</span>
          </div>
          <button className="logout-btn" onClick={logout}>
            <FaSignOutAlt />
            Logout
          </button>
        </div>
      </header>

      <section className="hero">
        <h1>AI Health Scan</h1>
        <p className="hero-subtitle">
          Advanced machine learning analysis of your vital signs to detect early health risks.
        </p>
      </section>

      <main className="container scan-container">
        
        {/* Vitals Display Card */}
        <div className="card">
          <div className="section-title">
            <FaFileMedical />
            Current Vitals
          </div>
          <p className="section-subtitle">
            Data synchronized from your health devices.
          </p>

          <div className="vitals-grid">
            <div className="vital-item">
              <span className="vital-label">Glucose</span>
              <span className="vital-value">{vitals.glucose} <small>mg/dL</small></span>
            </div>
            <div className="vital-item">
              <span className="vital-label">Blood Pressure</span>
              <span className="vital-value">{vitals.bp} <small>mmHg</small></span>
            </div>
            <div className="vital-item">
              <span className="vital-label">BMI</span>
              <span className="vital-value">{vitals.bmi}</span>
            </div>
            <div className="vital-item">
              <span className="vital-label">Insulin</span>
              <span className="vital-value">{vitals.insulin} <small>mu U/ml</small></span>
            </div>
            <div className="vital-item">
              <span className="vital-label">Age</span>
              <span className="vital-value">{vitals.age}</span>
            </div>
            <div className="vital-item">
              <span className="vital-label">Pregnancies</span>
              <span className="vital-value">{vitals.pregnancies}</span>
            </div>
          </div>

          <div className="action-area">
            <button 
              className="btn-scan" 
              onClick={runScan} 
              disabled={loading}
            >
              {loading ? (
                <>Processing Vitals...</>
              ) : (
                <>
                  <FaMicroscope /> Run Diagnostic Scan
                </>
              )}
            </button>
          </div>
          
          {error && <div className="error-message">{error}</div>}
        </div>

        {/* Results Card */}
        {result && (
          <div className="card result-card">
            <div className="section-title">
              <FaChartLine />
              Analysis Result
            </div>

            <div className={`result-box ${result.risk_level.toLowerCase()}`}>
              <div className="result-header">
                <span className="result-label">RISK ASSESSMENT</span>
                <span className="result-score">{result.risk_percentage}%</span>
              </div>

              <div className="result-body">
                <p>
                  <strong>Risk Level:</strong> {result.risk_level}
                </p>
                <p>
                  <strong>Prediction:</strong> {result.prediction === 1 ? "Positive Indicator" : "Negative Indicator"}
                </p>
                
                <div className="ai-note">
                  <FaHeartbeat />
                  <span>
                    {result.prediction === 1 
                      ? "The model has detected patterns consistent with diabetes. Please consult a doctor." 
                      : "No immediate risks detected based on current vitals. Maintain a healthy lifestyle."}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}