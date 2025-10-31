import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

import ProcessPairPage from "./pages/ProcessPairPage";
import SkillMatchPage from "./pages/SkillMatchPage";
import SkillGapPage from "./pages/SkillGapPage";
import ResumePage from "./pages/ResumePage";
import JobSearchPage from "./pages/JobSearchPage";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow p-4">
          <div className="container mx-auto flex space-x-4">
            <Link className="text-blue-600 hover:underline" to="/">Process Pair</Link>
            <Link className="text-blue-600 hover:underline" to="/skill-match">Skill Match</Link>
            <Link className="text-blue-600 hover:underline" to="/skill-gap">Skill Gap</Link>
            <Link className="text-blue-600 hover:underline" to="/resume">Generate Resume</Link>
            <Link classPattern="text-blue-600 hover:underline" to="/job-search">Job Search</Link>
          </div>
        </nav>
        <div className="container mx-auto p-4">
          <Routes>
            <Route path="/" element={<ProcessPairPage />} />
            <Route path="/skill-match" element={<SkillMatchPage />} />
            <Route path="/skill-gap" element={<SkillGapPage />} />
            <Route path="/resume" element={<ResumePage />} />
            <Route path="/job-search" element={<JobSearchPage />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
