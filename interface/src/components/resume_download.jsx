import { useEffect, useState } from "react";

export default function ResumeDownload() {
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
      // remove data url prefix if present
      const base64Data = base64.indexOf("base64,") >= 0 ? base64.split("base64,")[1] : base64;
      const binary = atob(base64Data);
      const len = binary.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i);
      return new Blob([bytes], { type: mime });
    };

    try {
      // If it's a blob URL already
      if (raw.startsWith("blob:")) {
        setPdfUrl(raw);
        return () => {};
      }

      // Try parse JSON — many apps store the entire axios response or a bytes array
      let parsed;
      try {
        parsed = JSON.parse(raw);
      } catch (e) {
        parsed = null;
      }

      if (parsed) {
        // Case: axios-like response object { data: <blob | base64 | array | { type:'Buffer', data:[..] } >, headers: {...} }
        if (parsed.data) {
          const contentType =
            (parsed.headers && (parsed.headers["content-type"] || parsed.headers["Content-Type"])) ||
            "application/pdf";

          // If data is a string (maybe base64 or dataURL)
          if (typeof parsed.data === "string") {
            // base64 / dataURL
            const blob = base64ToBlob(parsed.data, contentType);
            makeObjectUrl(blob);
            return () => URL.revokeObjectURL(objectUrl);
          }

          // If data is an array of numbers (bytes)
          if (Array.isArray(parsed.data)) {
            const arr = new Uint8Array(parsed.data);
            makeObjectUrl(new Blob([arr], { type: contentType }));
            return () => URL.revokeObjectURL(objectUrl);
          }

          // If stored as Node Buffer-like object: { type: 'Buffer', data: [...] }
          if (parsed.data && parsed.data.type === "Buffer" && Array.isArray(parsed.data.data)) {
            const arr = new Uint8Array(parsed.data.data);
            makeObjectUrl(new Blob([arr], { type: contentType }));
            return () => URL.revokeObjectURL(objectUrl);
          }

          // If parsed.data itself is an object but empty (common when someone stringified axios response with blob -> becomes {}):
          // try to find a base64 property inside parsed (fall back)
        }

        // If parsed itself is an object with a property that looks like bytes or base64
        // e.g., { type: 'application/pdf', data: 'JV...base64...' } or { dataUrl: 'data:application/pdf;base64,...' }
        const maybeBase64 =
          parsed.data && typeof parsed.data === "string"
            ? parsed.data
            : parsed.dataUrl || parsed.base64 || parsed.file || parsed.body;
        if (maybeBase64 && typeof maybeBase64 === "string") {
          const mime = parsed.type || (parsed.headers && parsed.headers["content-type"]) || "application/pdf";
          const blob = base64ToBlob(maybeBase64, mime);
          makeObjectUrl(blob);
          return () => URL.revokeObjectURL(objectUrl);
        }

        // If parsed was an ArrayBuffer-like object stored as {byteLength:..., data: [...]}
        if (parsed.byteLength && parsed.data && Array.isArray(parsed.data)) {
          makeObjectUrl(new Blob([new Uint8Array(parsed.data)], { type: "application/pdf" }));
          return () => URL.revokeObjectURL(objectUrl);
        }

        // If we couldn't detect PDF bytes inside parsed — as a fallback, try to stringify and treat as text (not ideal)
        // But better to surface an error so the developer can inspect what's stored.
        setError("Couldn't interpret stored JSON as a PDF. Inspect localStorage.enhanced_resume_blob.");
        return () => {};
      } else {
        // Not JSON: raw string could be a data URL or raw base64
        if (raw.startsWith("data:")) {
          // data URL
          // extract mime (optional)
          const mime = raw.substring(5, raw.indexOf(";")) || "application/pdf";
          const blob = base64ToBlob(raw, mime);
          makeObjectUrl(blob);
          return () => URL.revokeObjectURL(objectUrl);
        }

        // raw might be plain base64 (without data: prefix)
        try {
          const blob = base64ToBlob(raw, "application/pdf");
          makeObjectUrl(blob);
          return () => URL.revokeObjectURL(objectUrl);
        } catch (e) {
          setError("Stored string isn't valid base64 or data URL.");
          return () => {};
        }
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
    <div className="p-5 font-sans min-h-screen bg-gray-900 text-white">
      <h1 className="text-4xl mb-4 mt-2 text-[#39ff14] font-bold">Your Enhanced Resume</h1>

      {error && (
        <div className="mb-4 p-3 rounded bg-red-800/60 border border-red-700">
          <strong className="text-red-300">Error:</strong> <span className="ml-2">{error}</span>
          <div className="text-xs mt-2 text-gray-300">
            Tip: open your browser console and check localStorage.getItem("enhanced_resume_blob") to see the raw value.
          </div>
        </div>
      )}

      <div className="mb-6 flex gap-3">
        <button
          onClick={handleDownload}
          disabled={!pdfUrl}
          className={`px-6 py-3 rounded-lg bg-[#39ff14] text-gray-900 font-bold flex items-center gap-2 ${
            !pdfUrl ? "opacity-60 cursor-not-allowed" : "hover:bg-[#32ff0a] transition-all hover:shadow-lg hover:shadow-[#39ff14]/30"
          }`}
        >
          Download Resume <span className="text-xl">↓</span>
        </button>

        {pdfUrl && (
          <a
            href={pdfUrl}
            target="_blank"
            rel="noreferrer"
            className="px-4 py-3 rounded-lg bg-gray-800 border border-[#39ff14] text-[#39ff14] font-medium self-center"
          >
            Open in new tab
          </a>
        )}
      </div>

      {pdfUrl ? (
        <div className="border-2 border-[#39ff14] rounded-xl p-4 bg-gray-800 shadow-lg shadow-[#39ff14]/20">
          <iframe src={pdfUrl} className="w-full h-[800px] rounded-lg" title="Enhanced Resume Preview" />
        </div>
      ) : (
        !error && <div className="text-gray-300">Loading resume preview...</div>
      )}
    </div>
  );
}