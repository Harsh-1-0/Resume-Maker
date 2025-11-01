import React from "react";
import { Routes, Route, Link } from "react-router-dom";
import ProcessPair from "./pages/ProcessPair";
import SkillMatch from "./pages/SkillMatch";
import SkillGap from "./pages/SkillGap";
import ResumePage from "./pages/ResumePage";
import JobSearch from "./pages/JobSearch";

function NavLink({ to, children }) {
  return (
    <Link className="px-3 py-1 hover:bg-slate-800 rounded" to={to}>
      {children}
    </Link>
  );
}

export default function App() {
  return (
    <div className="min-h-screen p-6">
      <header className="max-w-6xl mx-auto mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Resume Maker — UI</h1>
          <p className="text-sm text-slate-300">Process Resume & JD → skill match → gaps → resume/pdf</p>
        </div>
        <nav className="flex gap-2">
          <NavLink to="/">Process Pair</NavLink>
          <NavLink to="/skill-match">Skill Match</NavLink>
          <NavLink to="/skill-gap">Skill Gap</NavLink>
          <NavLink to="/resume">Generate Resume</NavLink>
          <NavLink to="/job-search">Job Search</NavLink>
        </nav>
      </header>

      <main className="max-w-6xl mx-auto">
        <Routes>
          <Route path="/" element={<ProcessPair />} />
          <Route path="/skill-match" element={<SkillMatch />} />
          <Route path="/skill-gap" element={<SkillGap />} />
          <Route path="/resume" element={<ResumePage />} />
          <Route path="/job-search" element={<JobSearch />} />
        </Routes>
      </main>
    </div>
  );
}
