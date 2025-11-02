import React, { useEffect, useState } from "react";
import axios from "axios";

export default function SkillGap({ onBack = () => {} }) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  // call /skill_gap automatically with localStorage.skill_match_output
  useEffect(() => {
    async function run() {
      setLoading(true);
      setError("");
      try {
        const raw = localStorage.getItem("skill_match_output");
        if (!raw) throw new Error("No skill_match_output in localStorage.");
        const payload = JSON.parse(raw);

        // The backend skill_gap expects { skills: [...] } in the body per your earlier code
        const skills = payload.matched_required_skills || payload.required_skills || payload.skills || [];
        const body = { skills };
        const resp = await axios.post("http://127.0.0.1:8000/skill_gap/", body, { timeout: 120000 });
        setData(resp.data);
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
      <div className="max-w-4xl mx-auto">
        <button onClick={onBack} className="mb-4 px-3 py-1 rounded bg-white/5">Back</button>
        <div className="p-6 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg animate-pulse">
          <div className="h-6 bg-white/5 rounded w-1/3 mb-4" />
          <div className="space-y-3">
            <div className="h-4 bg-white/5 rounded" />
            <div className="h-4 bg-white/5 rounded w-5/6" />
            <div className="h-4 bg-white/5 rounded w-2/3" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto">
        <button onClick={onBack} className="mb-4 px-3 py-1 rounded bg-white/5">Back</button>
        <div className="p-4 bg-red-900 rounded">{error}</div>
      </div>
    );
  }

  // data expected format (your example)
  // { skills: [...], web: { skillName: [ {title, link, snippet}, ... ] }, summary: {...} }

  const web = data?.web || {};
  const skills = data?.skills || [];

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-[#39ff14]">Skill Gap — Learning Recommendations</h1>
          <p className="text-gray-400 mt-1">Based on matched skills — curated learning resources</p>
        </div>
        <div>
          <button onClick={onBack} className="px-3 py-1 rounded bg-white/5">Back</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {skills.map((s) => (
          <div key={s} className="p-4 rounded-lg bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-800 shadow hover:scale-[1.01] transform transition">
            <div className="text-lg font-semibold text-[#39ff14]">{s}</div>
            <div className="text-sm text-gray-300 mt-2">Top learning resources</div>

            <div className="mt-3 space-y-3">
              {(web[s] || []).slice(0, 3).map((item, idx) => (
                <a
                  key={idx}
                  href={item.link}
                  target="_blank"
                  rel="noreferrer"
                  className="block p-3 rounded bg-white/2 hover:bg-white/5 transition"
                >
                  <div className="font-medium">{item.title}</div>
                  <div className="text-xs text-gray-400 mt-1 truncate">{item.snippet}</div>
                </a>
              ))}
            </div>
          </div>
        ))}

        {/* Summary card */}
        <div className="p-4 rounded-lg bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-800 shadow">
          <div className="text-lg font-semibold text-[#39ff14]">Summary</div>
          <div className="text-sm text-gray-300 mt-2">
            Skills: <strong className="text-white">{data.summary?.num_skills ?? "-"}</strong>
          </div>
          <div className="text-sm text-gray-300 mt-1">
            Web sources: <strong className="text-white">{data.summary?.num_web_sources ?? "-"}</strong>
          </div>
        </div>
      </div>
    </div>
  );
}
