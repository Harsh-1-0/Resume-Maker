// src/pages/Home.jsx
import React, { useRef, useState } from "react";
import axios from "axios";
import LoaderOverlay from "../ui/LoaderOverlay";

const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

/*
Behavior:
- Only runs process_pair -> skill_match sequentially.
- Saves process_pair_output and skill_match_output in localStorage.
- DOES NOT call skill_gap, search_jobs or resume here.
- Provides navigation buttons that let user open other pages (which themselves call their APIs).
*/

export default function Home({ onNavigate }) {
  const resumeRef = useRef();
  const jdRef = useRef();
  const [resumeFile, setResumeFile] = useState(null);
  const [jdFile, setJdFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  // keep file picker logic same as before
  const pickFile = (ref, setter) => {
    if (!ref.current) return;
    ref.current.value = null;
    ref.current.click();
    ref.current.onchange = (e) => setter(e.target.files?.[0] ?? null);
  };

  // NEW: Correct flow handler
  async function handleGenerate() {
    if (!resumeFile || !jdFile) {
      setStatus("Please select both Resume and Job Description (PDF).");
      return;
    }

    setLoading(true);
    setStatus("Uploading files and running process_pair...");

    try {
      // 1) process_pair
      const fd = new FormData();
      fd.append("resume_input_type", "pdf");
      fd.append("resume_file", resumeFile);
      fd.append("jd_input_type", "pdf");
      fd.append("jd_file", jdFile);

      const pResp = await axios.post(`${API}/process_pair/`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 4 * 60 * 1000,
      });

      const pData = pResp.data;
      // Validate minimal structure to avoid downstream surprises
      if (!pData || !pData.resume_json || !pData.jd_json) {
        // still save raw response for debugging, but inform user
        localStorage.setItem("process_pair_output", JSON.stringify(pData || {}));
        setStatus("process_pair returned unexpected structure — saved raw output. Check console.");
        console.warn("process_pair returned:", pData);
        setLoading(false);
        return;
      }

      // Save process_pair output
      localStorage.setItem("process_pair_output", JSON.stringify(pData));
      setStatus("process_pair succeeded. Running skill_match...");

      // 2) skill_match -> pass resume_json & jd_json explicitly (important)
      const smResp = await axios.post(`${API}/skill_match/`, {
        resume_json: pData.resume_json,
        jd_json: pData.jd_json
      }, {
        headers: { "Content-Type": "application/json" },
        timeout: 2 * 60 * 1000,
      });

      const smData = smResp.data;
      // Save skill_match output
      localStorage.setItem("skill_match_output", JSON.stringify(smData));

      setStatus("skill_match completed. Outputs saved to localStorage.");
    } catch (err) {
      console.error("Pipeline error:", err);
      const message = err?.response?.data?.error || err.message || String(err);
      setStatus("Error: " + message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="glass p-8">
      <LoaderOverlay show={loading} message={status || "Working..."} />
      <h2 className="text-2xl font-semibold mb-2" style={{ fontFamily: "Poppins, Inter" }}>Upload files</h2>
      <p className="text-slate-400 mb-6">Drop or pick your resume & the job description (PDF). The UI will run extraction + matcher and save outputs locally.</p>

      <div className="grid grid-cols-2 gap-6">
        <div className="p-6 glass">
          <div className="text-sm text-slate-300 mb-2">Resume PDF</div>
          <div className="border border-white/6 rounded px-4 py-6 flex items-center justify-between">
            <div>{resumeFile ? resumeFile.name : <span className="text-slate-400">No file selected</span>}</div>
            <div>
              <input ref={resumeRef} type="file" accept="application/pdf" className="hidden" />
              <button className="btn" onClick={() => pickFile(resumeRef, setResumeFile)}>Choose</button>
            </div>
          </div>
        </div>

        <div className="p-6 glass">
          <div className="text-sm text-slate-300 mb-2">Job Description (PDF)</div>
          <div className="border border-white/6 rounded px-4 py-6 flex items-center justify-between">
            <div>{jdFile ? jdFile.name : <span className="text-slate-400">No file selected</span>}</div>
            <div>
              <input ref={jdRef} type="file" accept="application/pdf" className="hidden" />
              <button className="btn" onClick={() => pickFile(jdRef, setJdFile)}>Choose</button>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center gap-4">
        <button onClick={handleGenerate} className="btn px-6 py-3 font-semibold">Run Extraction & Matcher</button>

        <button onClick={() => {
          // clear only the pipeline-related keys
          localStorage.removeItem("process_pair_output");
          localStorage.removeItem("skill_match_output");
          localStorage.removeItem("skill_gap_output");
          localStorage.removeItem("search_jobs_output");
          // keep enhanced_resume_blob (optional) - if you want to clear it too, uncomment:
          // localStorage.removeItem("enhanced_resume_blob");
          setStatus("Cleared saved pipeline outputs.");
        }} className="px-3 py-2 rounded-md bg-white/5">Clear saved</button>

        <div className="ml-auto text-slate-400">{status}</div>
      </div>

      <div className="mt-9 grid grid-cols-3 gap-4">
        <div className="glass p-5">
          <div className="text-sm text-slate-300">Enhanced Resume</div>
          <div className="mt-3 text-white font-medium">Download your ATS-optimized resume (when ready)</div>
          <div className="mt-4 flex gap-2">
            <button className="btn" onClick={() => onNavigate("resume")}>Open</button>
          </div>
        </div>

        <div className="glass p-5">
          <div className="text-sm text-slate-300">Skill Gap</div>
          <div className="mt-3 text-white font-medium">View recommended courses & resources</div>
          <div className="mt-4 flex gap-2">
            <button className="btn" onClick={() => onNavigate("skillgap")}>View</button>
          </div>
        </div>

        <div className="glass p-5">
          <div className="text-sm text-slate-300">Job Search</div>
          <div className="mt-3 text-white font-medium">View curated job listings</div>
          <div className="mt-4 flex gap-2">
            <button className="btn" onClick={() => onNavigate("jobsearch")}>View</button>
          </div>
        </div>
      </div>
    </div>
  );
}
