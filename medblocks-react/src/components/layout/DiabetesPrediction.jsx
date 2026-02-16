import { useState } from "react";
import { predictDiabetes } from "../api/diabetesApi";

export default function DiabetesPrediction() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handlePredict = async () => {
    setLoading(true);
    setError(null);
    
    const payload = {
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
      const res = await predictDiabetes(payload);
      setResult(res);
    } catch (err) {
      console.error("Prediction failed:", err);
      setError("Failed to connect to AI model. Using demo data.");
      
      // Show demo results when API fails
      setResult({
        risk_percentage: 65,
        risk_level: "MODERATE",
        recommendations: [
          "Monitor blood glucose regularly",
          "Maintain healthy diet",
          "Exercise regularly",
          "Consult healthcare provider"
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <button onClick={handlePredict} disabled={loading}>
        {loading ? "Analyzing..." : "Predict Diabetes"}
      </button>

      {loading && (
        <div className="loading">
          <p>AI Risk Scan in progress...</p>
        </div>
      )}

      {error && (
        <div className="error">
          <p>{error}</p>
        </div>
      )}

      {result && (
        <div className="results">
          <h3>AI Risk Scan Results</h3>
          <h4>{result.risk_percentage}% Risk</h4>
          <p>Level: {result.risk_level}</p>
          
          {result.recommendations && (
            <div className="recommendations">
              <h5>Report Summary:</h5>
              <ul>
                {result.recommendations.map((rec, index) => (
                  <li key={index}>{rec}</li>
                ))}
              </ul>
            </div>
          )}
          
          <div className="action-buttons">
            <button 
              className="btn-secondary"
              onClick={() => {
                const reportData = {
                  prediction: result,
                  timestamp: new Date().toISOString(),
                  patientInfo: {
                    name: "Patient Name",
                    age: 51,
                    pregnancies: 5,
                    glucose: 166,
                    bp: 72,
                    skin: 19,
                    insulin: 175,
                    bmi: 25.8,
                    dpf: 0.587
                  }
                };
                
                const blob = new Blob([JSON.stringify(reportData, null, 2)], {
                  type: 'application/json'
                });
                
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `diabetes-report-${Date.now()}.json`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
              }}
            >
              Download Report
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
