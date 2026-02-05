import { useEffect, useState } from "react";
import { predictAdherence } from "../api/adherenceApi";

export default function AdherenceCard() {
  const [result, setResult] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const payload = {
        missed_doses_last_7_days: 1,
        avg_delay_minutes: 45,
        adherence_rate_30_days: 68
      };

      const res = await predictAdherence(payload);
      setResult(res);
    };

    fetchData();
  }, []);

  if (!result) return null;

  return (
    <div className="adherence-card">
      <h2>{result.risk_percentage}% Prob.</h2>
      <p>{result.risk_level} Risk</p>

      {result.will_miss_next_dose && (
        <p className="warning">High chance of missing tonight’s dose</p>
      )}
    </div>
  );
}
