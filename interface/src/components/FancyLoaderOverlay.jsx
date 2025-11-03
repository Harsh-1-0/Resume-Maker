import React from "react";
import { motion } from "framer-motion";

/* Futuristic loader overlay. Use when heavy background work is happening.
   Appears full-screen within main container.
*/

export default function FancyLoaderOverlay({ message = "Working..." }){
  const dots = [0,1,2,3];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
      <div className="relative max-w-3xl mx-auto p-8 glass border-white/5">
        <div className="flex items-center gap-6">
          <div className="w-40 h-40 flex items-center justify-center">
            <svg viewBox="0 0 220 220" className="w-40 h-40">
              <defs>
                <linearGradient id="g" x1="0" x2="1">
                  <stop offset="0" stopColor="#7F6BFF"/>
                  <stop offset="1" stopColor="#00FFD6"/>
                </linearGradient>
              </defs>
              <g transform="translate(110,110)">
                <motion.circle r="55" stroke="url(#g)" strokeWidth="2" fill="none" strokeLinecap="round"
                  initial={{rotate:0}} animate={{rotate:360}} transition={{repeat: Infinity, duration: 10, ease: "linear"}} />
                {[0,1,2].map((i)=>(
                  <motion.circle key={i} r="6" fill={i===0?"#7F6BFF":"#00FFD6"} animate={{cx: [ -70, 70, -70 ], cy: [ -10, 10, -10 ]}} transition={{ repeat: Infinity, duration: 2.6 + i*0.3, delay: i*0.15 }} />
                ))}
              </g>
            </svg>
          </div>

          <div className="flex-1">
            <div className="text-lg font-semibold mb-1">Optimizing & assembling your ATS-ready resume</div>
            <div className="text-sm text-slate-300 mb-4">{message}</div>

            <div className="flex items-center gap-2">
              <div className="w-full bg-white/6 rounded-full h-2 overflow-hidden">
                <motion.div className="h-2 bg-gradient-to-r from-[#7F6BFF] to-[#00FFD6]" initial={{width:"6%"}} animate={{width:["6%","40%","76%","98%"]}} transition={{repeat: Infinity, duration: 6}} />
              </div>
              <div className="text-xs text-slate-300">This may take 1-2 minutes</div>
            </div>

            <div className="text-xs text-slate-400 mt-3">Tip: Stay on the page until generation finishes. We'll automatically show download & next steps when ready.</div>
          </div>
        </div>
      </div>
    </div>
  )
}
