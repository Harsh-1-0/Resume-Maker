// import React, { useEffect, useState } from "react";

// export default function ResumeDownload(){
//   const [pdfUrl, setPdfUrl] = useState(null);
//   const [error, setError] = useState(null);

//   useEffect(()=>{
//     const raw = localStorage.getItem("enhanced_resume_blob");
//     if(!raw){ setError("No enhanced resume available. Generate first."); return; }
//     // raw is expected to be dataURL like data:application/pdf;base64,....
//     if(raw.startsWith("data:")) {
//       setPdfUrl(raw);
//       return;
//     }
//     // fallback: maybe base64 without prefix
//     if(/^[A-Za-z0-9+/=]+$/.test(raw.slice(0,80))){
//       setPdfUrl("data:application/pdf;base64," + raw);
//       return;
//     }
//     setError("Cannot parse stored resume. Inspect localStorage key.");
//   },[]);

//   const download = ()=>{
//     if(!pdfUrl) return;
//     const a = document.createElement("a");
//     a.href = pdfUrl;
//     a.download = "enhanced_resume.pdf";
//     document.body.appendChild(a);
//     a.click();
//     a.remove();
//   };

//   return (
//     <div className="card p-8 rounded-2xl">
//       <div className="flex items-start gap-6">
//         <div className="flex-1">
//           <h2 className="text-xl font-semibold">Enhanced Resume</h2>
//           <p className="text-sm text-slate-300 mt-2">Your ATS-optimized resume is ready for download and preview.</p>

//           <div className="mt-6 flex gap-3">
//             <button onClick={download} className="px-5 py-2 btn-primary rounded-md font-semibold">Download PDF</button>
//             {pdfUrl && <a className="px-4 py-2 fancy-link rounded-md" href={pdfUrl} target="_blank" rel="noreferrer">Open preview</a>}
//           </div>
//           {error && <div className="mt-3 text-red-400">{error}</div>}
//         </div>

//         <div className="w-96 h-64 bg-black/10 rounded-xl border border-white/6 overflow-hidden">
//           {pdfUrl ? (
//             <iframe src={pdfUrl} className="w-full h-full" title="preview" />
//           ) : (
//             <div className="h-full w-full flex items-center justify-center text-slate-400">No preview</div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }


import { useEffect, useState } from "react";

export default function ResumeDownload({ onBack = () => {} }) {
  const [pdfUrl, setPdfUrl] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const raw = localStorage.getItem("enhanced_resume_blob");
    if (!raw) {
      setError("No enhanced resume found (key: enhanced_resume_blob). Generate first.");
      return;
    }
    if (raw.startsWith("data:")) {
      setPdfUrl(raw);
      return;
    }
    // fallback base64 blob
    try {
      const base64 = raw.indexOf("base64,") >= 0 ? raw.split("base64,")[1] : raw;
      const binary = atob(base64);
      const len = binary.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i);
      const blob = new Blob([bytes], { type: "application/pdf" });
      const obj = URL.createObjectURL(blob);
      setPdfUrl(obj);
      return () => URL.revokeObjectURL(obj);
    } catch (e) {
      setError("Failed to parse stored resume blob.");
    }
  }, []);

  const handleDownload = () => {
    if (!pdfUrl) return;
    const a = document.createElement("a");
    a.href = pdfUrl;
    a.download = "enhanced_resume.pdf";
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent drop-shadow-sm">
          Enhanced Resume
        </h1>
        <button 
          onClick={onBack} 
          className="px-3 py-1 rounded bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 text-white text-sm transition-all duration-300"
        >
          ← Back
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 backdrop-blur-md border border-red-500/20 text-red-200">
          {error}
        </div>
      )}

      <div className="p-6 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/15 hover:border-white/30 transition-all duration-300 group">
        <div className="text-lg font-semibold bg-gradient-to-r from-blue-200 to-cyan-200 bg-clip-text text-transparent mb-2">
          Download your ATS-optimized resume
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleDownload} 
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium hover:from-cyan-400 hover:to-blue-400 hover:scale-[1.02] transition-all duration-300 shadow-lg shadow-blue-500/20"
          >
            Download PDF
          </button>
          {pdfUrl && (
            <a 
              href={pdfUrl} 
              target="_blank" 
              rel="noreferrer" 
              className="px-4 py-2 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 hover:border-white/30 transition-all duration-300"
            >
              Open in new tab
            </a>
          )}
        </div>

        {pdfUrl ? (
          <div className="mt-6">
            <div className="rounded-xl overflow-hidden border border-white/10 hover:border-white/20 transition-all duration-300 shadow-xl shadow-black/20">
              <iframe 
                title="Enhanced Resume" 
                src={pdfUrl} 
                className="w-full h-[720px]" 
                style={{ border: "none" }}
              />
            </div>
          </div>
        ) : !error && (
          <div className="text-gray-400 mt-4 animate-pulse">
            Preparing preview...
          </div>
        )}
      </div>
    </div>
  );
}
