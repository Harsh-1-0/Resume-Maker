import { useEffect, useState } from "react";

export default function ResumeDownload() {
    const [pdfUrl, setPdfUrl] = useState(null);

    useEffect(() => {   
        const blobData = localStorage.getItem("enhanced_resume_blob");
        if (blobData) {
            const blob = new Blob([blobData], { type: "application/pdf" });
            const url = URL.createObjectURL(blob);
            setPdfUrl(url);
        }
    }, []);

    const handleDownload = () => {
        if (pdfUrl) {
            const a = document.createElement("a");
            a.href = pdfUrl;
            a.download = "enhanced_resume.pdf";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        }
    };

    return (
        <div className="p-5 font-sans min-h-screen bg-gray-900">
            <h1 className="text-4xl mb-8 mt-2 text-[#39ff14] font-bold">Your Enhanced Resume</h1>
            
            <div className="mb-6">
                <button
                    onClick={handleDownload}
                    className="px-6 py-3 rounded-lg bg-[#39ff14] text-gray-900 hover:bg-[#32ff0a] transition-all hover:shadow-lg hover:shadow-[#39ff14]/30 font-bold flex items-center gap-2"
                >
                    Download Resume <span className="text-xl">↓</span>
                </button>
            </div>

            {pdfUrl && (
                <div className="border-2 border-[#39ff14] rounded-xl p-4 bg-gray-800 shadow-lg shadow-[#39ff14]/20">
                    <iframe
                        src={pdfUrl}
                        className="w-full h-[800px] rounded-lg"
                        title="Enhanced Resume Preview"
                    />
                </div>
            )}
        </div>
    );
}