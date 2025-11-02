// // import { useState } from 'react'
// // import reactLogo from './assets/react.svg'
// // import viteLogo from '/vite.svg'
// // import './App.css'
// // import Home from './components/home.jsx'
// // import SnakeLoader from './components/snakeLoader.jsx'
// // import ResumeDownload from './components/resume_download.jsx'
// // import SkillMatchOutput from './components/SkillMatchOutput.jsx'
// // import SkillGapOutput from './components/SkillGapOutput.jsx'
// // function App() {

// //   return (
// //     <>
// //       {/* <Home /> */}
// //       {/* <SnakeLoader /> */}
// //       {/* <ResumeDownload /> */}
// //       <SkillGapOutput />

// //     </>
// //   )
// // }

// // export default App



// import React, { useState } from "react";
// import Home from "./components/home.jsx";
// import ResumeDownload from "./components/resume_download.jsx";
// import SkillGapPage from "./components/SkillGapPage.jsx";
// import JobSearchPage from "./components/JobSearchPage.jsx";

// export default function App() {
//   const [page, setPage] = useState("home"); // 'home'|'download'|'skill_gap'|'job_search'

//   const NavButton = ({ id, label }) => (
//     <button
//       onClick={() => setPage(id)}
//       className={`px-3 py-1 rounded-md text-sm font-medium ${
//         page === id ? "bg-blue-600 text-white" : "bg-transparent text-gray-700 hover:bg-gray-100"
//       }`}
//     >
//       {label}
//     </button>
//   );

//   return (
//     <div className="min-h-screen bg-slate-50 p-6">
//       <header className="mb-6 flex items-center justify-between">
//         <div>
//           <h1 className="text-2xl font-semibold">Resume Maker — UI</h1>
//           <p className="text-sm text-gray-600">Frontend test UI — localStorage + backend flow</p>
//         </div>
//         <nav className="flex gap-2">
//           <NavButton id="home" label="Home" />
//           <NavButton id="download" label="Resume (Download)" />
//           <NavButton id="skill_gap" label="Skill Gap" />
//           <NavButton id="job_search" label="Job Search" />
//         </nav>
//       </header>

//       <main>
//         {page === "home" && <Home />}
//         {page === "download" && <ResumeDownload />}
//         {page === "skill_gap" && <SkillGapPage backendBase="http://127.0.0.1:8000" />}
//         {page === "job_search" && <JobSearchPage backendBase="http://127.0.0.1:8000" />}
//       </main>
//     </div>
//   );
// }


import React, { useState } from "react";
import Home from "./components/Home2";
import ResumeDownload from "./components/ResumeDownload";
import SkillGap from "./components/SkillGap";
import JobSearch from "./components/JobSearch";

export default function App() {
  // simple internal routing (no react-router)
  const [page, setPage] = useState("home"); // 'home' | 'resume' | 'skillgap' | 'jobsearch'

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* top-nav */}
      <header className="w-full p-4 flex items-center justify-between border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="text-2xl font-bold text-[#39ff14]">Resume Maker</div>
          <div className="text-sm text-gray-400">Improve · Match · Apply</div>
        </div>
        <nav className="flex items-center gap-3">
          <button
            onClick={() => setPage("home")}
            className={`px-3 py-1 rounded ${page === "home" ? "bg-white/10" : "hover:bg-white/5"}`}
          >
            Home
          </button>
          <button
            onClick={() => setPage("skillgap")}
            className={`px-3 py-1 rounded ${page === "skillgap" ? "bg-white/10" : "hover:bg-white/5"}`}
          >
            Skill Gap
          </button>
          <button
            onClick={() => setPage("jobsearch")}
            className={`px-3 py-1 rounded ${page === "jobsearch" ? "bg-white/10" : "hover:bg-white/5"}`}
          >
            Job Search
          </button>
          <button
            onClick={() => setPage("resume")}
            className={`px-3 py-1 rounded ${page === "resume" ? "bg-white/10" : "hover:bg-white/5"}`}
          >
            Resume
          </button>
        </nav>
      </header>

      <main className="p-6">
        {page === "home" && <Home onNavigate={setPage} />}
        {page === "resume" && <ResumeDownload onBack={() => setPage("home")} />}
        {page === "skillgap" && <SkillGap onBack={() => setPage("home")} />}
        {page === "jobsearch" && <JobSearch onBack={() => setPage("home")} />}
      </main>
    </div>
  );
}
