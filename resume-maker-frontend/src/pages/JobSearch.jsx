import React, { useEffect, useState } from "react";
import { searchJobs } from "../api";

export default function JobSearch() {
  const [processPair, setProcessPair] = useState(null);
  const [out, setOut] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  useEffect(()=> {
    try {
      const p = localStorage.getItem("process_pair_output");
      if (p) setProcessPair(JSON.parse(p));
    } catch {}
  }, []);

  async function run() {
    setErr(null);
    if (!processPair?.jd_json) { setErr("No process_pair_output or jd_json found"); return; }
    const job_summary = processPair.jd_json.job_summary || processPair.jd_json.summary || "";
    if (!job_summary) { setErr("JD summary not found in process_pair_output"); return; }
    setLoading(true);
    try {
      const r = await searchJobs({ job_summary });
      setOut(r.data);
    } catch (e) {
      setErr(e?.response?.data || e.message || String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 bg-slate-800 rounded">
      <h2 className="font-semibold mb-3">Job Search</h2>
      <div className="mb-4 text-sm text-slate-300">Uses JD summary to query /search_jobs.</div>

      <div className="flex gap-2 mb-4">
        <button className="px-4 py-2 bg-indigo-600 rounded" onClick={run} disabled={loading}>{loading ? "Searching..." : "Search Jobs"}</button>
      </div>

      {err && <div className="text-red-400 mb-2">{err}</div>}

      <div className="bg-slate-700 p-4 rounded">
        <h3 className="font-semibold mb-2">Results</h3>
        {!out && <div className="text-slate-400">No results yet</div>}
        {out && <pre className="text-xs whitespace-pre-wrap">{JSON.stringify(out, null, 2)}</pre>}
      </div>
    </div>
  );
}
