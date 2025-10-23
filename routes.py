# from jd_agent.agents.jd_extractor import jd_extractor
# from jd_agent.agents.jd_skill_extractor import extract_skills_llm

# from fastapi import FastAPI, UploadFile, File, Form
# from fastapi.responses import JSONResponse
# from fastapi.middleware.cors import CORSMiddleware
# import os
# import shutil

# app = FastAPI(title="Resume Maker API")

# # Allow local dev access
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# UPLOAD_DIR = "uploads"
# os.makedirs(UPLOAD_DIR, exist_ok=True)

# @app.post("/upload/")
# async def upload_jd(
#     input_type: str = Form(...),  # "pdf" | "text" | "url"
#     file: UploadFile = File(None),
#     text: str = Form(None),
#     url: str = Form(None)
# ):
#     """
#     Upload JD as PDF/Text/URL and get extracted skills.
#     """

#     try:
#         if input_type == "pdf":
#             if not file:
#                 return JSONResponse(status_code=400, content={"error": "PDF file missing"})
            
#             file_path = os.path.join(UPLOAD_DIR, file.filename)
#             with open(file_path, "wb") as buffer:
#                 shutil.copyfileobj(file.file, buffer)

#             jd_text = jd_extractor(file_path, input_type="pdf")

#         elif input_type == "url":
#             if not url:
#                 return JSONResponse(status_code=400, content={"error": "URL missing"})
#             jd_text = jd_extractor(url, input_type="url")

#         elif input_type == "text":
#             if not text:
#                 return JSONResponse(status_code=400, content={"error": "Text missing"})
#             jd_text = jd_extractor(text, input_type="text")

#         else:
#             return JSONResponse(status_code=400, content={"error": "Invalid input type"})

#         # Extract skills using LLM
#         skills_output = extract_skills_llm(jd_text)

#         return JSONResponse(content={"status": "success", "skills": skills_output})

#     except Exception as e:
#         return JSONResponse(status_code=500, content={"error": str(e)})


# @app.get("/")
# def root():
#     return {"message": "Resume Maker API is running!"}











# routes.py (extended)
from jd_agent.agents.jd_extractor import jd_extractor
from jd_agent.agents.jd_skill_extractor import extract_skills_llm

from fastapi import FastAPI, UploadFile, File, Form
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import os
import shutil
import re

app = FastAPI(title="Resume Maker API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


def save_upload_file(upload_file: UploadFile, dest_folder=UPLOAD_DIR) -> str:
    """Save UploadFile to disk and return path."""
    path = os.path.join(dest_folder, upload_file.filename)
    with open(path, "wb") as buffer:
        shutil.copyfileobj(upload_file.file, buffer)
    return path


def parse_resume_text(text: str) -> dict:
    """
    Simple heuristic resume parser. Returns structured JSON with:
    - name (heuristic: first non-empty line with >1 word)
    - emails, phones, skills (top keywords), education blocks, experience blocks
    This is intentionally simple — replace with your resumeparser if available.
    """
    out = {"name": None, "emails": [], "phones": [], "skills": [], "education": [], "experience": [], "raw_text": text[:2000]}

    # emails
    out["emails"] = list(set(re.findall(r"[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+", text)))

    # phones (very permissive)
    phones = re.findall(r"(?:(?:\+?\d{1,3}[\s\-])?(?:\d{10})|(?:\d{3}[\s\-]\d{3}[\s\-]\d{4}))", text)
    out["phones"] = list(set(phones))

    # name: take first line with letters and at least one space and short (<40 chars)
    lines = [l.strip() for l in text.splitlines() if l.strip()]
    if lines:
        for l in lines[:6]:  # look in top 6 lines
            # avoid lines containing email or phone or 'resume'
            if re.search(r"@", l) or re.search(r"\d", l) or re.search(r"resume", l, re.I):
                continue
            if len(l.split()) <= 5 and len(l) < 45:
                out["name"] = l
                break

    # sections: naive split by common section headings
    sections = re.split(r"\n(?=[A-Z][A-Za-z ]{2,30}:?)", text)  # rough
    # attempts to find education/experience/skills blocks using keywords
    lowered = text.lower()
    # skills: look for "skills" section
    skills_match = re.search(r"(skills|technical skills|technical competencies|expertise)\s*[:\-\n]+(.{1,400})", lowered, re.I | re.S)
    if skills_match:
        skills_blob = skills_match.group(2)
        # split by commas/linebreaks
        candidates = re.split(r"[,;\n•\u2022]+", skills_blob)
        # keep short tokens
        skills = [s.strip() for s in candidates if 1 < len(s.strip()) < 40]
        out["skills"] = list(dict.fromkeys(skills))[:40]  # dedupe & limit

    # education: capture paragraphs with 'university' 'bachelor' 'master' 'degree'
    edu_blocks = re.findall(r"([^\n]{0,120}\b(?:university|institute|bachelor|master|b\.tech|btech|degree|msc|ba|bs|phd)\b[^\n]{0,120})", lowered, re.I)
    out["education"] = list(dict.fromkeys([e.strip() for e in edu_blocks]))[:10]

    # experience: capture lines mentioning 'experience' or 'worked as' or year ranges
    exp_blocks = re.findall(r"((?:\d{4}[\-\u2013]\d{4}|\d{4})[^.\n]{0,140})", text)
    # filter plausible descriptions
    exps = [e.strip() for e in exp_blocks if len(e.strip()) > 10]
    out["experience"] = list(dict.fromkeys(exps))[:10]

    return out


def autodetect_input(file: UploadFile, text: str, url: str) -> str:
    """Return 'pdf' | 'text' | 'url' based on what was provided."""
    if file:
        # assume uploaded file: if filename endswith .pdf -> pdf else text
        filename = getattr(file, "filename", "") or ""
        if filename.lower().endswith(".pdf"):
            return "pdf"
        return "text"
    if url:
        return "url"
    if text:
        return "text"
    return None


@app.post("/process_pair/")
async def process_pair(
    # resume inputs
    resume_input_type: str = Form(None),
    resume_file: UploadFile = File(None),
    resume_text: str = Form(None),
    resume_url: str = Form(None),
    # jd inputs
    jd_input_type: str = Form(None),
    jd_file: UploadFile = File(None),
    jd_text: str = Form(None),
    jd_url: str = Form(None),
):
    """
    Accept both resume and jd in one request (each can be pdf/text/url).
    Returns:
    {
      "resume_json": { ... },
      "jd_json": { ... }
    }
    """
    try:
        # --- RESUME TEXT extraction ---
        r_input_type = resume_input_type or autodetect_input(resume_file, resume_text, resume_url)
        if not r_input_type:
            return JSONResponse(status_code=400, content={"error": "No resume input provided"})

        if r_input_type == "pdf":
            if not resume_file:
                return JSONResponse(status_code=400, content={"error": "Resume PDF missing"})
            resume_path = save_upload_file(resume_file)
            resume_raw = jd_extractor(resume_path, input_type="pdf")
        elif r_input_type == "url":
            if not resume_url:
                return JSONResponse(status_code=400, content={"error": "Resume URL missing"})
            resume_raw = jd_extractor(resume_url, input_type="url")
        elif r_input_type == "text":
            if not resume_text:
                return JSONResponse(status_code=400, content={"error": "Resume text missing"})
            resume_raw = jd_extractor(resume_text, input_type="text")
        else:
            return JSONResponse(status_code=400, content={"error": "Invalid resume_input_type"})

        # parse resume to structured json
        resume_json = parse_resume_text(resume_raw)

        # --- JD TEXT extraction ---
        j_input_type = jd_input_type or autodetect_input(jd_file, jd_text, jd_url)
        if not j_input_type:
            return JSONResponse(status_code=400, content={"error": "No JD input provided"})

        if j_input_type == "pdf":
            if not jd_file:
                return JSONResponse(status_code=400, content={"error": "JD PDF missing"})
            jd_path = save_upload_file(jd_file)
            jd_raw = jd_extractor(jd_path, input_type="pdf")
        elif j_input_type == "url":
            if not jd_url:
                return JSONResponse(status_code=400, content={"error": "JD URL missing"})
            jd_raw = jd_extractor(jd_url, input_type="url")
        elif j_input_type == "text":
            if not jd_text:
                return JSONResponse(status_code=400, content={"error": "JD text missing"})
            jd_raw = jd_extractor(jd_text, input_type="text")
        else:
            return JSONResponse(status_code=400, content={"error": "Invalid jd_input_type"})

        # use your LLM skill extractor for JD
        jd_json = extract_skills_llm(jd_raw)

        return JSONResponse(content={"status": "success", "resume_json": resume_json, "jd_json": jd_json})

    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})


#  to run uvicorn routes:app --reload