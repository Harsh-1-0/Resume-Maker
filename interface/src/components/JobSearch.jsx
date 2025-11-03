// import React, { useEffect, useState } from "react";
// import axios from "axios";

// export default function JobSearch({ onBack = () => {} }) {
//   const [loading, setLoading] = useState(true);
//   const [jobs, setJobs] = useState([]);
//   const [error, setError] = useState("");

//   useEffect(() => {
//     async function run() {
//       try {
//         const raw = localStorage.getItem("process_pair_output");
//         if (!raw) throw new Error("No process_pair_output found.");
//         const parsed = JSON.parse(raw);
//         const jd = parsed.jd_json || {};
//         const body = { job_summary: jd.job_summary || jd.summary || "" };
//         const resp = await axios.post("http://127.0.0.1:8000/search_jobs", body);
//         setJobs(resp.data || []);
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

//   return (
//     <div className="space-y-6">
//       <div className="flex items-center justify-between">
//         <h1 className="text-3xl font-bold text-gray-800">Job Recommendations</h1>
//         <button onClick={onBack} className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm">
//           ← Back
//         </button>
//       </div>

//       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//         {jobs.map((job, idx) => (
//           <a
//             key={idx}
//             href={job.link || job.url || "#"}
//             target="_blank"
//             rel="noreferrer"
//             className="p-5 rounded-xl bg-white border border-gray-200 hover:shadow-md transition"
//           >
//             <div className="text-lg font-semibold text-gray-800">{job.title}</div>
//             <div className="text-sm text-gray-500">{job.company || job.source}</div>
//             <p className="text-sm text-gray-600 mt-2">{job.snippet || job.description}</p>
//           </a>
//         ))}
//       </div>
//     </div>
//   );
// }



import React, { useEffect, useState } from "react";
import axios from "axios";

export default function JobSearch({ onBack = () => {} }) {
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    async function run() {
      try {
        const raw = localStorage.getItem("process_pair_output");
        if (!raw) throw new Error("No process_pair_output found.");
        const parsed = JSON.parse(raw);
        const jd = parsed.jd_json || {};
        const body = { job_summary: jd.job_summary || jd.summary || "" };
        const resp = await axios.post("http://127.0.0.1:8000/search_jobs", body);
        setJobs(resp.data || []);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    run();
  }, []);

  if (loading) return <div className="glass p-6"><div className="kicker">Searching jobs…</div></div>;
  if (error) return <div className="glass p-4 border border-red-600/20 text-red-200 rounded-md">{error}</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Job Recommendations</h1>
          <div className="muted small">Click any card to open the job posting</div>
        </div>
        <button onClick={onBack} className="btn ghost">← Back</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {jobs.map((job, idx) => (
          <a
            key={idx}
            href={job.link || job.url || "#"}
            target="_blank"
            rel="noreferrer"
            className="job-card"
          >
            <div className="text-xl font-semibold">{job.title}</div>
            <div className="muted small">{job.company || job.source || ""}</div>
            <p className="muted small mt-3">{job.snippet || job.description}</p>
          </a>
        ))}
      </div>
    </div>
  );
}
