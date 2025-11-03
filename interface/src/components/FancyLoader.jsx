import React from "react";

export default function FancyLoader({ small=false }) {
  return (
    <div className={`w-full ${small? 'h-36' : 'h-72'} flex items-center justify-center`}>
      <div className="relative flex items-center gap-6">
        {/* central rotating orbit */}
        <svg viewBox="0 0 220 220" width={small?180:320} height={small?100:220}>
          <defs>
            <linearGradient id="g1" x1="0" x2="1"><stop offset="0" stopColor="#7c3aed"/><stop offset="1" stopColor="#06b6d4"/></linearGradient>
          </defs>

          <g transform="translate(110,110)">
            <circle r="64" stroke="url(#g1)" strokeWidth="2" fill="none" strokeOpacity="0.12" />
            <g style={{transformOrigin:'0px 0px', animation:'spin 8s linear infinite'}}>
              <circle r="90" stroke="rgba(255,255,255,0.02)" strokeWidth="34" fill="none" />
            </g>

            {/* orbiting nodes */}
            {[0,60,120,180].map((a,i)=>(
              <g key={i} transform={`rotate(${a}) translate(80)`}>
                <circle r={small?6:8} fill={i%2? "#7c3aed":"#06b6d4"} stroke="rgba(255,255,255,0.06)" strokeWidth="1"/>
              </g>
            ))}

            <text x="-80" y="100" fill="white" fontSize={small?10:14} opacity="0.85">Optimizing • Generating • Polishing</text>
          </g>
        </svg>

        <div className="text-left">
          <div className="text-lg font-semibold" style={{color:'#e6eef8'}}>Hold tight — generating your optimized resume</div>
          <div className="text-sm text-slate-300 mt-2">This can take 1–2 minutes. We’re rewriting your summary and composing a clean ATS-friendly layout.</div>

          <div className="mt-4 w-[320px] h-3 bg-white/6 rounded overflow-hidden">
            <div className="h-full bg-gradient-to-r from-purple-600 via-cyan-400 to-teal-300 animate-[shimmer_1.6s_linear_infinite]" style={{width:'42%'}} />
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }
        @keyframes shimmer { 0% { background-position: -200% 0 } 100% { background-position: 200% 0 } }
      `}</style>
    </div>
  );
}
