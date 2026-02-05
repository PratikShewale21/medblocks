import { useEffect, useState } from "react";
import { generateSummary } from "../api/summaryApi";

export default function SummaryBox() {
  const [summary, setSummary] = useState("");

  useEffect(() => {
    generateSummary(
      "Patient shows elevated glucose levels and irregular medication adherence.",
      "Diabetes + Adherence"
    ).then(res => setSummary(res.summary));
  }, []);

  return <p>{summary}</p>;
}
