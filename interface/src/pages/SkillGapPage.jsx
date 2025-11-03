import React, { useEffect, useState } from "react";

/*
Skill gap page: reads localStorage.skill_match_output AND localStorage.process_pair_output.
But your flow uses skill_match_output => feed to /skill_gap; we assume skill_gap already run & saved.
This page will auto-run /skill_gap if missing and display nicely.
*/

const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

function ResourceCard({title, link, snippet}) {
  return (
    <a className="block card-link glass p-4 rounded-lg hover:shadow-lg" target="_blank" rel="noreferrer" href={link}>
      <div className="text-lg font-semibold text-sky-300 mb-1">{title}</div>
      <div className="text-sm text-slate-300 mb-2">{(snippet||"").slice(0,160)}{(snippet||"").length>160?"...":""}</div>
      <div className="text-xs text-slate-400">Open</div>
    </a>
  );
}

export default function SkillGapPage({ onBack }){
  const [input, setInput] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  useEffect(()=>{
    const savedMatch = localStorage.getItem("skill_match_output");
    const savedProcess = localStorage.getItem("process_pair_output");
    const parsed = savedMatch ? JSON.parse(savedMatch) : null;
    setInput(parsed || (savedProcess ? JSON.parse(savedProcess) : null));
    const savedGap = localStorage.getItem("skill_gap_output");
    if(savedGap){
      setResult(JSON.parse(savedGap));
    } else {
      // auto-run skill_gap if we have skill_match_output
      if(parsed){
        runSkillGap(parsed);
      }
    }
  },[]);

  async function runSkillGap(skillMatch){
    setLoading(true); setStatus("Running skill gap...");
    try{
      const resp = await fetch(`${API}/skill_gap/`, {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify(skillMatch),
      });
      const data = await resp.json();
      localStorage.setItem("skill_gap_output", JSON.stringify(data));
      setResult(data);
      setStatus("Skill gap ready");
    }catch(err){
      console.error(err);
      setStatus("Error: "+String(err));
    }finally {
      setLoading(false);
    }
  }

  return (
    <div className="glass p-6">
      <button className="text-slate-300 mb-4" onClick={onBack}>← Back</button>
      <h3 className="text-2xl font-semibold mb-1">Skill Gap</h3>
      <p className="text-slate-400 mb-4">Recommendations and curated resources to close your skill gaps.</p>

      {loading && <div className="text-slate-300 mb-3">{status}</div>}
      {!loading && result && (
        <div>
          <div className="mb-4">
            <div className="text-sm text-slate-300">Detected skills</div>
            <div className="flex gap-2 mt-2 flex-wrap">
              {result.skills?.map(s=>(
                <div key={s} className="px-3 py-1 rounded-full bg-white/5 text-slate-100 text-sm">{s}</div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {Object.entries(result.web||{}).map(([skill, resources]) => (
              <div key={skill} className="glass p-4 rounded">
                <div className="text-lg font-semibold text-white mb-2">{skill}</div>
                <div className="space-y-3">
                  {resources.map((r, idx)=> <ResourceCard key={idx} title={r.title} link={r.link} snippet={r.snippet} />)}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 text-slate-400">Summary: {result.summary ? `Skills: ${result.summary.num_skills}, Web sources: ${result.summary.num_web_sources}` : "—"}</div>
        </div>
      )}

      {!loading && !result && (
        <div className="text-slate-400">No skill-gap output available. Run the pipeline from Home first.</div>
      )}
    </div>
  );
}
