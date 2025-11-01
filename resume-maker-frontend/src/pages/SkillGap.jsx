import React, { useEffect, useState } from "react";
import { skillGap } from "../api";

export default function SkillGap() {
  const [matchOutput, setMatchOutput] = useState(null);
  const [out, setOut] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  useEffect(()=> {
    try {
      const raw = localStorage.getItem("skill_match_output");
      if (raw) setMatchOutput(JSON.parse(raw));
      const saved = localStorage.getItem("skill_gap_output");
      if (saved) setOut(JSON.parse(saved));
    } catch {}
  }, []);

  function pickSkills() {
    if(!matchOutput) return [];
    // prefer explicit keys
    if(Array.isArray(matchOutput.skills)) return matchOutput.skills;
    if(matchOutput.matched_skills && Array.isArray(matchOutput.matched_skills)) return matchOutput.matched_skills;
    // flatten object values
    if(typeof matchOutput === 'object') {
      const vals = Object.values(matchOutput).flatMap(v => Array.isArray(v) ? v : []);
      return vals;
    }
    return [];
  }

  async function run() {
    setErr(null);
    const skills = pickSkills();
    if (!skills || skills.length === 0) {
      setErr("No skills available in skill_match_output to run skill_gap.");
      return;
    }
    setLoading(true);
    try {
      const r = await skillGap({ skills });
      setOut(r.data);
      localStorage.setItem("skill_gap_output", JSON.stringify(r.data));
    } catch (e) {
      setErr(e?.response?.data || e.message || String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 bg-slate-800 rounded">
      <h2 className="font-semibold mb-3">Skill Gap</h2>
      <div className="mb-4 text-sm text-slate-300">Uses skill_match output (localStorage) to run /skill_gap.</div>

      <div className="flex gap-2 mb-4">
        <button onClick={run} className="px-4 py-2 bg-emerald-600 rounded">{loading ? "Running..." : "Run /skill_gap"}</button>
        <button onClick={()=>{ localStorage.removeItem("skill_gap_output"); setOut(null); }} className="px-3 py-2 bg-slate-600 rounded">Clear Saved</button>
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
