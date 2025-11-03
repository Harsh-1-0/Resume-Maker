import React, { useEffect, useState } from "react";

/*
Reads localStorage.enhanced_resume_blob and renders inline preview + download.
Expects a data URL (data:application/pdf;base64,....) stored by Home.
*/

export default function ResumeDownload({ onBack }){
  const [pdfUrl, setPdfUrl] = useState(null);
  const [error, setError] = useState(null);

  useEffect(()=>{
    const raw = localStorage.getItem("enhanced_resume_blob");
    if(!raw){ setError("No generated resume found. Run the pipeline first."); return; }
    // if it's already a data URL, use it
    if(raw.startsWith("data:")){ setPdfUrl(raw); return; }
    // if it's base64 without prefix
    if(raw.startsWith("%PDF") || raw.startsWith("JVBER")) {
      // not typical — require data url
      setError("Stored PDF looks raw. Re-run pipeline.");
      return;
    }
    // try parse JSON (not likely)
    try {
      setPdfUrl(raw);
    } catch(e){
      setError("Invalid resume data in localStorage.");
    }
  },[]);

  function handleDownload(){
    if(!pdfUrl) return;
    const a = document.createElement("a");
    a.href = pdfUrl;
    a.download = "enhanced_resume.pdf";
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  return (
    <div className="glass p-6">
      <button className="text-slate-300 mb-4" onClick={onBack}>← Back</button>
      <h3 className="text-2xl font-semibold">Your Enhanced Resume</h3>
      <p className="text-slate-400 mb-4">Download or preview the generated ATS-optimized PDF.</p>

      {!pdfUrl && <div className="text-red-400">{error}</div>}
      {pdfUrl && (
        <>
          <div className="flex gap-3 mb-4">
            <button className="btn" onClick={handleDownload}>Download PDF</button>
            <a className="btn" href={pdfUrl} target="_blank" rel="noreferrer">Open in new tab</a>
          </div>

          <div className="border border-white/6 rounded-lg overflow-hidden" style={{height: "720px"}}>
            <iframe src={pdfUrl} title="Resume preview" className="w-full h-full" />
          </div>
        </>
      )}
    </div>
  );
}
