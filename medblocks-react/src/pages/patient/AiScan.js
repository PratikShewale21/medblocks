import React, { useState } from "react";
import { predictDiabetes } from "../../api/diabetesApi";
import "./AiScan.css";

export default function AiScan() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const runScan = async () => {
    setLoading(true);

    const input = {
      pregnancies: 5,
      glucose: 166,
      bp: 72,
      skin: 19,
      insulin: 175,
      bmi: 25.8,
      dpf: 0.587,
      age: 51
    };

    try {
      const res = await predictDiabetes(input);
      setResult(res);
    } catch (err) {
      console.error(err);
      alert("Diabetes prediction failed");
    }

    setLoading(false);
  };

  return (
    <div className="ai-scan">
      <h2>AI Risk Scan</h2>

      <button onClick={runScan} disabled={loading}>
        {loading ? "Scanning..." : "Run AI Scan"}
      </button>

      {result && (
        <div className="result-box">
          <p><b>Risk Percentage:</b> {result.risk_percentage}%</p>
          <p><b>Risk Level:</b> {result.risk_level}</p>
          <p><b>Prediction:</b> {result.prediction === 1 ? "Diabetic" : "Not Diabetic"}</p>
        </div>
      )}
    </div>
  );
}
