import axios from "axios";
import React, { useRef, useState, useEffect, use } from "react";
import SnakeLoader from "./snakeLoader";

export default function Home() {
  const resumeInputRef = useRef(null);
  const jdInputRef = useRef(null);
  const [resumeFile, setResumeFile] = useState(null);
  const [jdFile, setJdFile] = useState(null);
  const [parseOutput, setParseOutput] = useState(() => {
    const saved = localStorage.getItem("parse_output");
    return saved ? JSON.parse(saved) : null;
  });
  const [githubLink, setGithubLink] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [result2, setResult2] = useState(null);

  const MAX_FILE_BYTES = 5 * 1024 * 1024; // 5MB


  useEffect(() => {
    localStorage.clear();
  }, []);

  useEffect(() => {
    console.log(localStorage.skill_match_output);
    console.log(localStorage.skill_gap_output);
  }, [result2]);

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
      setError("File too large (max 5MB)");
      return;
    }
    setter(file);
  }

  async function handleSubmit() {
    setError("");
    setResult(null);
    if (!resumeFile) return setError("Please upload a resume (PDF)");
    if (!jdFile) return setError("Please upload a job description file");

    const url = "http://127.0.0.1:8000";
    const fd = new FormData();
    fd.append("resume_input_type", "pdf");
    fd.append("resume_file", resumeFile);
    fd.append("jd_input_type", "pdf");
    fd.append("jd_file", jdFile);

    try {
      setLoading(true);
      const response = await axios.post(`${url}/process_pair/`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 240000,
      });
      const outputData = response.data ?? { message: "Success (no JSON body)" };
      setParseOutput(outputData);
      localStorage.setItem("parse_output", JSON.stringify(outputData));
      setResult(outputData);
      const response2 = await axios.post(
        `${url}/skill_match/`,
        JSON.stringify(outputData),
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      console.log("Skill Match Response:", response2.data);
      setResult2(response2.data);
      localStorage.setItem(
        "skill_match_output",
        JSON.stringify(response2.data)
      );
      const response3 = await axios.post(
        "http://localhost:8000/resume",
        {
          ...outputData, // expands to resume_json + jd_json
          matcher: response2.data, // third argument
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          responseType: "blob", // because FastAPI returns a PDF
        }
      );
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64data = reader.result; // "data:application/pdf;base64,JVBERi0x..."
        localStorage.setItem("enhanced_resume_blob", base64data);
        console.log("✅ Resume stored in localStorage!");
      };
      reader.readAsDataURL(response3.data);
      localStorage.setItem("enhanced_resume_blob", response3.data);
      console.log("Resume Enhancement Response:", response3);
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {loading && <SnakeLoader />}
      <div className="p-5 font-sans min-h-screen bg-gray-900">
        <h1 className="text-4xl mb-8 mt-2 text-[#39ff14] font-bold">
          We need one last thing from you
        </h1>

        <div className="grid grid-cols-2 gap-8">
          <div className="border-2 border-[#39ff14] rounded-xl p-8 bg-gray-800 min-h-[300px] flex flex-col items-center justify-center shadow-lg shadow-[#39ff14]/20">
            <div className="text-center">
              <div className="text-2xl mb-2 text-[#39ff14]">Upload Resume</div>
              <div className="text-gray-400 mb-3">(PDF Only, Max 5MB)</div>
              <button
                onClick={() =>
                  resumeInputRef.current && resumeInputRef.current.click()
                }
                className="px-6 py-3 rounded-lg bg-gray-700 hover:bg-gray-600 border border-[#39ff14] text-[#39ff14] transition-all hover:shadow-[#39ff14]/30 hover:shadow-lg"
                type="button"
              >
                <div className="flex items-center justify-center gap-2">
                  <span className="text-xl">↑</span>
                  Choose Resume
                </div>
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

              <div className="mt-4">
                {resumeFile ? (
                  <div className="text-[#39ff14]">
                    <span className="font-semibold">Selected:</span>{" "}
                    {resumeFile.name}
                  </div>
                ) : (
                  <div className="text-gray-500">No file selected</div>
                )}
              </div>
            </div>
          </div>

          <div className="border-2 border-[#39ff14] rounded-xl p-8 bg-gray-800 min-h-[300px] flex flex-col items-center justify-center shadow-lg shadow-[#39ff14]/20">
            <div className="text-center">
              <div className="text-2xl mb-2 text-[#39ff14]">
                Upload Job Description
              </div>
              <div className="text-gray-400 mb-3">(PDF or plain text)</div>
              <button
                onClick={() => jdInputRef.current && jdInputRef.current.click()}
                className="px-6 py-3 rounded-lg bg-gray-700 hover:bg-gray-600 border border-[#39ff14] text-[#39ff14] transition-all hover:shadow-[#39ff14]/30 hover:shadow-lg"
                type="button"
              >
                <div className="flex items-center justify-center gap-2">
                  <span className="text-xl">↑</span>
                  Choose JD
                </div>
              </button>

              <input
                ref={jdInputRef}
                type="file"
                accept="application/pdf,text/plain"
                className="hidden"
                onChange={(e) => handleFileSelection(e, setJdFile, null)}
              />

              <div className="mt-4">
                {jdFile ? (
                  <div className="text-[#39ff14]">
                    <span className="font-semibold">Selected:</span>{" "}
                    {jdFile.name}
                  </div>
                ) : (
                  <div className="text-gray-500">No file selected</div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex items-center gap-3">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-8 py-3 rounded-lg bg-[#39ff14] text-gray-900 hover:bg-[#32ff0a] disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:shadow-lg hover:shadow-[#39ff14]/30 font-bold flex items-center gap-2"
          >
            {loading ? (
              "Uploading..."
            ) : (
              <>
                Next <span className="text-xl leading-none">→</span>
              </>
            )}
          </button>

          {error && <div className="text-red-500 font-semibold">{error}</div>}
        </div>
      </div>
    </>
  );
}