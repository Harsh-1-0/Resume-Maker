import React, { useRef, useState } from "react";
import axios from "axios";

/*
Behavior:
- Sends /process_pair/ to backend with resume + jd (supports text/url/pdf)
- Stores process_pair_output in localStorage
- Calls /skill_match/ with process_pair_output -> stores skill_match_output
- Calls /skill_gap/ with skill_match_output -> stores skill_gap_output
- Calls /search_jobs (async) with resume jd summary -> stores search_jobs_output
- Calls /resume to generate final PDF and stores enhanced_resume_blob
- All calls are sequential; shows progress to user via local state and triggers app-level loader via prop
*/

const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

function smallNote(t){ return <div className="text-xs text-slate-300 mt-1">{t}</div> }

export default function ProcessPair({ setGlobalLoading, go }){
  const [resumeMode,setResumeMode] = useState("text");
  const [resumeText,setResumeText] = useState("");
  const [resumeUrl,setResumeUrl] = useState("");
  const [resumeFile, setResumeFile] = useState(null);
  const [jdMode,setJdMode] = useState("text");
  const [jdText,setJdText] = useState("");
  const [jdUrl,setJdUrl] = useState("");
  const [jdFile,setJdFile] = useState(null);

  const [status, setStatus] = useState("idle");
  const [error, setError] = useState(null);

  const fileRefR = useRef(), fileRefJ = useRef();

  async function submitFlow(e){
    e?.preventDefault();
    setError(null);

    // Validate minimal input
    if(resumeMode==="text" && !resumeText.trim()){ setError("Please paste resume text or switch input method."); return; }
    if(resumeMode==="pdf" && !resumeFile){ setError("Please attach resume PDF."); return; }
    if(resumeMode==="url" && !resumeUrl.trim()){ setError("Please paste resume URL."); return; }

    if(jdMode==="text" && !jdText.trim()){ setError("Please paste JD text or switch input method."); return; }
    if(jdMode==="pdf" && !jdFile){ setError("Please attach JD PDF."); return; }
    if(jdMode==="url" && !jdUrl.trim()){ setError("Please paste JD URL."); return; }

    setGlobalLoading(true);
    setStatus("Uploading to /process_pair...");
    try {
      // ---- process_pair ----
      const fd = new FormData();
      // resume
      if(resumeMode==="pdf"){ fd.append("resume_input_type","pdf"); fd.append("resume_file", resumeFile); }
      else if(resumeMode==="url"){ fd.append("resume_input_type","url"); fd.append("resume_url", resumeUrl); }
      else { fd.append("resume_input_type","text"); fd.append("resume_text", resumeText); }

      // jd
      if(jdMode==="pdf"){ fd.append("jd_input_type","pdf"); fd.append("jd_file", jdFile); }
      else if(jdMode==="url"){ fd.append("jd_input_type","url"); fd.append("jd_url", jdUrl); }
      else { fd.append("jd_input_type","text"); fd.append("jd_text", jdText); }

      const procRes = await axios.post(`${API}/process_pair/`, fd, { headers: { "Content-Type": "multipart/form-data" }, timeout: 120000 });
      localStorage.setItem("process_pair_output", JSON.stringify(procRes.data));
      setStatus("process_pair done. Running skill_match...");
      // ---- skill_match ----
      const skillMatchRes = await axios.post(`${API}/skill_match/`, procRes.data, { headers: { "Content-Type":"application/json" }, timeout: 120000 });
      localStorage.setItem("skill_match_output", JSON.stringify(skillMatchRes.data));
      setStatus("skill_match done. Running skill_gap...");
      // ---- skill_gap ----
      const skillGapRes = await axios.post(`${API}/skill_gap/`, skillMatchRes.data, { headers: { "Content-Type":"application/json" }, timeout: 120000 });
      localStorage.setItem("skill_gap_output", JSON.stringify(skillGapRes.data));
      setStatus("skill_gap done. Generating resume & searching for jobs...");
      // ---- resume (pdf) ----
      try {
        const resumeResp = await axios.post(`${API}/resume`, {
          resume_json: procRes.data.resume_json,
          jd_json: procRes.data.jd_json,
          matcher: skillMatchRes.data
        }, { responseType: "blob", timeout: 180000 });
        // convert blob -> dataURL and save
        const b = resumeResp.data;
        const reader = new FileReader();
        reader.onloadend = ()=> {
          localStorage.setItem("enhanced_resume_blob", reader.result);
        };
        reader.readAsDataURL(b);
      } catch(e){
        // If resume endpoint is not enabled, ignore but warn
        console.warn("Resume endpoint failed:", e);
      }
      // ---- search_jobs (async but run now) ----
      try {
        const searchResp = await axios.post(`${API}/search_jobs`, procRes.data, { headers:{ "Content-Type":"application/json" }, timeout:120000 });
        localStorage.setItem("search_jobs_output", JSON.stringify(searchResp.data));
      } catch(e){
        console.warn("search_jobs failed:", e);
      }

      setStatus("All done. Outputs saved locally.");
      // go to dashboard area (Resume Download & pages)
      setTimeout(()=>{ go("resume"); setGlobalLoading(false); }, 800);
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.error || err.message || String(err));
      setGlobalLoading(false);
      setStatus("failed");
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Upload Resume & Job Description</h2>
      <form onSubmit={submitFlow} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass p-4">
          <div className="flex items-center justify-between">
            <div className="font-semibold">Resume</div>
            <div className="text-sm text-slate-300">Supports text / pdf / url</div>
          </div>
          <div className="mt-3 flex gap-2">
            <button type="button" onClick={()=>setResumeMode("text")} className={`px-3 py-1 rounded ${resumeMode==="text" ? "bg-gradient-to-r from-[#7F6BFF] to-[#00FFD6] text-black" : "bg-white/3"}`}>Text</button>
            <button type="button" onClick={()=>setResumeMode("pdf")} className={`px-3 py-1 rounded ${resumeMode==="pdf" ? "bg-gradient-to-r from-[#7F6BFF] to-[#00FFD6] text-black" : "bg-white/3"}`}>File (PDF)</button>
            <button type="button" onClick={()=>setResumeMode("url")} className={`px-3 py-1 rounded ${resumeMode==="url" ? "bg-gradient-to-r from-[#7F6BFF] to-[#00FFD6] text-black" : "bg-white/3"}`}>URL</button>
          </div>

          {resumeMode==="text" && <textarea value={resumeText} onChange={e=>setResumeText(e.target.value)} rows={8} className="w-full mt-3 p-3 bg-transparent border rounded-md" placeholder="Paste resume text here..." />}
          {resumeMode==="pdf" && <div className="mt-3">
            <input ref={fileRefR} type="file" accept="application/pdf" onChange={e=>setResumeFile(e.target.files?.[0]??null)} />
            {resumeFile && <div className="mt-2 text-sm">{resumeFile.name}</div>}
          </div>}
          {resumeMode==="url" && <input className="mt-3 w-full p-2 bg-transparent border rounded-md" placeholder="https://example.com/resume" value={resumeUrl} onChange={e=>setResumeUrl(e.target.value)} />}

          {smallNote("We will extract structured JSON from your resume and keep it locally.")}
        </div>

        <div className="glass p-4">
          <div className="flex items-center justify-between">
            <div className="font-semibold">Job Description (JD)</div>
            <div className="text-sm text-slate-300">Supports text / pdf / url</div>
          </div>

          <div className="mt-3 flex gap-2">
            <button type="button" onClick={()=>setJdMode("text")} className={`px-3 py-1 rounded ${jdMode==="text" ? "bg-gradient-to-r from-[#7F6BFF] to-[#00FFD6] text-black" : "bg-white/3"}`}>Text</button>
            <button type="button" onClick={()=>setJdMode("pdf")} className={`px-3 py-1 rounded ${jdMode==="pdf" ? "bg-gradient-to-r from-[#7F6BFF] to-[#00FFD6] text-black" : "bg-white/3"}`}>File (PDF)</button>
            <button type="button" onClick={()=>setJdMode("url")} className={`px-3 py-1 rounded ${jdMode==="url" ? "bg-gradient-to-r from-[#7F6BFF] to-[#00FFD6] text-black" : "bg-white/3"}`}>URL</button>
          </div>

          {jdMode==="text" && <textarea value={jdText} onChange={e=>setJdText(e.target.value)} rows={8} className="w-full mt-3 p-3 bg-transparent border rounded-md" placeholder="Paste job description here..." />}
          {jdMode==="pdf" && <div className="mt-3">
            <input ref={fileRefJ} type="file" accept="application/pdf" onChange={e=>setJdFile(e.target.files?.[0]??null)} />
            {jdFile && <div className="mt-2 text-sm">{jdFile.name}</div>}
          </div>}
          {jdMode==="url" && <input className="mt-3 w-full p-2 bg-transparent border rounded-md" placeholder="https://example.com/jd" value={jdUrl} onChange={e=>setJdUrl(e.target.value)} />}

          {smallNote("We will extract required skills and JD summary and compute gaps.")}
        </div>

        <div className="md:col-span-2 flex items-center gap-4">
          <button type="button" onClick={submitFlow} className="btn-accent px-6 py-3 rounded-md shadow">Generate Insights</button>
          <button type="button" onClick={()=>{
            setResumeText(""); setResumeFile(null); setResumeUrl("");
            setJdText(""); setJdFile(null); setJdUrl(""); localStorage.removeItem("process_pair_output");
            localStorage.removeItem("skill_match_output"); localStorage.removeItem("skill_gap_output");
            localStorage.removeItem("search_jobs_output"); localStorage.removeItem("enhanced_resume_blob");
            setStatus("cleared"); setError(null);
          }} className="px-4 py-2 rounded bg-white/6">Clear saved</button>

          <div className="ml-auto text-slate-300">
            <div className="text-sm">Status:</div>
            <div className="text-xs text-slate-200/80">{status}</div>
            {error && <div className="text-sm text-rose-400 mt-1">{error}</div>}
          </div>
        </div>
      </form>
    </div>
  );
}
