import React, { useEffect, useState } from "react";
import { downloadResumePDF } from "../api";

export default function ResumePage() {
  const [processPair, setProcessPair] = useState(null);
  const [skillMatch, setSkillMatch] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  useEffect(()=> {
    try {
      const p = localStorage.getItem("process_pair_output");
      if (p) setProcessPair(JSON.parse(p));
      const s = localStorage.getItem("skill_match_output");
      if (s) setSkillMatch(JSON.parse(s));
    } catch {}
  }, []);

  async function runGenerate() {
    setErr(null);
    if (!processPair) { setErr("No process_pair_output in localStorage"); return; }
    const resume_json = processPair.resume_json;
    const jd_json = processPair.jd_json;
    const matcher = skillMatch || {};

    setLoading(true);
    try {
      const r = await downloadResumePDF({ resume_json, jd_json, matcher });
      // download blob
      const blob = new Blob([r.data], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "ATS_Resume.pdf";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      setErr(e?.response?.data || e.message || String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 bg-slate-800 rounded">
      <h2 className="font-semibold mb-3">Generate Resume (PDF)</h2>
      <div className="mb-4 text-sm text-slate-300">This will POST resume_json, jd_json and matcher to /resume and download a PDF (backend must provide /resume).</div>

      <div className="flex gap-3">
        <button onClick={runGenerate} className="px-4 py-2 bg-pink-600 rounded" disabled={loading}>{loading ? "Generating..." : "Generate & Download PDF"}</button>
        <button onClick={()=>{ localStorage.removeItem("generated_resume"); }} className="px-3 py-2 bg-slate-600 rounded">Clear</button>
      </div>

      {err && <div className="text-red-400 mt-3">{err}</div>}

      <div className="mt-4 bg-slate-700 p-4 rounded">
        <h3 className="font-semibold">Current Stored Inputs</h3>
        <div className="text-xs mt-2">
          <strong>process_pair:</strong>
          <pre className="whitespace-pre-wrap">{processPair ? JSON.stringify(processPair, null, 2) : "None"}</pre>
          <strong>skill_match:</strong>
          <pre>{skillMatch ? JSON.stringify(skillMatch, null, 2) : "None"}</pre>
        </div>
      </div>
    </div>
  );
}
