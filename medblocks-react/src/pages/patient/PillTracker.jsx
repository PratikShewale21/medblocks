import React, { useState } from "react";
import "./PillTracker.css";
import { predictAdherence } from "../../api/adherenceApi";

const PillTracker = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  // 🔹 Example state (later this comes from DB / user history)
  const [adherenceData, setAdherenceData] = useState({
    missed_doses_last_7_days: 2,
    avg_delay_minutes: 45,
    adherence_rate_30_days: 68,
  });

  const handleCheckAdherence = async () => {
    setLoading(true);
    setError(null);

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
    <div className="pill-tracker-container">
      <h2>Pill Tracker</h2>

      {/* Medication Card */}
      <div className="pill-card">
        <h3>Metformin (500mg)</h3>
        <p>Time: 9:00 AM • Before Breakfast</p>

        <button className="taken-btn" onClick={handleCheckAdherence}>
          Mark as Taken
        </button>
      </div>

      {/* Loading */}
      {loading && <p>Analyzing adherence pattern...</p>}

      {/* Error */}
      {error && <p className="error">{error}</p>}

      {/* Result */}
      {result && (
        <div className={`adherence-result ${result.risk_level.toLowerCase()}`}>
          <h3>AI Adherence Analysis</h3>

          <p>
            <strong>Miss Next Dose:</strong>{" "}
            {result.will_miss_next_dose ? "YES" : "NO"}
          </p>

          <p>
            <strong>Risk Percentage:</strong> {result.risk_percentage}%
          </p>

          <p>
            <strong>Risk Level:</strong> {result.risk_level}
          </p>

          {result.risk_level !== "LOW" && (
            <div className="alert-box">
              ⚠️ Smart Suggestion: Keep your medicine visible and enable reminders.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PillTracker;
