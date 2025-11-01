import React, { useState } from "react";
import Button from "../components/Button";
import JSONDisplay from "../components/JSONDisplay";
import Loader from "../components/Loader";
import { skillGap } from "../api";

const SkillGapPage = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const skillMatchOutput = JSON.parse(localStorage.getItem("skill_match_output") || "{}");

  const handleClick = async () => {
    setLoading(true);
    setError(null);
    try {
      const resp = await skillGap({ skills: skillMatchOutput.matched_skills || [] });
      setResult(resp.data);
      localStorage.setItem("skill_gap_output", JSON.stringify(resp.data));
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Skill Gap</h1>
      <p>Based on skill match output.</p>
      <Button onClick={handleClick} disabled={loading}>Run Skill Gap</Button>
      {loading && <Loader />}
      {error && <div className="text-red-600">{error}</div>}
      {result && (
        <div>
          <h2 className="text-xl font-semibold">Result</h2>
          <JSONDisplay data={result} />
        </div>
      )}
    </div>
  );
};

export default SkillGapPage;
