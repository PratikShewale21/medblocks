import { useEffect, useState } from "react";
import { predictAdherence } from "../api/adherenceApi";

const getNextDoseRisk = () => {
  if (!result) return "--";

  const risk = result.risk_percentage;

  if (risk >= 70) return "LIKELY TO MISS";
  if (risk >= 40) return "MODERATE RISK";
  return "LIKELY TO TAKE";
};

export default function AdherenceCard() {
  const [result, setResult] = useState(null);

  const getNextDoseRisk = () => {
    if (!result) return "--";

    const risk = result.risk_percentage;

    if (risk >= 70) return "LIKELY TO MISS";
    if (risk >= 40) return "MODERATE RISK";
    return "LIKELY TO TAKE";
  };

  useEffect(() => {
    const fetchData = async () => {
  try {
    const res = await predictAdherence();
    setResult(res);
  } catch (error) {
    console.error('Failed to fetch adherence data:', error);
  }
};

    fetchData();
  }, []);

  if (!result) return null;

  return (
    <div className="adherence-card">
      <h2>{result.risk_percentage} Prob.</h2>
      <p>{result.risk_level} Risk</p>
      
      {getNextDoseRisk() && (
        <p className="warning">High chance of missing tonight's dose</p>
      )}
    </div>
  );
}
