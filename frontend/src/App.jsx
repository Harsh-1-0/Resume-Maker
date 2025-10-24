import React, { useState, useRef } from 'react'


const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/process_pair/'


function Badge({ children }) {
return <span className="px-2 py-1 rounded bg-white/10 text-sm">{children}</span>
}


export default function App() {
// resume inputs
const [resumeMode, setResumeMode] = useState('text') // 'text'|'file'|'url'
const [resumeText, setResumeText] = useState('')
const [resumeUrl, setResumeUrl] = useState('')
const [resumeFile, setResumeFile] = useState(null)
const [resumeSkip, setResumeSkip] = useState(false)


// jd inputs
const [jdMode, setJdMode] = useState('text')
const [jdText, setJdText] = useState('')
const [jdUrl, setJdUrl] = useState('')
const [jdFile, setJdFile] = useState(null)
const [jdSkip, setJdSkip] = useState(false)


const [loading, setLoading] = useState(false)
const [responseJson, setResponseJson] = useState(null)
const [error, setError] = useState(null)


const fileInputResumeRef = useRef(null)
const fileInputJdRef = useRef(null)


function humanify(v) {
if (!v) return ''
if (typeof v === 'string') return v
try { return JSON.stringify(v, null, 2) } catch(e){return String(v)}
}


async function submitPair(e) {
e.preventDefault()
setLoading(true)
setResponseJson(null)
setError(null)


const form = new FormData()


// resume
if (resumeMode === 'file') {
if (!resumeFile) { setError('Attach resume file'); setLoading(false); return }
form.append('resume_input_type', 'pdf')
form.append('resume_file', resumeFile)
} else if (resumeMode === 'url') {
form.append('resume_input_type', 'url')
form.append('resume_url', resumeUrl)
if (resumeSkip) form.append('resume_skip_fetch', 'true')
} else {
form.append('resume_input_type', 'text')
form.append('resume_text', resumeText)
}

// jd
if (jdMode === 'file') {
if (!jdFile) { setError('Attach JD file'); setLoading(false); return }
form.append('jd_input_type', 'pdf')
form.append('jd_file', jdFile)
} else if (jdMode === 'url') {
form.append('jd_input_type', 'url')
form.append('jd_url', jdUrl)
if (jdSkip) form.append('jd_skip_fetch', 'true')
} else {
form.append('jd_input_type', 'text')
form.append('jd_text', jdText)
}


try {
const res = await fetch(API_URL, {
method: 'POST',
body: form,
})
const data = await res.json()
if (!res.ok) {
setError(data.error || JSON.stringify(data))
} else {
setResponseJson(data)
}
} catch (err) {
setError(String(err))
} finally {
setLoading(false)
}
}
return (
<div className="min-h-screen flex items-start justify-center p-6">
<div className="max-w-5xl w-full bg-gradient-to-b from-slate-800/60 to-slate-900/60 border border-white/5 rounded-2xl p-6 shadow-2xl">
<header className="flex items-center justify-between mb-6">
<div>
<h1 className="text-2xl font-semibold text-white">Resume Maker — Test UI</h1>
<p className="text-sm text-slate-300">Upload Resume + Job Description and get structured JSON outputs.</p>
</div>
<div className="text-right">
<Badge>FastAPI</Badge>
</div>
</header>


<form onSubmit={submitPair} className="grid gap-6 md:grid-cols-2">
{/* Resume card */}
<section className="bg-white/5 p-4 rounded-lg">
<h2 className="text-lg text-white mb-2">Resume</h2>
<div className="flex gap-2 mb-3">
<button type="button" onClick={()=>setResumeMode('text')} className={`px-3 py-1 rounded ${resumeMode==='text'?'bg-indigo-500 text-white':'bg-white/5 text-white'}`}>Text</button>
<button type="button" onClick={()=>setResumeMode('file')} className={`px-3 py-1 rounded ${resumeMode==='file'?'bg-indigo-500 text-white':'bg-white/5 text-white'}`}>File (PDF)</button>
<button type="button" onClick={()=>setResumeMode('url')} className={`px-3 py-1 rounded ${resumeMode==='url'?'bg-indigo-500 text-white':'bg-white/5 text-white'}`}>URL</button>
</div>


{resumeMode==='text' && (
<textarea value={resumeText} onChange={e=>setResumeText(e.target.value)} placeholder="Paste resume text here" className="w-full min-h-[160px] bg-transparent border border-white/10 p-3 rounded text-white" />
)}


{resumeMode==='file' && (
<div>
<input ref={fileInputResumeRef} type="file" accept=".pdf" onChange={e=>setResumeFile(e.target.files?.[0]||null)} className="text-sm text-white/60" />
{resumeFile && <div className="mt-2 text-sm text-slate-300">Selected: {resumeFile.name}</div>}
</div>
)}


{resumeMode==='url' && (
<div>
<input value={resumeUrl} onChange={e=>setResumeUrl(e.target.value)} placeholder="https://..." className="w-full bg-transparent border border-white/10 p-2 rounded text-white" />
<label className="flex items-center gap-2 mt-2 text-sm text-slate-300"><input type="checkbox" checked={resumeSkip} onChange={e=>setResumeSkip(e.target.checked)} /> Skip fetch (use server's own fetch)</label>
</div>
)}
</section>
{/* JD card */}
<section className="bg-white/5 p-4 rounded-lg">
<h2 className="text-lg text-white mb-2">Job Description (JD)</h2>
<div className="flex gap-2 mb-3">
<button type="button" onClick={()=>setJdMode('text')} className={`px-3 py-1 rounded ${jdMode==='text'?'bg-rose-500 text-white':'bg-white/5 text-white'}`}>Text</button>
<button type="button" onClick={()=>setJdMode('file')} className={`px-3 py-1 rounded ${jdMode==='file'?'bg-rose-500 text-white':'bg-white/5 text-white'}`}>File (PDF)</button>
<button type="button" onClick={()=>setJdMode('url')} className={`px-3 py-1 rounded ${jdMode==='url'?'bg-rose-500 text-white':'bg-white/5 text-white'}`}>URL</button>
</div>


{jdMode==='text' && (
<textarea value={jdText} onChange={e=>setJdText(e.target.value)} placeholder="Paste JD text here" className="w-full min-h-[160px] bg-transparent border border-white/10 p-3 rounded text-white" />
)}


{jdMode==='file' && (
<div>
<input ref={fileInputJdRef} type="file" accept=".pdf" onChange={e=>setJdFile(e.target.files?.[0]||null)} className="text-sm text-white/60" />
{jdFile && <div className="mt-2 text-sm text-slate-300">Selected: {jdFile.name}</div>}
</div>
)}


{jdMode==='url' && (
<div>
<input value={jdUrl} onChange={e=>setJdUrl(e.target.value)} placeholder="https://..." className="w-full bg-transparent border border-white/10 p-2 rounded text-white" />
<label className="flex items-center gap-2 mt-2 text-sm text-slate-300"><input type="checkbox" checked={jdSkip} onChange={e=>setJdSkip(e.target.checked)} /> Skip fetch (use server's own fetch)</label>
</div>
)}
</section>
{/* Submit & meta */}
<div className="md:col-span-2 flex gap-4 items-center justify-between">
<div className="flex items-center gap-3">
<button type="submit" disabled={loading} className="px-4 py-2 bg-green-500 rounded text-white font-medium shadow">{loading? 'Processing...' : 'Submit'}</button>
<button type="button" onClick={()=>{ setResponseJson(null); setError(null); }} className="px-3 py-2 bg-white/5 rounded text-white">Clear</button>
</div>


<div className="text-sm text-slate-300">API: <code className="bg-white/5 px-2 py-1 rounded">{API_URL}</code></div>
</div>


{/* response area */}
<div className="md:col-span-2 grid grid-cols-2 gap-4">
<div className="bg-white/5 p-3 rounded min-h-[180px]">
<h3 className="text-sm text-white mb-2">Response</h3>
{error && <pre className="text-red-400 whitespace-pre-wrap">{error}</pre>}
{responseJson && <pre className="text-slate-200 whitespace-pre-wrap">{humanify(responseJson)}</pre>}
{!responseJson && !error && <div className="text-slate-400">No response yet.</div>}
</div>


<div className="bg-white/5 p-3 rounded min-h-[180px]">
<h3 className="text-sm text-white mb-2">Preview</h3>
<div className="text-slate-300 text-sm">
<strong>Resume:</strong>
<div className="mt-2 text-xs max-h-[120px] overflow-auto">{resumeMode==='file'? (resumeFile?.name || 'No file') : resumeMode==='url' ? resumeUrl : (resumeText || 'No text')}</div>
<hr className="my-2 border-white/5" />
<strong>JD:</strong>
<div className="mt-2 text-xs max-h-[120px] overflow-auto">{jdMode==='file'? (jdFile?.name || 'No file') : jdMode==='url' ? jdUrl : (jdText || 'No text')}</div>
</div>
</div>
</div>


</form>


<footer className="mt-6 text-sm text-slate-400">Tip: For testing URLs, use a reachable page (e.g., <code className="bg-white/5 px-1 rounded">https://www.python.org/</code>) or host a local file with <code className="bg-white/5 px-1 rounded">python -m http.server</code>.</footer>
</div>
</div>
)
}