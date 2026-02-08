import React, { useState } from "react";
import { generateSummary } from "../../api/summaryApi";
import "./SecureVault.css";

export default function SecureVault() {
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);

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
    <div className="secure-vault">
      <h2>Secure Vault</h2>

      <button onClick={generate} disabled={loading}>
        {loading ? "Generating..." : "Generate Summary"}
      </button>

      {summary && (
        <div className="summary-box">
          <p>{summary}</p>
        </div>
      )}
    </div>
  );
}
