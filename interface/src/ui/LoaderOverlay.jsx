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
          <div className="relative w-44 h-44 flex items-center justify-center">
            {/* Outer rotating ring */}
            <div className="absolute w-full h-full rounded-full bg-gradient-to-r from-cyan-300 via-blue-500 to-cyan-300 animate-spin-slow opacity-80" 
                 style={{ clipPath: 'inset(2px round 50%)', filter: 'blur(1px)' }} />
            
            {/* Main circle with dynamic gradient */}
            <div className="absolute w-40 h-40 rounded-full bg-gradient-to-br from-sky-400 via-blue-500 to-cyan-400 animate-pulse-slow flex items-center justify-center shadow-[0_0_30px_rgba(56,189,248,0.3)]">
              {/* Inner spinning gradient ring */}
              <div className="absolute w-32 h-32 rounded-full border-2 border-transparent animate-reverse-spin"
                   style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2)) padding-box, linear-gradient(90deg, cyan, transparent) border-box' }} />
              
              {/* Center glowing orb */}
              <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-blue-400 to-cyan-300 animate-glow relative">
                <div className="absolute inset-1 rounded-full bg-gradient-to-br from-transparent to-white/20 animate-pulse" />
              </div>
            </div>
            
            {/* Orbital particles */}
            <div className="absolute w-full h-full animate-reverse-spin-slow">
              <div className="absolute w-2 h-2 rounded-full bg-cyan-300 blur-[1px] top-0 left-1/2 animate-pulse-fast" />
              <div className="absolute w-2 h-2 rounded-full bg-blue-400 blur-[1px] bottom-0 left-1/2 animate-pulse-fast delay-150" />
              <div className="absolute w-2 h-2 rounded-full bg-sky-300 blur-[1px] left-0 top-1/2 animate-pulse-fast delay-300" />
              <div className="absolute w-2 h-2 rounded-full bg-cyan-400 blur-[1px] right-0 top-1/2 animate-pulse-fast delay-500" />
            </div>
            
            {/* Ambient glow effect */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-500/20 via-blue-500/10 to-sky-500/20 blur-xl animate-pulse-slow" />
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
        
        .animate-spin-slow {
          animation: spin 12s linear infinite;
        }
        
        .animate-reverse-spin {
          animation: spin 8s linear infinite reverse;
        }
        
        .animate-reverse-spin-slow {
          animation: spin 15s linear infinite reverse;
        }
        
        .animate-pulse-slow {
          animation: pulse-slow 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        
        .animate-pulse-fast {
          animation: pulse-fast 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        
        .animate-glow {
          animation: glow 4s ease-in-out infinite alternate;
        }
        
        @keyframes pulse-slow {
          0%, 100% {
            opacity: 1;
            transform: scale(1.05);
          }
          50% {
            opacity: .7;
            transform: scale(0.98);
          }
        }
        
        @keyframes pulse-fast {
          0%, 100% {
            opacity: 1;
            transform: scale(1.2);
          }
          50% {
            opacity: .5;
            transform: scale(0.8);
          }
        }
        
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
        
        @keyframes glow {
          0% {
            box-shadow: 0 0 20px rgba(56,189,248,0.3),
                        inset 0 0 10px rgba(56,189,248,0.3);
          }
          100% {
            box-shadow: 0 0 35px rgba(56,189,248,0.5),
                        inset 0 0 20px rgba(56,189,248,0.5);
          }
        }
        
        .delay-150 {
          animation-delay: 150ms;
        }
        
        .delay-300 {
          animation-delay: 300ms;
        }
        
        .delay-500 {
          animation-delay: 500ms;
        }
      `}</style>
    </div>
  );
}
