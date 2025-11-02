import React, { useEffect, useState } from "react";

export default function JobSearchPage({ backendBase = "http://127.0.0.1:8000" }) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const runJobSearch = async () => {
      try {
        const raw = localStorage.getItem("parse_output");
        if (!raw) {
          setError("No process_pair_output found in localStorage.");
          setLoading(false);
          return;
        }

        const parsed = JSON.parse(raw);
        const jd = parsed.jd_json || {};
        const summary =
          jd.job_summary ||
          (jd.required_skills ? jd.required_skills.join(" ") : "") ||
          "software developer engineer coding";

        const res = await fetch(`${backendBase}/search_jobs`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ job_summary: summary }),
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);

        const data = await res.json();
        const jobList = Array.isArray(data)
          ? data
          : data.jobs || data.results || data.data || [];

        setJobs(jobList);
        localStorage.setItem("search_jobs_output", JSON.stringify(jobList));
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    runJobSearch();
  }, [backendBase]);

  if (loading)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-gray-700">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-lg font-medium">Searching jobs for you...</span>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-red-600 font-semibold">
        ⚠️ {error}
      </div>
    );

  if (jobs.length === 0)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-600">
        No jobs found. Try re-running the process.
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 px-6 py-10 font-sans">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Job Opportunities
        </h1>
        <p className="text-gray-600 mb-8">
          Here are the latest job openings curated based on your resume and job
          profile.
        </p>

        {/* Grid of job cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job, idx) => {
            const title =
              job.title || job.position || job.role || "Untitled Job";
            const link = job.link || job.url || "#";
            const snippet =
              job.snippet || job.description || job.summary || "";
            const source = job.source || new URL(link).hostname.replace("www.", "");
            const salary = job.salary || "";
            const posted = job.posted || job.date || "";

            return (
              <a
                key={idx}
                href={link}
                target="_blank"
                rel="noreferrer"
                className="group relative bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-xl hover:border-blue-400 transition-all duration-300 p-5 flex flex-col justify-between transform hover:-translate-y-1"
              >
                <div>
                  <h2 className="text-lg font-semibold text-blue-700 group-hover:text-blue-900 leading-snug line-clamp-2">
                    {title}
                  </h2>
                  <div className="text-sm text-gray-500 mt-1">
                    {source.charAt(0).toUpperCase() + source.slice(1)}
                  </div>
                  <p className="mt-3 text-sm text-gray-700 leading-relaxed line-clamp-3">
                    {snippet}
                  </p>
                </div>

                <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
                  <div className="flex gap-2">
                    {salary && (
                      <span className="px-2 py-1 rounded bg-green-50 text-green-700 font-medium">
                        💰 {salary}
                      </span>
                    )}
                    {/* <span className="px-2 py-1 rounded bg-blue-50 text-blue-700">
                      Open
                    </span> */}
                  </div>
                  {posted && <span className="text-gray-400">{posted}</span>}
                </div>

                {/* Glow effect */}
                <span className="absolute inset-0 rounded-xl bg-blue-500/5 opacity-0 group-hover:opacity-100 transition duration-300"></span>
              </a>
            );
          })}
        </div>

        <footer className="mt-10 text-center text-sm text-gray-500">
          Showing <strong>{jobs.length}</strong> jobs 
        </footer>
      </div>
    </div>
  );
}
