// import React, { useEffect, useState } from "react";
// import axios from "axios";

// export default function SkillGap({ onBack = () => {} }) {
//   const [loading, setLoading] = useState(true);
//   const [data, setData] = useState(null);
//   const [error, setError] = useState("");

//   useEffect(() => {
//     async function run() {
//       try {
//         const raw = localStorage.getItem("skill_match_output");
//         if (!raw) throw new Error("No skill_match_output in localStorage.");
//         const payload = JSON.parse(raw);
//         const skills = payload.matched_required_skills || payload.skills || [];
//         const resp = await axios.post("http://127.0.0.1:8000/skill_gap/", { skills });
//         setData(resp.data);
//       } catch (e) {
//         setError(e.message);
//       } finally {
//         setLoading(false);
//       }
//     }
//     run();
//   }, []);

//   if (loading) return <div className="animate-pulse bg-gray-100 rounded-xl h-40 w-full"></div>;
//   if (error) return <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded">{error}</div>;

//   const { web = {}, skills = [] } = data || {};

//   return (
//     <div className="space-y-6">
//       <div className="flex items-center justify-between">
//         <h1 className="text-3xl font-bold text-gray-800">Skill Gap Insights</h1>
//         <button onClick={onBack} className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm">
//           ← Back
//         </button>
//       </div>

//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//         {skills.map((s) => (
//           <div key={s} className="p-5 rounded-xl bg-white border border-gray-200 hover:shadow-md transition">
//             <div className="text-lg font-semibold text-gray-800 mb-2">{s}</div>
//             {(web[s] || []).slice(0, 3).map((item, i) => (
//               <a
//                 key={i}
//                 href={item.link}
//                 target="_blank"
//                 rel="noreferrer"
//                 className="block p-3 rounded-md border border-gray-100 hover:border-blue-300 hover:bg-blue-50 transition mb-2"
//               >
//                 <div className="font-medium text-gray-800">{item.title}</div>
//                 <p className="text-sm text-gray-500">{item.snippet}</p>
//               </a>
//             ))}
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }


import React, { useEffect, useState } from "react";
import axios from "axios";

export default function SkillGap({ onBack = () => {} }) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function run() {
      try {
        const raw = localStorage.getItem("skill_match_output");
        if (!raw) throw new Error("No skill_match_output in localStorage.");
        const payload = JSON.parse(raw);
        const skills = payload.matched_required_skills || payload.skills || [];
        const resp = await axios.post("http://127.0.0.1:8000/skill_gap/", { skills });
        setData(resp.data);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    run();
  }, []);

  if (loading) return <div className="glass p-6"><div className="kicker">Loading recommended resources…</div></div>;
  if (error) return <div className="glass p-4 border border-red-600/20 text-red-200 rounded-md">{error}</div>;

  const { web = {}, skills = [] } = data || {};

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Skill Gap Insights</h1>
          <div className="muted small">Recommended courses and resources by skill</div>
        </div>
        <button onClick={onBack} className="btn ghost">← Back</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {skills.map((s) => (
          <div key={s} className="job-card">
            <div className="text-lg font-semibold">{s}</div>
            <div className="muted small mb-3">Top resources</div>

            {(web[s] || []).slice(0, 3).map((item, i) => (
              <a key={i} href={item.link} rel="noreferrer" target="_blank" className="block p-3 rounded-md border border-white/4 mb-2">
                <div className="font-medium">{item.title}</div>
                <p className="muted small mt-1">{item.snippet}</p>
              </a>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
