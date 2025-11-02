import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Home from './components/home.jsx'
import SnakeLoader from './components/snakeLoader.jsx'
import ResumeDownload from './components/resume_download.jsx'
function App() {

  return (
    <>
      {/* <Home /> */}
      {/* <SnakeLoader /> */}
      <ResumeDownload />
    </>
  )
}

export default App
