// import React, { useState } from "react";
// import { predictDiabetes } from "../../api/diabetesApi";
// import "./AiScan.css";

// export default function AiScan() {
//   const [result, setResult] = useState(null);
//   const [loading, setLoading] = useState(false);

//   const runScan = async () => {
//     setLoading(true);

//     const input = {
//       pregnancies: 5,
//       glucose: 166,
//       bp: 72,
//       skin: 19,
//       insulin: 175,
//       bmi: 25.8,
//       dpf: 0.587,
//       age: 51
//     };

//     try {
//       const res = await predictDiabetes(input);
//       setResult(res);
//     } catch (err) {
//       console.error(err);
//       alert("Diabetes prediction failed");
//     }

//     setLoading(false);
//   };

//   return (
//     <div className="ai-scan">
//       <h2>AI Risk Scan</h2>

//       <button onClick={runScan} disabled={loading}>
//         {loading ? "Scanning..." : "Run AI Scan"}
//       </button>

//       {result && (
//         <div className="result-box">
//           <p><b>Risk Percentage:</b> {result.risk_percentage}%</p>
//           <p><b>Risk Level:</b> {result.risk_level}</p>
//           <p><b>Prediction:</b> {result.prediction === 1 ? "Diabetic" : "Not Diabetic"}</p>
//         </div>
//       )}
//     </div>
//   );
// }


import React, { useState } from "react";
import { predictDiabetes } from "../../api/diabetesApi";
import "./AiScan.css";

export default function AiScan() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const runScan = async () => {
    setLoading(true);
    const input = {
      pregnancies: 5, glucose: 166, bp: 72,
      skin: 19, insulin: 175, bmi: 25.8,
      dpf: 0.587, age: 51
    };

    try {
      const res = await predictDiabetes(input);
      setResult(res);
    } catch (err) {
      console.error(err);
      alert("Diabetes prediction failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ai-scan-container">
      <div className="scan-card">
        <header className="scan-header">
          <h2>AI Risk Assessment</h2>
          <p>Analyze health metrics using our predictive model.</p>
        </header>

        <div className="action-section">
          <button 
            className={`scan-button ${loading ? "loading" : ""}`} 
            onClick={runScan} 
            disabled={loading}
          >
            {loading ? <span className="spinner"></span> : "Run Diagnostic Scan"}
          </button>
        </div>

        {result && (
          <div className="result-container">
            <div className={`risk-badge ${result.risk_level.toLowerCase()}`}>
              {result.risk_level} Risk
            </div>
            
            <div className="stats-grid">
              <div className="stat-item">
                <span className="label">Confidence</span>
                <span className="value">{result.risk_percentage}%</span>
              </div>
              <div className="stat-item">
                <span className="label">Status</span>
                <span className="value">
                  {result.prediction === 1 ? "Diabetic Indicator" : "Normal"}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}