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

  if (loading) return <div className="animate-pulse bg-white/10 backdrop-blur-md rounded-xl h-40 w-full"></div>;
  if (error) return <div className="bg-red-500/10 backdrop-blur-md border border-red-500/20 text-red-200 p-4 rounded-xl">{error}</div>;

  const { web = {}, skills = [] } = data || {};

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent drop-shadow-sm">Skill Gap Insights</h1>
        <button onClick={onBack} className="px-3 py-1 rounded bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 text-white text-sm transition-all duration-300">
          ← Back
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {skills.map((s) => (
          <div key={s} className="p-5 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 hover:border-white/30 hover:scale-[1.02] hover:shadow-xl transition-all duration-300 ease-out group">
            <div className="text-lg font-semibold bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent group-hover:from-purple-200 group-hover:to-pink-200 transition-all duration-300 mb-2">{s}</div>
            {(web[s] || []).slice(0, 3).map((item, i) => (
              <a
                key={i}
                href={item.link}
                target="_blank"
                rel="noreferrer"
                className="block p-3 rounded-md bg-white/5 border border-white/10 hover:bg-white/15 hover:border-white/20 transition-all duration-300 mb-2 group/item"
              >
                <div className="font-medium text-white/90 group-hover/item:text-white">{item.title}</div>
                <p className="text-sm text-gray-400 group-hover/item:text-gray-300 mt-1">{item.snippet}</p>
              </a>
            ))}
          </div>
        ))}
      </div>

      <div className="muted small">Recommended courses and resources by skill</div>
    </div>
  );
}
