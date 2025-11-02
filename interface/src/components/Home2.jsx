import axios from "axios";
import React, { useRef, useState } from "react";
import SkeletonLoader from "./SkeletonLoader";

export default function Home({ onNavigate }) {
  const resumeInputRef = useRef(null);
  const jdInputRef = useRef(null);
  const [resumeFile, setResumeFile] = useState(null);
  const [jdFile, setJdFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [processOutput, setProcessOutput] = useState(
    () => JSON.parse(localStorage.getItem("process_pair_output") || "null")
  );
  const [error, setError] = useState("");

  const MAX_FILE_BYTES = 10 * 1024 * 1024;

  const handleFileSelection = (e, setter, acceptTypes) => {
    setError("");
    const file = e.target.files?.[0];
    if (!file) return;
    if (acceptTypes && !acceptTypes.includes(file.type)) {
      return setError(`Invalid file type: ${file.type}`);
    }
    if (file.size > MAX_FILE_BYTES) {
      return setError("File too large (max 10MB)");
    }
    setter(file);
  };

  async function handleSubmit() {
    if (!resumeFile) return setError("Please upload a resume.");
    if (!jdFile) return setError("Please upload a job description.");
    setError("");
    setLoading(true);

    try {
      const url = "http://127.0.0.1:8000";
      const fd = new FormData();
      fd.append("resume_input_type", "pdf");
      fd.append("resume_file", resumeFile);
      fd.append("jd_input_type", "pdf");
      fd.append("jd_file", jdFile);

      const resp = await axios.post(`${url}/process_pair/`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 240000,
      });
      localStorage.setItem("process_pair_output", JSON.stringify(resp.data));
      setProcessOutput(resp.data);

      const sm = await axios.post(`${url}/skill_match/`, resp.data, {
        headers: { "Content-Type": "application/json" },
        timeout: 240000,
      });
      localStorage.setItem("skill_match_output", JSON.stringify(sm.data));

      const pdfResp = await axios.post(
        `${url}/resume`,
        { ...resp.data, matcher: sm.data },
        { headers: { "Content-Type": "application/json" }, responseType: "blob" }
      );
      const reader = new FileReader();
      reader.onloadend = () =>
        localStorage.setItem("enhanced_resume_blob", reader.result);
      reader.readAsDataURL(pdfResp.data);
    } catch (err) {
      setError(err?.message || "Processing failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-4xl font-bold text-gray-800 mb-2">
          Your Career, Simplified
        </h1>
        <p className="text-gray-600 text-lg">
          Upload your resume and job description to generate an ATS-optimized resume,
          identify skill gaps, and find matching jobs.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Resume Upload */}
        <div className="rounded-xl bg-white border border-gray-200 p-6 shadow-sm hover:shadow-md transition">
          <h2 className="text-xl font-semibold mb-1">Upload Resume</h2>
          <p className="text-sm text-gray-500 mb-4">PDF only, max 10MB</p>
          <button
            onClick={() => resumeInputRef.current.click()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition font-medium"
          >
            Choose Resume
          </button>
          <input
            ref={resumeInputRef}
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={(e) =>
              handleFileSelection(e, setResumeFile, ["application/pdf"])
            }
          />
          {resumeFile && (
            <p className="mt-3 text-sm text-gray-600">Selected: {resumeFile.name}</p>
          )}
        </div>

        {/* JD Upload */}
        <div className="rounded-xl bg-white border border-gray-200 p-6 shadow-sm hover:shadow-md transition">
          <h2 className="text-xl font-semibold mb-1">Upload Job Description</h2>
          <p className="text-sm text-gray-500 mb-4">PDF or Text file</p>
          <button
            onClick={() => jdInputRef.current.click()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition font-medium"
          >
            Choose JD
          </button>
          <input
            ref={jdInputRef}
            type="file"
            accept="application/pdf,text/plain"
            className="hidden"
            onChange={(e) => handleFileSelection(e, setJdFile, null)}
          />
          {jdFile && (
            <p className="mt-3 text-sm text-gray-600">Selected: {jdFile.name}</p>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
          {error}
        </div>
      )}

      <div>
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="px-6 py-3 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition font-semibold shadow-sm disabled:opacity-60"
        >
          {loading ? "Processing..." : "Generate Insights"}
        </button>
      </div>

      {loading && <SkeletonLoader />}

      {!loading && processOutput && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          {[
            { title: "Enhanced Resume", desc: "Download ATS-optimized version", page: "resume" },
            { title: "Skill Gap", desc: "See what to learn next", page: "skillgap" },
            { title: "Job Search", desc: "Find matching jobs", page: "jobsearch" },
          ].map((b) => (
            <button
              key={b.page}
              onClick={() => onNavigate(b.page)}
              className="p-6 text-left bg-white rounded-xl border border-gray-200 hover:shadow-md transition group"
            >
              <h3 className="text-lg font-semibold text-gray-800 group-hover:text-blue-600">
                {b.title}
              </h3>
              <p className="text-sm text-gray-500 mt-1">{b.desc}</p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
