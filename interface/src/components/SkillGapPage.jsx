import React, { useEffect, useState } from "react";

/**
 * SkillGapPage
 * - Auto-runs skill gap when mounted
 * - Reads matched skills from localStorage.skill_match_output (or process_pair_output fallback)
 * - POSTs to backend /skill_gap
 * - Saves response to localStorage.skill_gap_output
 * - Displays a grid of skill cards; each skill card contains clickable resource cards
 *
 * Props:
 * - backendBase (optional) default: http://127.0.0.1:8000
 */
export default function SkillGapPage({ backendBase = "http://127.0.0.1:8000" }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [gapResult, setGapResult] = useState(null);

  useEffect(() => {
    const runSkillGap = async () => {
      setLoading(true);
      setError(null);

      try {
        // 1) Try to read skill_match_output first, fallback to process_pair_output
        const rawMatch = localStorage.getItem("skill_match_output");
        if (!rawMatch) {
          throw new Error("No local input found: store skill_match_output or process_pair_output in localStorage.");
        }

        let parsed;
        try {
          parsed = JSON.parse(rawMatch);
        } catch (e) {
          throw new Error("localStorage content is not valid JSON.");
        }

        // 2) Figure out the skills array to send to backend
        // Common shapes:
        // - { matched_required_skills: [...] }
        // - { skills: [...] }
        // - { resume_json: {...}, jd_json: {...} } (more complex)
        let skillsToSend = [];
        if (Array.isArray(parsed.matched_required_skills)) {
          skillsToSend = parsed.matched_required_skills;
        } else if (Array.isArray(parsed.skills)) {
          skillsToSend = parsed.skills;
        } else if (parsed.resume_json && parsed.resume_json.skills) {
          // try to extract programming_languages
          const sk = parsed.resume_json.skills.programming_languages || parsed.resume_json.skills;
          if (Array.isArray(sk)) skillsToSend = sk;
        } else if (parsed.matched_skills) {
          skillsToSend = parsed.matched_skills;
        }

        if (!skillsToSend || skillsToSend.length === 0) {
          // as a last resort try to combine JD required_skills (if present)
          const fallback = (parsed.jd_json && parsed.jd_json.required_skills) || (parsed.required_skills) || [];
          skillsToSend = Array.isArray(fallback) ? fallback : [];
        }

        if (!skillsToSend || skillsToSend.length === 0) {
          throw new Error("Couldn't find a skills array in stored input (look for matched_required_skills or skills).");
        }

        // 3) POST to /skill_gap
        const payload = { skills: skillsToSend };
        const resp = await fetch(`${backendBase}/skill_gap/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!resp.ok) {
          const text = await resp.text();
          throw new Error(`Skill gap API error: ${resp.status} ${text}`);
        }

        const json = await resp.json();

        // 4) Save and set state
        localStorage.setItem("skill_gap_output", JSON.stringify(json));
        setGapResult(json);
      } catch (err) {
        console.error("SkillGapPage error:", err);
        setError(err.message || String(err));
      } finally {
        setLoading(false);
      }
    };

    runSkillGap();
    // intentionally run only once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [backendBase]);

  // Loading / error UI
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-gray-700">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-lg font-medium">Analyzing skill gaps...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-red-600 p-6">
        <div className="max-w-xl bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-2">Skill Gap — Error</h2>
          <p className="text-sm text-red-600 mb-4">{error}</p>
          <p className="text-sm text-gray-600">Make sure <code>localStorage.skill_match_output</code> or <code>localStorage.process_pair_output</code> exists and contains matched skills.</p>
        </div>
      </div>
    );
  }

  // Success: normalize expected structure
  // expected shape (example from you): { skills: [..], web: { skill: [ {title, link, snippet}, ... ] }, summary: {...} }
  const skillsList = (gapResult && gapResult.skills) || Object.keys((gapResult && gapResult.web) || {}) || [];
  const webMap = (gapResult && gapResult.web) || {};

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 px-6 py-10 font-sans">
      <div className="max-w-6xl mx-auto">
        <header className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Skill Gap</h1>
            <p className="text-gray-600 mt-1">Resources and learning paths to close your missing skills — curated for you.</p>
          </div>
          {/* <div className="text-sm text-gray-500">
            Saved to <code className="bg-gray-100 px-2 py-1 rounded">localStorage.skill_gap_output</code>
          </div> */}
        </header>

        {/* Summary strip */}
        {gapResult && gapResult.summary && (
          <div className="mb-6 flex items-center gap-6">
            <div className="px-3 py-2 bg-indigo-50 text-indigo-700 rounded font-semibold">
              {gapResult.summary.num_skills ?? skillsList.length} skills
            </div>
            <div className="px-3 py-2 bg-green-50 text-green-700 rounded font-semibold">
              {gapResult.summary.num_web_sources ?? Object.values(webMap).flat().length} resources
            </div>
          </div>
        )}

        {/* Skills grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {skillsList.map((skill, i) => {
            const resources = Array.isArray(webMap[skill]) ? webMap[skill] : [];
            return (
              <section key={i} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-800">{skill}</h2>
                  <span className="text-sm text-gray-500">{resources.length} resources</span>
                </div>

                <p className="text-sm text-gray-600 mt-2">Top resources to learn <span className="font-medium">{skill}</span> quickly.</p>

                {/* resources grid */}
                <div className="mt-4 grid sm:grid-cols-1 gap-3">
                  {resources.length === 0 && (
                    <div className="text-sm text-gray-400 italic">No web resources found for this skill.</div>
                  )}

                  {resources.map((r, idx) => {
                    const title = r.title || r.name || "Untitled";
                    const link = r.link || r.url || r.href || "#";
                    const snippet = r.snippet || r.description || "";
                    const source = r.source || (() => {
                      try { return new URL(link).hostname.replace(/^www\./, ""); } catch { return ""; }
                    })();

                    return (
                      <a
                        key={idx}
                        href={link}
                        target="_blank"
                        rel="noreferrer"
                        className="group block relative bg-gray-50 border border-gray-100 hover:border-indigo-300 rounded-lg p-4 transition-shadow duration-250 hover:shadow-lg"
                      >
                        <div className="flex justify-between items-start">
                          <h3 className="text-md font-semibold text-indigo-700 group-hover:text-indigo-900">{title}</h3>
                          {source && <div className="text-xs text-gray-500 ml-3">{source}</div>}
                        </div>
                        {snippet && <p className="mt-2 text-sm text-gray-700 line-clamp-3">{snippet}</p>}

                        {/* <div className="mt-3 flex items-center justify-between">
                          <span className="text-xs text-gray-500">Open resource</span>
                          <span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-1 rounded">Open</span>
                        </div> */}

                        {/* subtle hover glow */}
                        <span className="absolute inset-0 rounded-lg bg-indigo-500/6 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                      </a>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>

        <footer className="mt-10 text-sm text-gray-500">
          Suggestions generated from <strong>{skillsList.length}</strong> skills 
        </footer>
      </div>
    </div>
  );
}
