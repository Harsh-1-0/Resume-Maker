import React, { useEffect, useState } from "react";
import { skillMatch } from "../api";

export default function SkillMatch() {
  const [processData, setProcessData] = useState(null);
  const [out, setOut] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("process_pair_output");
      if (raw) setProcessData(JSON.parse(raw));
      const prev = localStorage.getItem("skill_match_output");
      if (prev) setOut(JSON.parse(prev));
    } catch {}
  }, []);

  async function run() {
    setErr(null);
    if (!processData?.resume_json || !processData?.jd_json) {
      setErr("No process_pair output found in localStorage. Run ProcessPair first.");
      return;
    }
    setLoading(true);
    try {
      const r = await skillMatch({ resume_json: processData.resume_json, jd_json: processData.jd_json });
      setOut(r.data);
      localStorage.setItem("skill_match_output", JSON.stringify(r.data));
    } catch (e) {
      setErr(e?.response?.data || e.message || String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 bg-slate-800 rounded">
      <h2 className="font-semibold mb-3">Skill Match</h2>
      <div className="mb-4 text-sm text-slate-300">This uses process_pair output (from localStorage) to run skill_match.</div>
      <div className="flex gap-2 mb-4">
        <button onClick={run} className="px-4 py-2 bg-blue-600 rounded" disabled={loading}>{loading ? "Running..." : "Run /skill_match"}</button>
        <button onClick={()=>{ localStorage.removeItem("skill_match_output"); setOut(null); }} className="px-3 py-2 bg-slate-600 rounded">Clear Saved</button>
      </div>

      {err && <div className="text-red-400 mb-2">{String(err)}</div>}

      <div className="bg-slate-700 p-4 rounded">
        <h3 className="font-semibold mb-2">Output</h3>
        {!out && <div className="text-slate-400">No output yet</div>}
        {out && <pre className="text-xs whitespace-pre-wrap">{JSON.stringify(out, null, 2)}</pre>}
      </div>
    </div>
  );
}
