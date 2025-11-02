import React, { useEffect, useState } from "react";
import axios from "axios";

export default function JobSearch({ onBack = () => {} }) {
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    async function run() {
      setLoading(true);
      setError("");
      try {
        const raw = localStorage.getItem("process_pair_output");
        if (!raw) throw new Error("No process_pair_output found in localStorage.");
        const parsed = JSON.parse(raw);
        const jd = parsed.jd_json || parsed.resume_json || {};
        const body = { job_summary: jd.job_summary || jd.summary || "" };

        const resp = await axios.post("http://127.0.0.1:8000/search_jobs", body, { timeout: 120000 });
        // expect array of job objects
        setJobs(resp.data || []);
      } catch (e) {
        setError(e?.response?.data?.error || e.message || String(e));
      } finally {
        setLoading(false);
      }
    }
    run();
  }, []);

  if (loading) {
    return (
      <div>
        <button onClick={onBack} className="mb-4 px-3 py-1 rounded bg-white/5">Back</button>
        <div className="p-6 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg animate-pulse" />
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <button onClick={onBack} className="mb-4 px-3 py-1 rounded bg-white/5">Back</button>
        <div className="p-4 bg-red-900 rounded">{error}</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-[#39ff14]">Job Matches</h1>
          <p className="text-gray-400">Relevant job postings based on your JD</p>
        </div>
        <div>
          <button onClick={onBack} className="px-3 py-1 rounded bg-white/5">Back</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {jobs.length === 0 && <div className="text-gray-400">No jobs found.</div>}
        {jobs.map((job, idx) => (
          <a
            key={idx}
            href={job.link || job.url || "#"}
            target="_blank"
            rel="noreferrer"
            className="p-4 rounded-lg bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-800 hover:scale-[1.01] transform transition shadow"
          >
            <div className="text-xl font-semibold text-white">{job.title || job.position || "Untitled"}</div>
            <div className="text-sm text-gray-400 mt-1">{job.company || job.source || ""}</div>
            <div className="text-sm text-gray-300 mt-3">{job.snippet || job.description || ""}</div>
            <div className="mt-3 text-xs text-gray-500">Click to open job</div>
          </a>
        ))}
      </div>
    </div>
  );
}
