import React, { useState, useEffect } from "react";
import Button from "../components/Button";
import JSONDisplay from "../components/JSONDisplay";
import Loader from "../components/Loader";
import { skillMatch } from "../api";

const SkillMatchPage = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const processOutput = JSON.parse(localStorage.getItem("process_pair_output") || "{}");
  
  
  const handleClick = async () => {
    setLoading(true);
    setError(null);
    try {
        console.log("Process Output:", processOutput);
      const payload = { resume_json: processOutput, jd_json: processOutput.jd_json };
      const resp = await skillMatch(payload);
      setResult(resp.data);
      localStorage.setItem("skill_match_output", JSON.stringify(resp.data));
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Skill Match</h1>
      <p>This uses the output of Process Pair.</p>
      <Button onClick={handleClick} disabled={loading}>Run Skill Match</Button>
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

export default SkillMatchPage;
