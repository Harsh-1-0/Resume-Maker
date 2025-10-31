import React, { useState } from "react";
import Button from "../components/Button";
import Loader from "../components/Loader";
import { resumePDF } from "../api";

const ResumePage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const processOutput = JSON.parse(localStorage.getItem("process_pair_output") || "{}");
  const skillMatchOutput = JSON.parse(localStorage.getItem("skill_match_output") || "{}");

  const handleDownload = async () => {
    setLoading(true);
    setError(null);
    try {
      const payload = { resume_json: processOutput.resume_json, skill_match_json: skillMatchOutput };
      const resp = await resumePDF(payload);
      const blob = new Blob([resp.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "generated_resume.pdf");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Generate Resume PDF</h1>
      <p>This uses both Process Pair and Skill Match outputs.</p>
      <Button onClick={handleDownload} disabled={loading}>Download PDF</Button>
      {loading && <Loader />}
      {error && <div className="text-red-600">{error}</div>}
    </div>
  );
};

export default ResumePage;
