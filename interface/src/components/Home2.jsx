import axios from "axios";
import React, { useRef, useState, useEffect } from "react";
import SkeletonLoader from "./SkeletonLoader";

/*
Props:
  onNavigate(pageName) - function to navigate pages ('resume','skillgap','jobsearch')
*/

export default function Home({ onNavigate = () => {} }) {
  const resumeInputRef = useRef(null);
  const jdInputRef = useRef(null);

  const [resumeFile, setResumeFile] = useState(null);
  const [jdFile, setJdFile] = useState(null);

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [processOutput, setProcessOutput] = useState(
    () => JSON.parse(localStorage.getItem("process_pair_output") || "null")
  );
  const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10MB

  useEffect(() => {
    // keep localStorage cleared where appropriate (but not mandatory)
    // localStorage.clear();  // don't clear globally; let user reuse outputs
  }, []);

  function handleFileSelection(e, setter, acceptTypes) {
    setError("");
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    if (acceptTypes && !acceptTypes.includes(file.type)) {
      setter(null);
      setError(`Invalid file type: ${file.type}`);
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      setter(null);
      setError("File too large (max 10MB)");
      return;
    }
    setter(file);
  }

  async function handleSubmit() {
    setError("");
    if (!resumeFile) return setError("Please upload a resume (PDF).");
    if (!jdFile) return setError("Please upload a job description file.");

    setSubmitting(true);
    setLoading(true);

    const url = "http://127.0.0.1:8000";
    const fd = new FormData();
    fd.append("resume_input_type", "pdf");
    fd.append("resume_file", resumeFile);
    fd.append("jd_input_type", "pdf");
    fd.append("jd_file", jdFile);

    try {
      const response = await axios.post(`${url}/process_pair/`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 240000,
      });

      if (!response?.data) throw new Error("No response body from /process_pair/");

      const outputData = response.data;
      setProcessOutput(outputData);
      localStorage.setItem("process_pair_output", JSON.stringify(outputData));

      // Next: skill_match
      const sm = await axios.post(`${url}/skill_match/`, outputData, {
        headers: { "Content-Type": "application/json" },
        timeout: 120000,
      });

      localStorage.setItem("skill_match_output", JSON.stringify(sm.data));

      // Next: skill_gap (optional here we don't need to call it now; user will see page that auto-calls skill_gap)
      // Request resume PDF generation
      try {
        const resPdf = await axios.post(
          `${url}/resume`,
          { resume_json: outputData.resume_json, jd_json: outputData.jd_json, matcher: sm.data },
          { headers: { "Content-Type": "application/json" }, responseType: "blob", timeout: 240000 }
        );

        // convert blob to dataURL and store
        const reader = new FileReader();
        reader.onloadend = () => {
          localStorage.setItem("enhanced_resume_blob", reader.result); // data:<mime>;base64,...
        };
        reader.readAsDataURL(resPdf.data);
      } catch (e) {
        // Resume generation might fail (pdflatex etc) — don't block the flow
        console.warn("Generate resume endpoint failed:", e?.message || e);
      }

      // show final CTA area: resume / skill gap / job search
      setSubmitting(false);
      setLoading(false);
      // auto navigate? no — show the CTA buttons below; user controls
    } catch (err) {
      setError(err?.response?.data?.error || err.message || String(err));
      setSubmitting(false);
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Upload cards */}
        <div className="rounded-xl p-6 bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-800 shadow-lg">
          <div className="flex flex-col items-start gap-3">
            <h2 className="text-2xl font-bold text-[#39ff14]">Upload Resume</h2>
            <p className="text-gray-400">PDF only. Max 10MB.</p>

            <div className="flex items-center gap-3 mt-4">
              <button
                className="px-5 py-2 bg-gray-800 border border-[#39ff14] text-[#39ff14] rounded-lg hover:bg-gray-700"
                onClick={() => resumeInputRef.current && resumeInputRef.current.click()}
              >
                Choose Resume
              </button>
              <div className="text-sm text-gray-300">
                {resumeFile ? <strong>{resumeFile.name}</strong> : "No file selected"}
              </div>
            </div>

            <input
              ref={resumeInputRef}
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={(e) => handleFileSelection(e, setResumeFile, ["application/pdf"])}
            />
          </div>
        </div>

        <div className="rounded-xl p-6 bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-800 shadow-lg">
          <div className="flex flex-col items-start gap-3">
            <h2 className="text-2xl font-bold text-[#39ff14]">Upload Job Description</h2>
            <p className="text-gray-400">PDF or plain text file.</p>

            <div className="flex items-center gap-3 mt-4">
              <button
                className="px-5 py-2 bg-gray-800 border border-[#39ff14] text-[#39ff14] rounded-lg hover:bg-gray-700"
                onClick={() => jdInputRef.current && jdInputRef.current.click()}
              >
                Choose JD
              </button>
              <div className="text-sm text-gray-300">
                {jdFile ? <strong>{jdFile.name}</strong> : "No file selected"}
              </div>
            </div>

            <input
              ref={jdInputRef}
              type="file"
              accept="application/pdf,text/plain"
              className="hidden"
              onChange={(e) => handleFileSelection(e, setJdFile, null)}
            />
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center gap-4">
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="px-6 py-3 bg-[#39ff14] text-gray-900 font-semibold rounded-lg hover:bg-[#32ff0a] disabled:opacity-50"
        >
          {loading ? "Processing..." : "Process & Generate"}
        </button>

        {error && <div className="text-red-400 font-medium">{error}</div>}
      </div>

      {/* loading / skeleton when submitting */}
      <div className="mt-8">
        {loading && <SkeletonLoader />}

        {/* If we have process output, show main CTA buttons */}
        {!loading && processOutput && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => onNavigate("resume")}
              className="p-6 rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 border border-[#39ff14] hover:scale-[1.01] transform transition shadow-lg"
            >
              <div className="text-xl font-bold text-[#39ff14]">Download Resume</div>
              <div className="text-sm text-gray-300 mt-1">Get your ATS-optimized PDF</div>
            </button>

            <button
              onClick={() => onNavigate("skillgap")}
              className="p-6 rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 border border-[#39ff14] hover:scale-[1.01] transform transition shadow-lg"
            >
              <div className="text-xl font-bold text-[#39ff14]">Skill Gap</div>
              <div className="text-sm text-gray-300 mt-1">Personalized learning recommendations</div>
            </button>

            <button
              onClick={() => onNavigate("jobsearch")}
              className="p-6 rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 border border-[#39ff14] hover:scale-[1.01] transform transition shadow-lg"
            >
              <div className="text-xl font-bold text-[#39ff14]">Job Search</div>
              <div className="text-sm text-gray-300 mt-1">Relevant jobs based on JD</div>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
