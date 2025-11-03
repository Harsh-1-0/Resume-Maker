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


// import React, { useState } from "react";
// import Home from "./components/Home2";
// import ResumeDownload from "./components/ResumeDownload";
// import SkillGap from "./components/SkillGap";
// import JobSearch from "./components/JobSearch";

// export default function App() {
//   const [page, setPage] = useState("home");

//   const NavButton = ({ name, label }) => (
//     <button
//       onClick={() => setPage(name)}
//       className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${
//         page === name
//           ? "bg-blue-600 text-white shadow-sm"
//           : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
//       }`}
//     >
//       {label}
//     </button>
//   );

//   return (
//     <div className="min-h-screen bg-[#f8f9fa] text-gray-900 font-sans">
//       <header className="w-full bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
//         <div className="max-w-6xl mx-auto flex items-center justify-between p-4">
//           <div className="text-xl font-semibold tracking-tight text-gray-800">
//             Resume<span className="text-blue-600">MAKER</span>
//           </div>
//           <nav className="flex items-center gap-2">
//             <NavButton name="home" label="Home" />
//             <NavButton name="skillgap" label="Skill Gap" />
//             <NavButton name="jobsearch" label="Job Search" />
//             <NavButton name="resume" label="Resume" />
//           </nav>
//         </div>
//       </header>

//       <main className="max-w-6xl mx-auto px-4 py-10">
//         {page === "home" && <Home onNavigate={setPage} />}
//         {page === "resume" && <ResumeDownload onBack={() => setPage("home")} />}
//         {page === "skillgap" && <SkillGap onBack={() => setPage("home")} />}
//         {page === "jobsearch" && <JobSearch onBack={() => setPage("home")} />}
//       </main>

//       <footer className="mt-10 text-center text-sm text-gray-500 py-6 border-t border-gray-200">
       
//       </footer>
//     </div>
//   );
// }




import React, { useState } from "react";
import Home from "./components/Home2";
import ResumeDownload from "./components/ResumeDownload";
import SkillGap from "./components/SkillGap";
import JobSearch from "./components/JobSearch";

export default function App() {
  const [page, setPage] = useState("home");

  const NavButton = ({ name, label }) => (
    <button
      onClick={() => setPage(name)}
      className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${
        page === name
          ? "bg-white/8 text-white shadow"
          : "text-white/60 hover:text-white hover:bg-white/4"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="min-h-screen">
      <header className="py-6 border-b border-white/6">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* <div style={{ width: 42, height: 42, borderRadius: 10, background: "linear-gradient(135deg,#7c3aed,#3b82f6)" }} /> */}
            <div>
              <div className="heading text-xl  ">Resu<span style={{color:"#2fb6ff"}}>Mate</span></div>
              <div className="kicker">Elegant • ATS optimizer • Skill gap & Job search</div>
            </div>
          </div>

          <nav className="flex items-center gap-3">
            <NavButton name="home" label="Home" />
            <NavButton name="skillgap" label="Skill Gap" />
            <NavButton name="jobsearch" label="Job Search" />
            <NavButton name="resume" label="Resume" />
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10">
        {page === "home" && <Home onNavigate={setPage} />}
        {page === "skillgap" && <SkillGap onBack={() => setPage("home")} />}
        {page === "jobsearch" && <JobSearch onBack={() => setPage("home")} />}
        {page === "resume" && <ResumeDownload onBack={() => setPage("home")} />}
      </main>

      <footer className="mt-12 text-center text-sm text-white/60 py-8">
       
      </footer>
    </div>
  );
}
