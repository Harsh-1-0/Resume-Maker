import React, { useState, useRef } from "react";
import { processPair } from "../api";

const API_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/process_pair/";

function humanify(v) {
  if (!v) return "";
  if (typeof v === "string") return v;
  try { return JSON.stringify(v, null, 2); } catch { return String(v); }
}

export default function ProcessPair() {
  // resume inputs
  const [resumeMode, setResumeMode] = useState("text");
  const [resumeText, setResumeText] = useState("");
  const [resumeUrl, setResumeUrl] = useState("");
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeSkip, setResumeSkip] = useState(false);

  // jd inputs
  const [jdMode, setJdMode] = useState("text");
  const [jdText, setJdText] = useState("");
  const [jdUrl, setJdUrl] = useState("");
  const [jdFile, setJdFile] = useState(null);
  const [jdSkip, setJdSkip] = useState(false);

  const [loading, setLoading] = useState(false);
  const [resp, setResp] = useState(null);
  const [error, setError] = useState(null);

  const resumeFileRef = useRef(null);
  const jdFileRef = useRef(null);

  async function submit(e) {
    e.preventDefault();
    setError(null);
    setResp(null);

    const fd = new FormData();

    // resume
    if (resumeMode === "file") {
      if (!resumeFile) { setError("Attach resume PDF"); return; }
      fd.append("resume_input_type", "pdf");
      fd.append("resume_file", resumeFile);
    } else if (resumeMode === "url") {
      fd.append("resume_input_type", "url");
      fd.append("resume_url", resumeUrl);
      if (resumeSkip) fd.append("resume_skip_fetch", "true");
    } else {
      fd.append("resume_input_type", "text");
      fd.append("resume_text", resumeText);
    }

    // jd
    if (jdMode === "file") {
      if (!jdFile) { setError("Attach JD PDF"); return; }
      fd.append("jd_input_type", "pdf");
      fd.append("jd_file", jdFile);
    } else if (jdMode === "url") {
      fd.append("jd_input_type", "url");
      fd.append("jd_url", jdUrl);
      if (jdSkip) fd.append("jd_skip_fetch", "true");
    } else {
      fd.append("jd_input_type", "text");
      fd.append("jd_text", jdText);
    }

    setLoading(true);
    try {
      const r = await processPair(fd);
      const data = r.data;
      setResp(data);
      // store process output for downstream flow
      localStorage.setItem("process_pair_output", JSON.stringify(data));
      // auto-run next steps:
      // 1) call skill_match
      await runSkillMatch(data);
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.error || err.message || String(err));
    } finally {
      setLoading(false);
    }
  }

  async function runSkillMatch(processData) {
    // processData should contain resume_json and jd_json
    const resume_json = processData?.resume_json ?? null;
    const jd_json = processData?.jd_json ?? null;
    if (!resume_json || !jd_json) {
      console.warn("process_pair missing resume_json or jd_json");
      return;
    }
    try {
      const payload = { resume_json, jd_json };
      // call skill_match endpoint
      const axios = (await import("../api")).skillMatch;
      const r = await axios(payload);
      const out = r.data;
      localStorage.setItem("skill_match_output", JSON.stringify(out));
      // After skill_match, auto-run skill_gap
      // determine skills to ask gap for:
      let skills = out?.skills || out?.matched_skills || out?.matched || [];
      // normalize skills array
      if (!Array.isArray(skills)) {
        if (out?.skills && typeof out.skills === "object") skills = Object.values(out.skills).flat();
        else skills = [];
      }
      await runSkillGap(skills);
    } catch (e) {
      console.error("skill_match failed", e);
    }
  }

  async function runSkillGap(skills) {
    if (!Array.isArray(skills) || skills.length === 0) {
      console.warn("no skills for gap");
      return;
    }
    try {
      const axios = (await import("../api")).skillGap;
      const r = await axios({ skills });
      localStorage.setItem("skill_gap_output", JSON.stringify(r.data));
    } catch (e) {
      console.error("skill_gap failed", e);
    }
  }

  function clearAll() {
    setResumeText(""); setResumeFile(null); setResumeUrl("");
    setJdText(""); setJdFile(null); setJdUrl("");
    setResp(null); setError(null);
    localStorage.removeItem("process_pair_output");
    localStorage.removeItem("skill_match_output");
    localStorage.removeItem("skill_gap_output");
  }

  return (
    <div className="space-y-6 bg-slate-800 p-6 rounded-lg">
      <form onSubmit={submit} className="grid md:grid-cols-2 gap-6">
        <div className="p-4 bg-slate-700 rounded">
          <h2 className="font-semibold mb-2">Resume</h2>
          <div className="flex gap-2 mb-3">
            <button type="button" onClick={()=>setResumeMode('text')} className={`px-3 py-1 rounded ${resumeMode==='text' ? 'bg-indigo-500 text-white' : 'bg-slate-600 text-white'}`}>Text</button>
            <button type="button" onClick={()=>setResumeMode('file')} className={`px-3 py-1 rounded ${resumeMode==='file' ? 'bg-indigo-500 text-white' : 'bg-slate-600 text-white'}`}>File (PDF)</button>
            <button type="button" onClick={()=>setResumeMode('url')} className={`px-3 py-1 rounded ${resumeMode==='url' ? 'bg-indigo-500 text-white' : 'bg-slate-600 text-white'}`}>URL</button>
          </div>

          {resumeMode === 'text' && <textarea value={resumeText} onChange={(e)=>setResumeText(e.target.value)} rows={8} className="w-full p-2 rounded bg-slate-800" placeholder="Paste resume text here..." />}
          {resumeMode === 'file' && <div><input ref={resumeFileRef} type="file" accept=".pdf" onChange={e=>setResumeFile(e.target.files?.[0]||null)} /></div>}
          {resumeMode === 'url' && <div><input value={resumeUrl} onChange={e=>setResumeUrl(e.target.value)} placeholder="https://example.com/resume" className="w-full p-2 rounded bg-slate-800" /><label className="text-sm"><input type="checkbox" checked={resumeSkip} onChange={e=>setResumeSkip(e.target.checked)} /> Skip fetch (server uses own fetch)</label></div>}
        </div>

        <div className="p-4 bg-slate-700 rounded">
          <h2 className="font-semibold mb-2">Job Description (JD)</h2>
          <div className="flex gap-2 mb-3">
            <button type="button" onClick={()=>setJdMode('text')} className={`px-3 py-1 rounded ${jdMode==='text' ? 'bg-rose-500 text-white' : 'bg-slate-600 text-white'}`}>Text</button>
            <button type="button" onClick={()=>setJdMode('file')} className={`px-3 py-1 rounded ${jdMode==='file' ? 'bg-rose-500 text-white' : 'bg-slate-600 text-white'}`}>File (PDF)</button>
            <button type="button" onClick={()=>setJdMode('url')} className={`px-3 py-1 rounded ${jdMode==='url' ? 'bg-rose-500 text-white' : 'bg-slate-600 text-white'}`}>URL</button>
          </div>

          {jdMode === 'text' && <textarea value={jdText} onChange={(e)=>setJdText(e.target.value)} rows={8} className="w-full p-2 rounded bg-slate-800" placeholder="Paste JD text here..." />}
          {jdMode === 'file' && <div><input ref={jdFileRef} type="file" accept=".pdf" onChange={e=>setJdFile(e.target.files?.[0]||null)} /></div>}
          {jdMode === 'url' && <div><input value={jdUrl} onChange={e=>setJdUrl(e.target.value)} placeholder="https://example.com/job-desc" className="w-full p-2 rounded bg-slate-800" /><label className="text-sm"><input type="checkbox" checked={jdSkip} onChange={e=>setJdSkip(e.target.checked)} /> Skip fetch</label></div>}
        </div>

        <div className="md:col-span-2 flex items-center gap-3">
          <button type="submit" disabled={loading} className="px-4 py-2 bg-green-600 rounded">{loading ? "Processing..." : "Run /process_pair"}</button>
          <button type="button" onClick={clearAll} className="px-3 py-2 bg-slate-600 rounded">Clear</button>
          <div className="ml-auto text-sm text-slate-300">API: <code>{API_URL}</code></div>
        </div>

        <div className="md:col-span-2 grid md:grid-cols-2 gap-4">
          <div className="p-3 bg-slate-800 rounded min-h-[160px]">
            <h3 className="font-semibold">Response</h3>
            {error && <pre className="text-red-400 whitespace-pre-wrap">{error}</pre>}
            {!resp && !error && <div className="text-slate-400">No response yet</div>}
            {resp && <pre className="text-xs whitespace-pre-wrap">{humanify(resp)}</pre>}
          </div>

          <div className="p-3 bg-slate-800 rounded min-h-[160px]">
            <h3 className="font-semibold">Preview</h3>
            <div className="text-sm">
              <strong>Resume:</strong>
              <div className="mt-2">{resumeMode==='file' ? resumeFile?.name || 'No file' : resumeMode==='url' ? resumeUrl || 'No url' : (resumeText ? resumeText.substring(0,400) : 'No text')}</div>
              <hr className="my-2" />
              <strong>JD:</strong>
              <div className="mt-2">{jdMode==='file' ? jdFile?.name || 'No file' : jdMode==='url' ? jdUrl || 'No url' : (jdText ? jdText.substring(0,400) : 'No text')}</div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
