import React, { useEffect, useState } from "react";

/*
Job Search page: reads localStorage.search_jobs_output (expected array of job objects with title/link/snippet/source)
If missing, attempts to run search by sending process_pair_output.job_summary to /search_jobs
*/

const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

function JobCard({job}){
  return (
    <a className="glass p-4 rounded-lg card-link block" href={job.link} target="_blank" rel="noreferrer">
      <div className="text-lg font-semibold text-sky-300">{job.title}</div>
      <div className="text-sm text-slate-300 mt-2">{job.snippet?.slice(0,180)}{job.snippet?.length>180?"...":""}</div>
      <div className="text-xs text-slate-400 mt-3">{job.source}</div>
    </a>
  );
}

export default function JobSearchPage({ onBack }){
  const [jobs, setJobs] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  useEffect(()=>{
    const saved = localStorage.getItem("search_jobs_output");
    if(saved) setJobs(JSON.parse(saved));
    else {
      // try auto-run using process_pair output
      const proc = localStorage.getItem("process_pair_output");
      if(proc){
        try {
          const parsed = JSON.parse(proc);
          const summary = parsed.jd_json?.job_summary || parsed.jd_json || parsed.resume_json?.job_summary || parsed.resume_json;
          autoSearch(summary);
        } catch(e) { console.warn(e); }
      }
    }
  },[]);

  async function autoSearch(summary){
    setLoading(true); setStatus("Searching jobs...");
    try{
      const resp = await fetch(`${API}/search_jobs`, { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ job_summary: summary }) });
      const data = await resp.json();
      localStorage.setItem("search_jobs_output", JSON.stringify(data));
      setJobs(data);
      setStatus("Search complete");
    }catch(err){
      console.error(err);
      setStatus("Error: "+String(err));
    }finally { setLoading(false); }
  }

  return (
    <div className="glass p-6">
      <button className="text-slate-300 mb-4" onClick={onBack}>← Back</button>
      <h3 className="text-2xl font-semibold mb-1">Job Search</h3>
      <p className="text-slate-400 mb-4">Curated job postings based on your processed resume & JD.</p>

      {loading && <div className="text-slate-300 mb-3">{status}</div>}
      {!loading && jobs && Array.isArray(jobs) && (
        <div className="grid grid-cols-2 gap-4">
          {jobs.map((j, i)=> <JobCard key={i} job={j} />)}
        </div>
      )}

      {!loading && (!jobs || !Array.isArray(jobs)) && (
        <div className="text-slate-400">No job search results found. Run the pipeline from Home.</div>
      )}
    </div>
  );
}
