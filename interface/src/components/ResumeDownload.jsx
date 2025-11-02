import { useEffect, useState } from "react";

export default function ResumeDownload({ onBack = () => {} }) {
  const [pdfUrl, setPdfUrl] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const raw = localStorage.getItem("enhanced_resume_blob");
    if (!raw) {
      setError("No resume found in localStorage (key: enhanced_resume_blob).");
      return;
    }

    let objectUrl = null;

    const makeObjectUrl = (blob) => {
      objectUrl = URL.createObjectURL(blob);
      setPdfUrl(objectUrl);
    };

    const base64ToBlob = (base64, mime = "application/pdf") => {
      const base64Data = base64.indexOf("base64,") >= 0 ? base64.split("base64,")[1] : base64;
      const binary = atob(base64Data);
      const len = binary.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i);
      return new Blob([bytes], { type: mime });
    };

    try {
      if (raw.startsWith("blob:")) {
        setPdfUrl(raw);
        return () => {};
      }

      let parsed = null;
      try {
        parsed = JSON.parse(raw);
      } catch (e) {
        parsed = null;
      }

      if (parsed && parsed.data) {
        // common axios blob stringified edgecases
        if (typeof parsed.data === "string") {
          makeObjectUrl(base64ToBlob(parsed.data));
          return () => URL.revokeObjectURL(objectUrl);
        }
        if (parsed.data && parsed.data.type === "Buffer" && Array.isArray(parsed.data.data)) {
          makeObjectUrl(new Blob([new Uint8Array(parsed.data.data)], { type: "application/pdf" }));
          return () => URL.revokeObjectURL(objectUrl);
        }
      }

      if (raw.startsWith("data:")) {
        const mime = raw.substring(5, raw.indexOf(";")) || "application/pdf";
        const blob = base64ToBlob(raw, mime);
        makeObjectUrl(blob);
        return () => URL.revokeObjectURL(objectUrl);
      }

      // raw might already be base64 content
      try {
        const blob = base64ToBlob(raw, "application/pdf");
        makeObjectUrl(blob);
        return () => URL.revokeObjectURL(objectUrl);
      } catch (e) {
        setError("Stored string isn't valid base64 or data URL.");
        return () => {};
      }
    } catch (err) {
      console.error("ResumeDownload error:", err);
      setError("Failed to load resume PDF from localStorage.");
    }

    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, []);

  const handleDownload = () => {
    if (!pdfUrl) return;
    const a = document.createElement("a");
    a.href = pdfUrl;
    a.download = "enhanced_resume.pdf";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-3xl font-bold text-blue-600">Your Enhanced Resume</h1>
        <div className="flex gap-2">
          <button onClick={onBack} className="px-3 py-1 rounded bg-white/5">Back</button>
          <button onClick={handleDownload} className="px-3 py-1 rounded bg-[#39ff14] text-black font-semibold">Download</button>
        </div>
      </div>

      {error && <div className="p-4 bg-red-900 rounded">{error}</div>}

      {pdfUrl ? (
        <div className="border border-gray-800 rounded-lg overflow-hidden">
          <iframe src={pdfUrl} title="Enhanced Resume" className="w-full h-[80vh]" />
        </div>
      ) : (
        !error && <div className="text-gray-400">Preparing resume preview...</div>
      )}
    </div>
  );
}
