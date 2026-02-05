import { useState } from "react";
import { predictDiabetes } from "../api/diabetesApi";

export default function DiabetesPrediction() {
  const [result, setResult] = useState(null);

  const handlePredict = async () => {
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

    const res = await predictDiabetes(payload);
    setResult(res);
  };

  return (
    <div className="card">
      <button onClick={handlePredict}>Predict Diabetes</button>

      {result && (
        <>
          <h3>{result.risk_percentage}% Risk</h3>
          <p>Level: {result.risk_level}</p>
        </>
      )}
    </div>
  );
}
