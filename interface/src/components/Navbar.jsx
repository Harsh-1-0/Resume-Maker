import React from "react";

const NavButton = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 rounded-md text-sm font-medium ${active ? "bg-white/6 text-white shadow-lg" : "text-slate-300 hover:text-white/90"}`}
  >
    {label}
  </button>
);

export default function Navbar({ current, onNav }) {
  return (
    <header className="w-full border-b border-white/6">
      <div className="container mx-auto flex items-center justify-between py-6">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-slate-800 to-slate-700 p-2 rounded-md shadow-inner">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none"><rect x="2" y="2" width="20" height="20" rx="4" fill="#2fb6ff" opacity="0.95"/><path d="M7 12h10" stroke="#062230" strokeWidth="1.5" strokeLinecap="round"/></svg>
          </div>
          <div>
            <div className="text-xl font-semibold" style={{fontFamily:"Poppins, Inter"}}>ResumeNexus</div>
            <div className="text-sm text-slate-400">ATS optimizer • Skill gap • Job search</div>
          </div>
        </div>

        <nav className="flex items-center gap-3">
          <NavButton label="Home" active={current==="home"} onClick={()=>onNav("home")} />
          <NavButton label="Skill Gap" active={current==="skillgap"} onClick={()=>onNav("skillgap")} />
          <NavButton label="Job Search" active={current==="jobsearch"} onClick={()=>onNav("jobsearch")} />
          <NavButton label="Resume" active={current==="resume"} onClick={()=>onNav("resume")} />
        </nav>
      </div>
    </header>
  );
}
