import React from "react";

/*
Elegant full-screen loader. Simple animated orbs with message.
*/

export default function LoaderOverlay({ show = false, message = "Working..." }) {
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/55 backdrop-blur-sm"></div>
      <div className="relative p-8 glass flex gap-8 items-center rounded-xl" style={{width:760}}>
        <div className="flex items-center gap-3">
          <div className="w-36 h-36 rounded-full bg-gradient-to-br from-slate-800 to-sky-600 flex items-center justify-center shadow-2xl">
            <div className="w-20 h-20 rounded-full bg-white/6 animate-pulse" />
          </div>
        </div>

        <div>
          <div className="text-lg font-semibold mb-1">Hold tight — {message}</div>
          <div className="text-sm text-slate-300 max-w-md">
            This may take up to 2 minutes while the ATS optimizer and job search run. We’ll notify you as soon as results are ready.
          </div>

          <div className="mt-6">
            <div className="w-[420px] h-2 rounded bg-white/6 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-sky-400 to-teal-300 animate-[progress_3s_linear_infinite]" style={{width:"50%"}}></div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes progress {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(0%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}
