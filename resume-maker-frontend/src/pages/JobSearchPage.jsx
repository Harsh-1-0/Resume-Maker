import React, { useState } from "react";
import Button from "../components/Button";
import JSONDisplay from "../components/JSONDisplay";
import Loader from "../components/Loader";
import { searchJobs } from "../api";

const JobSearchPage = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const processOutput = JSON.parse(localStorage.getItem("process_pair_output") || "{}");

  const handleClick = async () => {
    setLoading(true);
    setError(null);
    try {
      const payload = { job_summary: processOutput.job_summary || "" };
      const resp = await searchJobs(payload);
      setResult(resp.data);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Job Search</h1>
      <p>Based on the Process Pair output.</p>
      <Button onClick={handleClick} disabled={loading}>Search Jobs</Button>
      {loading && <Loader />}
      {error && <div className="text-red-600">{error}</div>}
      {result && (
        <div>
          <h2 className="text-xl font-semibold">Results</h2>
          <JSONDisplay data={result} />
        </div>
      )}
    </div>
  );
};

export default JobSearchPage;
