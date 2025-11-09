# 🧠 ResuMate — AI-Powered Resume Optimization & Career Assistant  

> **ResuMate** is an intelligent, multi-agent career assistant that automates the resume optimization process using **AI-driven analysis** and **real-time recommendations**.  
> It parses resumes, analyzes job descriptions, identifies skill gaps, generates ATS-optimized resumes, and recommends relevant job listings — all in one seamless platform.

---

## 🚀 Key Features

- 🤖 **AI Resume Optimization:** Automatically rewrites resumes to improve ATS scores using contextual keyword matching.  
- 🧩 **Skill Gap Analysis:** Identifies missing technical and soft skills between a resume and target job description.  
- 💼 **Job Recommendations:** Suggests relevant openings by analyzing real-world job listings and skill overlap.  
- 📄 **ATS-Friendly Resume Generator:** Creates visually clean and professionally structured resumes using LaTeX templates.  
- 🧠 **Autonomous Multi-Agent System:** Modular architecture with specialized agents for parsing, optimization, and recommendations.  
- 🌐 **Modern Interface:** Intuitive React.js frontend with smooth animations, progress tracking, and clean data visualization.

---

## 🧱 Tech Stack

| Layer | Technologies |
|-------|---------------|
| **Frontend** | React.js, Tailwind CSS, Framer Motion |
| **Backend** | Python, FastAPI, Uvicorn |
| **AI/ML** | LLaMA3 (via Ollama), NLP for Resume & JD Analysis |
| **Data Handling** | Pandas, JSON, LaTeX |
| **Storage & Hosting** | AWS S3, Local FS |
| **Build Tools** | Node.js, npm |

---


## 🧩 Setup & Installation

### Clone the Repository  
```bash
git clone https://github.com/<your-username>/ResuMate.git
cd ResuMate
```

### Install dependencies and start the FastAPI server:
```bash
pip install -r requirements.txt
uvicorn routes:app --reload
```
Backend runs on:
👉 http://127.0.0.1:8000

### Frontend Setup

Navigate to the React interface and start the dev server:
```bash
cd interface
npm install
npm run dev
```
Frontend runs on:
👉 http://localhost:5173


