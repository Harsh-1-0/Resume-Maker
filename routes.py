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











# routes.py (extended) Working without URL
# from jd_agent.agents.jd_extractor import jd_extractor
# from jd_agent.agents.jd_skill_extractor import extract_skills_llm

# from fastapi import FastAPI, UploadFile, File, Form
# from fastapi.responses import JSONResponse
# from fastapi.middleware.cors import CORSMiddleware
# import os
# import shutil
# import re

# app = FastAPI(title="Resume Maker API")

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# UPLOAD_DIR = "uploads"
# os.makedirs(UPLOAD_DIR, exist_ok=True)


# def save_upload_file(upload_file: UploadFile, dest_folder=UPLOAD_DIR) -> str:
#     """Save UploadFile to disk and return path."""
#     path = os.path.join(dest_folder, upload_file.filename)
#     with open(path, "wb") as buffer:
#         shutil.copyfileobj(upload_file.file, buffer)
#     return path


# def parse_resume_text(text: str) -> dict:
#     """
#     Simple heuristic resume parser. Returns structured JSON with:
#     - name (heuristic: first non-empty line with >1 word)
#     - emails, phones, skills (top keywords), education blocks, experience blocks
#     This is intentionally simple — replace with your resumeparser if available.
#     """
#     out = {"name": None, "emails": [], "phones": [], "skills": [], "education": [], "experience": [], "raw_text": text[:2000]}

#     # emails
#     out["emails"] = list(set(re.findall(r"[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+", text)))

#     # phones (very permissive)
#     phones = re.findall(r"(?:(?:\+?\d{1,3}[\s\-])?(?:\d{10})|(?:\d{3}[\s\-]\d{3}[\s\-]\d{4}))", text)
#     out["phones"] = list(set(phones))

#     # name: take first line with letters and at least one space and short (<40 chars)
#     lines = [l.strip() for l in text.splitlines() if l.strip()]
#     if lines:
#         for l in lines[:6]:  # look in top 6 lines
#             # avoid lines containing email or phone or 'resume'
#             if re.search(r"@", l) or re.search(r"\d", l) or re.search(r"resume", l, re.I):
#                 continue
#             if len(l.split()) <= 5 and len(l) < 45:
#                 out["name"] = l
#                 break

#     # sections: naive split by common section headings
#     sections = re.split(r"\n(?=[A-Z][A-Za-z ]{2,30}:?)", text)  # rough
#     # attempts to find education/experience/skills blocks using keywords
#     lowered = text.lower()
#     # skills: look for "skills" section
#     skills_match = re.search(r"(skills|technical skills|technical competencies|expertise)\s*[:\-\n]+(.{1,400})", lowered, re.I | re.S)
#     if skills_match:
#         skills_blob = skills_match.group(2)
#         # split by commas/linebreaks
#         candidates = re.split(r"[,;\n•\u2022]+", skills_blob)
#         # keep short tokens
#         skills = [s.strip() for s in candidates if 1 < len(s.strip()) < 40]
#         out["skills"] = list(dict.fromkeys(skills))[:40]  # dedupe & limit

#     # education: capture paragraphs with 'university' 'bachelor' 'master' 'degree'
#     edu_blocks = re.findall(r"([^\n]{0,120}\b(?:university|institute|bachelor|master|b\.tech|btech|degree|msc|ba|bs|phd)\b[^\n]{0,120})", lowered, re.I)
#     out["education"] = list(dict.fromkeys([e.strip() for e in edu_blocks]))[:10]

#     # experience: capture lines mentioning 'experience' or 'worked as' or year ranges
#     exp_blocks = re.findall(r"((?:\d{4}[\-\u2013]\d{4}|\d{4})[^.\n]{0,140})", text)
#     # filter plausible descriptions
#     exps = [e.strip() for e in exp_blocks if len(e.strip()) > 10]
#     out["experience"] = list(dict.fromkeys(exps))[:10]

#     return out


# def autodetect_input(file: UploadFile, text: str, url: str) -> str:
#     """Return 'pdf' | 'text' | 'url' based on what was provided."""
#     if file:
#         # assume uploaded file: if filename endswith .pdf -> pdf else text
#         filename = getattr(file, "filename", "") or ""
#         if filename.lower().endswith(".pdf"):
#             return "pdf"
#         return "text"
#     if url:
#         return "url"
#     if text:
#         return "text"
#     return None


# @app.post("/process_pair/")
# async def process_pair(
#     # resume inputs
#     resume_input_type: str = Form(None),
#     resume_file: UploadFile = File(None),
#     resume_text: str = Form(None),
#     resume_url: str = Form(None),
#     # jd inputs
#     jd_input_type: str = Form(None),
#     jd_file: UploadFile = File(None),
#     jd_text: str = Form(None),
#     jd_url: str = Form(None),
# ):
#     """
#     Accept both resume and jd in one request (each can be pdf/text/url).
#     Returns:
#     {
#       "resume_json": { ... },
#       "jd_json": { ... }
#     }
#     """
#     try:
#         # --- RESUME TEXT extraction ---
#         r_input_type = resume_input_type or autodetect_input(resume_file, resume_text, resume_url)
#         if not r_input_type:
#             return JSONResponse(status_code=400, content={"error": "No resume input provided"})

#         if r_input_type == "pdf":
#             if not resume_file:
#                 return JSONResponse(status_code=400, content={"error": "Resume PDF missing"})
#             resume_path = save_upload_file(resume_file)
#             resume_raw = jd_extractor(resume_path, input_type="pdf")
#         elif r_input_type == "url":
#             if not resume_url:
#                 return JSONResponse(status_code=400, content={"error": "Resume URL missing"})
#             resume_raw = jd_extractor(resume_url, input_type="url")
#         elif r_input_type == "text":
#             if not resume_text:
#                 return JSONResponse(status_code=400, content={"error": "Resume text missing"})
#             resume_raw = jd_extractor(resume_text, input_type="text")
#         else:
#             return JSONResponse(status_code=400, content={"error": "Invalid resume_input_type"})

#         # parse resume to structured json
#         resume_json = parse_resume_text(resume_raw)

#         # --- JD TEXT extraction ---
#         j_input_type = jd_input_type or autodetect_input(jd_file, jd_text, jd_url)
#         if not j_input_type:
#             return JSONResponse(status_code=400, content={"error": "No JD input provided"})

#         if j_input_type == "pdf":
#             if not jd_file:
#                 return JSONResponse(status_code=400, content={"error": "JD PDF missing"})
#             jd_path = save_upload_file(jd_file)
#             jd_raw = jd_extractor(jd_path, input_type="pdf")
#         elif j_input_type == "url":
#             if not jd_url:
#                 return JSONResponse(status_code=400, content={"error": "JD URL missing"})
#             jd_raw = jd_extractor(jd_url, input_type="url")
#         elif j_input_type == "text":
#             if not jd_text:
#                 return JSONResponse(status_code=400, content={"error": "JD text missing"})
#             jd_raw = jd_extractor(jd_text, input_type="text")
#         else:
#             return JSONResponse(status_code=400, content={"error": "Invalid jd_input_type"})

#         # use your LLM skill extractor for JD
#         jd_json = extract_skills_llm(jd_raw)

#         return JSONResponse(content={"status": "success", "resume_json": resume_json, "jd_json": jd_json})

#     except Exception as e:
#         return JSONResponse(status_code=500, content={"error": str(e)})












# routes.py (drop-in replacement)Modified for  URL fetching
# import os
# import shutil
# import re
# from urllib.parse import urlparse

# import requests
# from requests.adapters import HTTPAdapter
# from urllib3.util.retry import Retry
# from bs4 import BeautifulSoup

# from fastapi import FastAPI, UploadFile, File, Form
# from fastapi.responses import JSONResponse
# from fastapi.middleware.cors import CORSMiddleware

# # your project imports (unchanged)
# from jd_agent.agents.jd_extractor import jd_extractor
# from jd_agent.agents.jd_skill_extractor import extract_skills_llm

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


# # ---------- Robust URL fetcher ----------
# _session = requests.Session()
# _retries = Retry(
#     total=3,
#     backoff_factor=0.6,
#     status_forcelist=(429, 500, 502, 503, 504),
#     allowed_methods=frozenset(["HEAD", "GET", "OPTIONS"])
# )
# _session.mount("https://", HTTPAdapter(max_retries=_retries))
# _session.mount("http://", HTTPAdapter(max_retries=_retries))

# DEFAULT_USER_AGENT = "ResumeMakerBot/1.0 (+https://yourdomain.example)"


# def validate_url(url: str) -> bool:
#     try:
#         parts = urlparse(url)
#         return parts.scheme in ("http", "https") and parts.netloc != ""
#     except Exception:
#         return False


# def fetch_url_text(url: str, timeout: int = 10) -> str:
#     """
#     Fetch a URL with retries and return cleaned text.
#     Does a HEAD probe but does NOT abort on HEAD failures; GET is authoritative.
#     """
#     if not validate_url(url):
#         raise ValueError("Invalid URL (must include http:// or https://)")

#     headers = {"User-Agent": DEFAULT_USER_AGENT}

#     # HEAD informational only
#     try:
#         _session.head(url, headers=headers, timeout=5, allow_redirects=True)
#     except requests.RequestException:
#         # ignore HEAD errors
#         pass

#     try:
#         resp = _session.get(url, headers=headers, timeout=timeout, allow_redirects=True)
#         resp.raise_for_status()
#     except requests.Timeout:
#         raise ValueError(f"Read timed out (read timeout={timeout})")
#     except requests.RequestException as e:
#         raise ValueError(f"Network error while fetching URL: {e}")

#     soup = BeautifulSoup(resp.content, "html.parser")
#     for tag in soup(["header", "footer", "nav", "script", "style", "noscript", "svg", "iframe"]):
#         tag.extract()

#     text = soup.get_text(separator="\n", strip=True)
#     text = "\n".join([line.strip() for line in text.splitlines() if line.strip()])
#     if not text:
#         raise ValueError("No textual content found at URL")
#     return text


# # ---------- helpers ----------
# def is_truthy_form(val) -> bool:
#     """
#     Accept common truthy form values:
#       true, True, 1, "1", "yes", "on"
#     """
#     if val is None:
#         return False
#     if isinstance(val, bool):
#         return val
#     s = str(val).strip().lower()
#     return s in ("1", "true", "yes", "on")


# def save_upload_file(upload_file: UploadFile, dest_folder=UPLOAD_DIR) -> str:
#     path = os.path.join(dest_folder, upload_file.filename)
#     with open(path, "wb") as buffer:
#         shutil.copyfileobj(upload_file.file, buffer)
#     return path


# def parse_resume_text(text: str) -> dict:
#     out = {"name": None, "emails": [], "phones": [], "skills": [], "education": [], "experience": [], "raw_text": text[:2000]}
#     out["emails"] = list(set(re.findall(r"[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+", text)))
#     phones = re.findall(r"(?:(?:\+?\d{1,3}[\s\-])?(?:\d{10})|(?:\d{3}[\s\-]\d{3}[\s\-]\d{4}))", text)
#     out["phones"] = list(set(phones))

#     lines = [l.strip() for l in text.splitlines() if l.strip()]
#     if lines:
#         for l in lines[:6]:
#             if re.search(r"@", l) or re.search(r"\d", l) or re.search(r"resume", l, re.I):
#                 continue
#             if len(l.split()) <= 5 and len(l) < 45:
#                 out["name"] = l
#                 break

#     lowered = text.lower()
#     skills_match = re.search(r"(skills|technical skills|technical competencies|expertise)\s*[:\-\n]+(.{1,400})", lowered, re.I | re.S)
#     if skills_match:
#         skills_blob = skills_match.group(2)
#         candidates = re.split(r"[,;\n•\u2022]+", skills_blob)
#         skills = [s.strip() for s in candidates if 1 < len(s.strip()) < 40]
#         out["skills"] = list(dict.fromkeys(skills))[:40]

#     edu_blocks = re.findall(r"([^\n]{0,120}\b(?:university|institute|bachelor|master|b\.tech|btech|degree|msc|ba|bs|phd)\b[^\n]{0,120})", lowered, re.I)
#     out["education"] = list(dict.fromkeys([e.strip() for e in edu_blocks]))[:10]

#     exp_blocks = re.findall(r"((?:\d{4}[\-\u2013]\d{4}|\d{4})[^.\n]{0,140})", text)
#     exps = [e.strip() for e in exp_blocks if len(e.strip()) > 10]
#     out["experience"] = list(dict.fromkeys(exps))[:10]

#     return out


# def autodetect_input(file: UploadFile, text: str, url: str) -> str:
#     if file:
#         filename = getattr(file, "filename", "") or ""
#         if filename.lower().endswith(".pdf"):
#             return "pdf"
#         return "text"
#     if url:
#         return "url"
#     if text:
#         return "text"
#     return None


# # ---------- single JD endpoint (unchanged behavior; optional skip_fetch supported) ----------
# @app.post("/upload/")
# async def upload_jd(
#     input_type: str = Form(...),  # "pdf" | "text" | "url"
#     file: UploadFile = File(None),
#     text: str = Form(None),
#     url: str = Form(None),
#     skip_fetch: str = Form(None),  # optional: truthy to skip fetch_url_text and use original jd_extractor(url, input_type="url")
# ):
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
#             if is_truthy_form(skip_fetch):
#                 # let the old extractor fetch the url itself
#                 try:
#                     jd_text = jd_extractor(url, input_type="url")
#                 except Exception as e:
#                     return JSONResponse(status_code=400, content={"error": f"Network error while fetching URL via jd_extractor: {e}"})
#             else:
#                 try:
#                     fetched = fetch_url_text(url, timeout=12)
#                 except ValueError as ve:
#                     return JSONResponse(status_code=400, content={"error": str(ve)})
#                 jd_text = jd_extractor(fetched, input_type="text")

#         elif input_type == "text":
#             if not text:
#                 return JSONResponse(status_code=400, content={"error": "Text missing"})
#             jd_text = jd_extractor(text, input_type="text")

#         else:
#             return JSONResponse(status_code=400, content={"error": "Invalid input type"})

#         skills_output = extract_skills_llm(jd_text)
#         return JSONResponse(content={"status": "success", "skills": skills_output})

#     except Exception as e:
#         return JSONResponse(status_code=500, content={"error": str(e)})


# # ---------- combined resume + JD (supports skip flags) ----------
# @app.post("/process_pair/")
# async def process_pair(
#     resume_input_type: str = Form(None),
#     resume_file: UploadFile = File(None),
#     resume_text: str = Form(None),
#     resume_url: str = Form(None),
#     resume_skip_fetch: str = Form(None),  # set to "true" or "1" to skip fetch_url_text and call jd_extractor(url)
#     jd_input_type: str = Form(None),
#     jd_file: UploadFile = File(None),
#     jd_text: str = Form(None),
#     jd_url: str = Form(None),
#     jd_skip_fetch: str = Form(None),  # set to "true" or "1" to skip fetch_url_text and call jd_extractor(url)
# ):
#     try:
#         # --- RESUME ---
#         r_input_type = resume_input_type or autodetect_input(resume_file, resume_text, resume_url)
#         if not r_input_type:
#             return JSONResponse(status_code=400, content={"error": "No resume input provided"})

#         if r_input_type == "pdf":
#             if not resume_file:
#                 return JSONResponse(status_code=400, content={"error": "Resume PDF missing"})
#             resume_path = save_upload_file(resume_file)
#             resume_raw = jd_extractor(resume_path, input_type="pdf")

#         elif r_input_type == "url":
#             if not resume_url:
#                 return JSONResponse(status_code=400, content={"error": "Resume URL missing"})
#             if is_truthy_form(resume_skip_fetch):
#                 try:
#                     resume_raw = jd_extractor(resume_url, input_type="url")
#                 except Exception as e:
#                     return JSONResponse(status_code=400, content={"error": f"Network error while fetching resume via jd_extractor: {e}"})
#             else:
#                 try:
#                     fetched = fetch_url_text(resume_url, timeout=12)
#                 except ValueError as ve:
#                     return JSONResponse(status_code=400, content={"error": str(ve)})
#                 resume_raw = jd_extractor(fetched, input_type="text")

#         elif r_input_type == "text":
#             if not resume_text:
#                 return JSONResponse(status_code=400, content={"error": "Resume text missing"})
#             resume_raw = jd_extractor(resume_text, input_type="text")
#         else:
#             return JSONResponse(status_code=400, content={"error": "Invalid resume_input_type"})

#         resume_json = parse_resume_text(resume_raw)

#         # --- JD ---
#         j_input_type = jd_input_type or autodetect_input(jd_file, jd_text, jd_url)
#         if not j_input_type:
#             return JSONResponse(status_code=400, content={"error": "No JD input provided"})

#         if j_input_type == "pdf":
#             if not jd_file:
#                 return JSONResponse(status_code=400, content={"error": "JD PDF missing"})
#             jd_path = save_upload_file(jd_file)
#             jd_raw = jd_extractor(jd_path, input_type="pdf")

#         elif j_input_type == "url":
#             if not jd_url:
#                 return JSONResponse(status_code=400, content={"error": "JD URL missing"})
#             if is_truthy_form(jd_skip_fetch):
#                 try:
#                     jd_raw = jd_extractor(jd_url, input_type="url")
#                 except Exception as e:
#                     return JSONResponse(status_code=400, content={"error": f"Network error while fetching JD via jd_extractor: {e}"})
#             else:
#                 try:
#                     fetched = fetch_url_text(jd_url, timeout=12)
#                 except ValueError as ve:
#                     return JSONResponse(status_code=400, content={"error": str(ve)})
#                 jd_raw = jd_extractor(fetched, input_type="text")

#         elif j_input_type == "text":
#             if not jd_text:
#                 return JSONResponse(status_code=400, content={"error": "JD text missing"})
#             jd_raw = jd_extractor(jd_text, input_type="text")
#         else:
#             return JSONResponse(status_code=400, content={"error": "Invalid jd_input_type"})

#         jd_json = extract_skills_llm(jd_raw)

#         return JSONResponse(content={"status": "success", "resume_json": resume_json, "jd_json": jd_json})

#     except Exception as e:
#         return JSONResponse(status_code=500, content={"error": str(e)})


# @app.get("/")
# def root():
#     return {"message": "Resume Maker API is running!"}












# routes.py
import os
import shutil
import re
import json
from urllib.parse import urlparse

import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry
from bs4 import BeautifulSoup

from fastapi import FastAPI, UploadFile, File, Form
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware

import ollama
from jd_agent.agents.jd_extractor import jd_extractor

app = FastAPI(title="Resume Maker API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# --------- utilities for network + files ----------
_session = requests.Session()
_retries = Retry(
    total=3, backoff_factor=0.6,
    status_forcelist=(429, 500, 502, 503, 504),
    allowed_methods=frozenset(["HEAD", "GET", "OPTIONS"])
)
_session.mount("https://", HTTPAdapter(max_retries=_retries))
_session.mount("http://", HTTPAdapter(max_retries=_retries))

DEFAULT_USER_AGENT = "ResumeMakerBot/1.0 (+https://yourdomain.example)"


def validate_url(url: str) -> bool:
    try:
        p = urlparse(url)
        return p.scheme in ("http", "https") and p.netloc != ""
    except Exception:
        return False


def fetch_url_text(url: str, timeout: int = 12) -> str:
    if not validate_url(url):
        raise ValueError("Invalid URL (must include http:// or https://)")
    headers = {"User-Agent": DEFAULT_USER_AGENT}
    try:
        _session.head(url, headers=headers, timeout=5, allow_redirects=True)
    except requests.RequestException:
        pass
    try:
        resp = _session.get(url, headers=headers, timeout=timeout, allow_redirects=True)
        resp.raise_for_status()
    except requests.Timeout:
        raise ValueError(f"Read timed out (read timeout={timeout})")
    except requests.RequestException as e:
        raise ValueError(f"Network error while fetching URL: {e}")
    soup = BeautifulSoup(resp.content, "html.parser")
    for tag in soup(["header", "footer", "nav", "script", "style", "noscript", "svg", "iframe"]):
        tag.extract()
    text = soup.get_text(separator="\n", strip=True)
    text = "\n".join([ln.strip() for ln in text.splitlines() if ln.strip()])
    if not text:
        raise ValueError("No textual content found at URL")
    return text


def save_upload_file(upload_file: UploadFile, dest_folder=UPLOAD_DIR) -> str:
    path = os.path.join(dest_folder, upload_file.filename)
    with open(path, "wb") as buffer:
        shutil.copyfileobj(upload_file.file, buffer)
    return path


def autodetect_input(file: UploadFile, text: str, url: str) -> str:
    if file:
        fn = getattr(file, "filename", "") or ""
        if fn.lower().endswith(".pdf"):
            return "pdf"
        return "text"
    if url:
        return "url"
    if text:
        return "text"
    return None


def ensure_list(x):
    if x is None:
        return []
    if isinstance(x, list):
        return x
    return [x]


# --------- normalization helpers ----------
def parse_number_from_string(s: str):
    if s is None:
        return None
    m = re.search(r"(\d+\.\d+|\d+)", str(s))
    if not m:
        return None
    val = m.group(1)
    try:
        return float(val) if "." in val else int(val)
    except:
        return None


def normalize_education_item(item):
    if isinstance(item, str):
        return {"institution": item, "degree": None, "cgpa": None, "percentage": None, "start_date": None, "end_date": None}
    out = {
        "institution": item.get("institution") or item.get("school") or item.get("college") or item.get("university") or None,
        "degree": item.get("degree") or item.get("qualification") or item.get("level") or None,
        "cgpa": None,
        "percentage": None,
        "start_date": item.get("start_date") or item.get("from") or None,
        "end_date": item.get("end_date") or item.get("to") or item.get("end") or None
    }
    cgpa = item.get("cgpa") or item.get("CGPA") or item.get("cgpa_score")
    perc = item.get("percentage") or item.get("percent") or item.get("score")
    if cgpa:
        out["cgpa"] = parse_number_from_string(cgpa)
    if perc:
        out["percentage"] = parse_number_from_string(perc)
    if out["degree"] and out["percentage"] is None:
        m = re.search(r"(\d+\.\d+|\d+)\s*%+", str(out["degree"]))
        if m:
            out["percentage"] = parse_number_from_string(m.group(1))
    return out


def map_skills_to_categories(skills_obj):
    categories = {
        "programming_languages": [],
        "web_development": [],
        "databases": [],
        "machine_learning": []
    }
    if isinstance(skills_obj, dict):
        for k, v in skills_obj.items():
            vals = ensure_list(v)
            key = k.lower()
            if "program" in key or "language" in key:
                categories["programming_languages"].extend(vals)
            elif "web" in key or "frontend" in key or "react" in key or "node" in key:
                categories["web_development"].extend(vals)
            elif "db" in key or "data" in key or "sql" in key or "mongo" in key:
                categories["databases"].extend(vals)
            elif "machine" in key or "ml" in key or "tensorflow" in key or "scikit" in key:
                categories["machine_learning"].extend(vals)
            else:
                categories["programming_languages"].extend(vals)
    elif isinstance(skills_obj, list):
        # handle arrays of category dicts or flat lists
        for elem in skills_obj:
            if isinstance(elem, dict):
                name = (elem.get("category") or elem.get("name") or "").lower()
                vals = ensure_list(elem.get("languages") or elem.get("technologies") or elem.get("databases") or elem.get("tools") or elem.get("values") or elem.get("items") or [])
                if "program" in name or "language" in name:
                    categories["programming_languages"].extend(vals)
                elif "web" in name or "react" in name or "node" in name:
                    categories["web_development"].extend(vals)
                elif "db" in name or "sql" in name or "mongo" in name or "database" in name:
                    categories["databases"].extend(vals)
                elif "machine" in name or "ml" in name:
                    categories["machine_learning"].extend(vals)
                else:
                    categories["programming_languages"].extend(vals)
            else:
                categories["programming_languages"].append(elem)
    elif isinstance(skills_obj, str):
        toks = re.split(r"[,;/\n]+", skills_obj)
        categories["programming_languages"].extend([t.strip() for t in toks if t.strip()])

    # dedupe, preserve order
    for k in categories:
        seen = set()
        out = []
        for it in categories[k]:
            if not it:
                continue
            s = str(it).strip()
            if s.lower() not in seen:
                seen.add(s.lower())
                out.append(s)
        categories[k] = out
    return categories


def normalize_to_expected(parsed_json: dict):
    expected = {
        "name": None,
        "contact": {"email": None, "phone": None},
        "education": [],
        "skills": {
            "programming_languages": [],
            "web_development": [],
            "databases": [],
            "machine_learning": []
        },
        "experience": [],
        "projects": [],
        "certifications": []
    }
    if not isinstance(parsed_json, dict):
        return expected

    expected["name"] = parsed_json.get("name") or parsed_json.get("full_name") or parsed_json.get("candidate") or None

    contact = parsed_json.get("contact") if isinstance(parsed_json.get("contact"), dict) else {}
    email = contact.get("email") if contact else None
    phone = contact.get("phone") if contact else None
    if not email:
        e = parsed_json.get("email") or parsed_json.get("emails")
        if isinstance(e, list) and e:
            email = e[0]
        elif isinstance(e, str):
            email = e
    if not phone:
        p = parsed_json.get("phone") or parsed_json.get("phones")
        if isinstance(p, list) and p:
            phone = p[0]
        elif isinstance(p, str):
            phone = p
    expected["contact"]["email"] = email
    expected["contact"]["phone"] = phone

    edu_raw = parsed_json.get("education") or parsed_json.get("educations") or []
    if isinstance(edu_raw, dict):
        edu_raw = [edu_raw]
    for item in ensure_list(edu_raw):
        expected["education"].append(normalize_education_item(item))

    skills_raw = parsed_json.get("skills") or parsed_json.get("skillset") or parsed_json.get("technical_skills") or []
    expected["skills"] = map_skills_to_categories(skills_raw)

    exp_raw = parsed_json.get("experience") or parsed_json.get("experiences") or []
    for e in ensure_list(exp_raw):
        if isinstance(e, str):
            expected["experience"].append({"company": None, "role": None, "start_date": None, "end_date": None, "responsibilities": [e]})
            continue
        company = e.get("company") or e.get("employer") or e.get("organization") or e.get("org") or None
        role = e.get("role") or e.get("title") or e.get("position") or None
        # convert durations like "May 2025 - July 2025" if present
        start_date = e.get("start_date") or e.get("from") or None
        end_date = e.get("end_date") or e.get("to") or None
        # parse if provided as single 'duration'
        if not start_date and not end_date and e.get("duration"):
            dur = str(e.get("duration"))
            parts = re.split(r"\s*[-–]\s*", dur)
            if len(parts) == 2:
                start_date, end_date = parts[0].strip(), parts[1].strip()
        resp = e.get("responsibilities") or e.get("achievements") or e.get("achievements_list") or e.get("achievements") or e.get("description")
        if isinstance(resp, list):
            responsibilities = [str(x).strip() for x in resp if x]
        elif isinstance(resp, str):
            responsibilities = [r.strip() for r in re.split(r"[\n•\-]+", resp) if r.strip()]
        else:
            responsibilities = []
        expected["experience"].append({"company": company, "role": role, "start_date": start_date, "end_date": end_date, "responsibilities": responsibilities})

    proj_raw = parsed_json.get("projects") or parsed_json.get("project") or []
    for p in ensure_list(proj_raw):
        if isinstance(p, str):
            expected["projects"].append({"name": None, "description": p, "technologies": [], "github": None})
            continue
        name = p.get("name") or p.get("title")
        # project description might be list of text dicts
        description = None
        if p.get("description"):
            if isinstance(p.get("description"), list):
                description = " ".join([ (d.get("text") if isinstance(d, dict) else str(d)) for d in p.get("description") ])
            else:
                description = p.get("description")
        description = description or p.get("desc") or p.get("summary")
        technologies = p.get("technologies") or p.get("techStack") or p.get("tech") or []
        github = p.get("github") if isinstance(p.get("github"), bool) else (bool(p.get("github")) if p.get("github") else None)
        expected["projects"].append({"name": name, "description": description, "technologies": ensure_list(technologies), "github": github})

    cert_raw = parsed_json.get("certifications") or parsed_json.get("certs") or []
    for c in ensure_list(cert_raw):
        if isinstance(c, str):
            expected["certifications"].append({"name": c, "description": None})
        elif isinstance(c, dict):
            expected["certifications"].append({"name": c.get("name") or c.get("title"), "description": c.get("description") or None})

    return expected


# --------- ats_extractor - robust including escaped-json-in-raw_output fix ----------
def ats_extractor(resume_text: str):
    prompt = f"""
Extract structured JSON from this resume text.
The JSON should include fields like:
- name
- email
- phone
- education
- skills
- experience
- projects
- certifications
- project description
also for projects include project description, technologies used, github link (if any).
if something is not there make it as "null" or empty list.
MUST BE A VALID JSON FORMAT if null comes as output make it as "null".

Resume:
{resume_text}
"""
    try:
        response = ollama.chat(
            model="llama3",
            messages=[
                {"role": "system", "content": "You are an ATS resume parser."},
                {"role": "user", "content": prompt}
            ],
        )
    except Exception as e:
        return {"raw_output": f"ollama.chat error: {e}"}

    # get content if available, otherwise stringify
    raw_output = None
    if isinstance(response, dict):
        if "message" in response and isinstance(response["message"], dict):
            raw_output = response["message"].get("content")
        elif "content" in response:
            raw_output = response.get("content")
    if raw_output is None:
        raw_output = str(response)

    raw_output = str(raw_output).strip()

    # remove fenced code
    if "```" in raw_output:
        parts = raw_output.split("```")
        candidate = None
        for p in parts:
            if "{" in p and "}" in p:
                candidate = p
                break
        raw_output = candidate.strip() if candidate else raw_output.replace("```", "").strip()

    # strip leading 'json' markers
    raw_output = re.sub(r"^\s*json[:\s]*", "", raw_output, flags=re.I).strip()

    parsed = None

    # Try direct JSON parse
    try:
        parsed = json.loads(raw_output)
    except Exception:
        parsed = None

    # If parsed is a dict with 'raw_output' that itself is an escaped JSON string, unescape and parse it
    if isinstance(parsed, dict) and "raw_output" in parsed and isinstance(parsed["raw_output"], str):
        candidate_str = parsed["raw_output"]
        # Typical pattern: "\n{\n  \"name\": ... }\n" or similar
        # Unescape common sequences
        try:
            unescaped = candidate_str.encode("utf-8").decode("unicode_escape")
        except Exception:
            unescaped = candidate_str
        # strip surrounding quotes
        if unescaped.startswith('"') and unescaped.endswith('"'):
            unescaped = unescaped[1:-1]
        # extract JSON block and parse
        m = re.search(r"(\{[\s\S]*\})", unescaped)
        if m:
            try:
                parsed2 = json.loads(m.group(1))
                parsed = parsed2
                raw_output = m.group(1)
            except Exception:
                # last fallback - try raw unescaped as JSON
                try:
                    parsed2 = json.loads(unescaped)
                    parsed = parsed2
                    raw_output = unescaped
                except Exception:
                    parsed = None
        else:
            # attempt parse directly
            try:
                parsed2 = json.loads(unescaped)
                parsed = parsed2
                raw_output = unescaped
            except Exception:
                parsed = None

    # If not parsed yet, try unescaping raw_output if it looks escaped
    if parsed is None:
        if raw_output.count("\\n") > 0 or (raw_output.startswith('"') and raw_output.endswith('"')):
            try:
                unescaped = raw_output.encode("utf-8").decode("unicode_escape")
                if unescaped.startswith('"') and unescaped.endswith('"'):
                    unescaped = unescaped[1:-1]
                m = re.search(r"(\{[\s\S]*\})", unescaped)
                candidate = m.group(1) if m else unescaped
                parsed = json.loads(candidate)
                raw_output = candidate
            except Exception:
                parsed = None

    # If still not parsed, try to extract largest {...}
    if parsed is None:
        m = re.search(r"(\{[\s\S]*\})", raw_output)
        if m:
            try:
                parsed = json.loads(m.group(1))
                raw_output = m.group(1)
            except Exception:
                parsed = None

    if parsed is None:
        # final fallback: return raw for debugging
        return {"raw_output": raw_output}

    # Normalize into expected schema
    normalized = normalize_to_expected(parsed)

    # if missing key fields, attach parsed raw for debugging
    if not normalized.get("name") or not normalized.get("contact") or not normalized["contact"].get("email"):
        normalized["_raw_ats_output"] = parsed

    return normalized


# ---------- JD skill extractor (streaming HTTP to Ollama) ----------
OLLAMA_URL = "http://127.0.0.1:11434"
MODEL_NAME = "llama3"


def extract_skills_llm(text, max_tokens=512, temperature=0.0):
    prompt = f"""
You are an expert resume/job description parser. 
Extract only the skills from the following job description.
Give detailed summery of the job description which can help identify similar kind of jobs.


⚠️ Important rules:
- Output must be valid JSON only (no explanations, no extra text). 
- Use only keywords (single words or short phrases). 
- Do not include full sentences or descriptions. 
- Categorize skills into "required_skills" and "soft_skills".

Format the output exactly as:
{{
    "required_skills": ["skill1", "skill2", "skill3"],
    "soft_skills": ["skillA", "skillB"],
    "job_summary": "A brief summary of the job description goes here."

}}
JD: {text}
"""
    url = f"{OLLAMA_URL}/api/generate"
    data = {
        "model": MODEL_NAME,
        "prompt": prompt,
        "max_tokens": max_tokens,
        "temperature": temperature
    }

    try:
        resp = requests.post(url, json=data, stream=True, timeout=60)
        resp.raise_for_status()
    except Exception as e:
        return {"raw_output": f"HTTP error to Ollama: {e}"}

    output = ""
    for line in resp.iter_lines():
        if line:
            try:
                obj = json.loads(line.decode("utf-8"))
            except Exception:
                try:
                    output += line.decode("utf-8")
                except Exception:
                    continue
            else:
                if "response" in obj:
                    output += obj["response"]
                if obj.get("done", False):
                    break

    try:
        return json.loads(output)
    except Exception:
        m = re.search(r"(\{[\s\S]*\})", output)
        if m:
            try:
                return json.loads(m.group(1))
            except Exception:
                return {"raw_output": output}
        return {"raw_output": output}


# -------- Endpoints ----------
@app.post("/upload/")
async def upload_jd(
    input_type: str = Form(...),
    file: UploadFile = File(None),
    text: str = Form(None),
    url: str = Form(None),
    skip_fetch: str = Form(None),
):
    try:
        if input_type == "pdf":
            if not file:
                return JSONResponse(status_code=400, content={"error": "PDF file missing"})
            fp = os.path.join(UPLOAD_DIR, file.filename)
            with open(fp, "wb") as buf:
                shutil.copyfileobj(file.file, buf)
            jd_text = jd_extractor(fp, input_type="pdf")
        elif input_type == "url":
            if not url:
                return JSONResponse(status_code=400, content={"error": "URL missing"})
            if is_truthy_form(skip_fetch := skip_fetch):
                try:
                    jd_text = jd_extractor(url, input_type="url")
                except Exception as e:
                    return JSONResponse(status_code=400, content={"error": f"Network error while fetching URL via jd_extractor: {e}"})
            else:
                try:
                    fetched = fetch_url_text(url, timeout=12)
                except ValueError as ve:
                    return JSONResponse(status_code=400, content={"error": str(ve)})
                jd_text = jd_extractor(fetched, input_type="text")
        elif input_type == "text":
            if not text:
                return JSONResponse(status_code=400, content={"error": "Text missing"})
            jd_text = jd_extractor(text, input_type="text")
        else:
            return JSONResponse(status_code=400, content={"error": "Invalid input type"})

        skills_output = extract_skills_llm(jd_text)
        return JSONResponse(content={"status": "success", "skills": skills_output})
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})


@app.post("/process_pair/")
async def process_pair(
    resume_input_type: str = Form(None),
    resume_file: UploadFile = File(None),
    resume_text: str = Form(None),
    resume_url: str = Form(None),
    resume_skip_fetch: str = Form(None),
    jd_input_type: str = Form(None),
    jd_file: UploadFile = File(None),
    jd_text: str = Form(None),
    jd_url: str = Form(None),
    jd_skip_fetch: str = Form(None),
):
    try:
        # RESUME extraction
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
            if is_truthy_form(resume_skip_fetch):
                try:
                    resume_raw = jd_extractor(resume_url, input_type="url")
                except Exception as e:
                    return JSONResponse(status_code=400, content={"error": f"Network error while fetching resume via jd_extractor: {e}"})
            else:
                try:
                    fetched = fetch_url_text(resume_url, timeout=12)
                except ValueError as ve:
                    return JSONResponse(status_code=400, content={"error": str(ve)})
                resume_raw = jd_extractor(fetched, input_type="text")
        else:
            if not resume_text:
                return JSONResponse(status_code=400, content={"error": "Resume text missing"})
            resume_raw = jd_extractor(resume_text, input_type="text")

        resume_json = ats_extractor(resume_raw)

        # JD extraction
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
            if is_truthy_form(jd_skip_fetch):
                try:
                    jd_raw = jd_extractor(jd_url, input_type="url")
                except Exception as e:
                    return JSONResponse(status_code=400, content={"error": f"Network error while fetching JD via jd_extractor: {e}"})
            else:
                try:
                    fetched = fetch_url_text(jd_url, timeout=12)
                except ValueError as ve:
                    return JSONResponse(status_code=400, content={"error": str(ve)})
                jd_raw = jd_extractor(fetched, input_type="text")
        else:
            if not jd_text:
                return JSONResponse(status_code=400, content={"error": "JD text missing"})
            jd_raw = jd_extractor(jd_text, input_type="text")

        jd_json = extract_skills_llm(jd_raw)

        # return JSONResponse(content={"status": "success", "resume_json": resume_json, "jd_json": jd_json})
        # --- Convert all None → "null" strings before returning ---
        def replace_none_with_string(data):
            if isinstance(data, dict):
                return {k: replace_none_with_string(v) for k, v in data.items()}
            elif isinstance(data, list):
                return [replace_none_with_string(x) for x in data]
            elif data is None:
                return "null"
            return data

        resume_json = replace_none_with_string(resume_json)
        jd_json = replace_none_with_string(jd_json)

        return JSONResponse(content={"status": "success", "resume_json": resume_json, "jd_json": jd_json})

    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})


#---------- skill match and skill gap endpoints  ---------- Harsh

from resume_optimizer_agent import skill_matcher
from recommendation_agent.recomendation import recommend_for_skills
from job_recommendation.recommend import search_jobs
from fastapi.responses import FileResponse
from fastapi import Body

@app.post("/skill_match/")
async def skill_match(resume_json: dict, jd_json: dict):
    try:
        matched_skills = skill_matcher.match_skills(resume_json, jd_json)
        return JSONResponse(content=matched_skills)
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})


@app.post("/skill_gap/")
async def skill_gap(
    data: dict = Body(...),
    web_provider="google"
    ):
    try:
        skills = data.get("skills", [])
        recommendations = recommend_for_skills(skills, web_provider=web_provider)
        return JSONResponse(content=recommendations)
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})
    

@app.post("/search_jobs")
async def job_search(
    summary : dict = Body(...),
   
    ):
    try:
        desc = summary.get("job_summary", "")
        jobs = search_jobs(desc)
        return JSONResponse(content=jobs)
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})


import subprocess
import re
from jinja2 import Template
import ollama
import os

def generate_ats_resume(resume_data, jd_data, matched_json, output_pdf="ATS_Resume.pdf"):
    """Generates an ATS-optimized PDF resume using Ollama and LaTeX."""
    
    # ====== LATEX CLEANERS ======
    def clean_for_latex(text):
        replacements = {
            "&": r"\&", "%": r"\%", "$": r"\$", "#": r"\#",
            "_": r"\_", "{": r"\{", "}": r"\}", "~": r"\textasciitilde{}",
            "^": r"\textasciicircum{}", "–": "-", "—": "-",
            "“": '"', "”": '"', "’": "'", "•": "-", "…": "..."
        }
        for k, v in replacements.items():
            text = text.replace(k, v)
        return text

    def clean_llm_output(text):
        text = re.sub(r'\*\*(.*?)\*\*', r'\1', text)
        text = re.sub(r'\*(.*?)\*', r'\1', text)
        text = re.sub(r'`(.*?)`', r'\1', text)
        text = re.sub(r"(?i)here.?s a rewritten.*?:", "", text)
        text = re.sub(r"(?i)here.?s the optimized.*?:", "", text)
        text = re.sub(r"(?i)this rewritten.*", "", text)
        text = re.sub(r"(?i)note:.*", "", text)
        text = re.sub(r"(?i)i made the following changes.*", "", text, flags=re.DOTALL)
        text = re.sub(r"(?i)key changes.*", "", text, flags=re.DOTALL)
        text = re.split(r"(?i)(\n\s*\*|\n\s*-\s|Key points:|Key changes:)", text)[0]
        text = clean_for_latex(text)
        text = re.sub(r'\s+', ' ', text).strip()
        return text

    def ats_optimize_section(section_name, text, job_desc):
        prompt = f"""
        You are an expert resume optimizer.
        Rewrite the following {section_name} section to be:
         - Highly ATS-friendly with strong action verbs and relevant keywords.
         - Include quantifiable metrics (e.g., percentages, time reductions, user counts) if plausible.
         - Keep it concise and professional.
          Return *only* the rewritten professional text.
        Do not include explanations, notes, bullet points, or reasons for your changes.
        Do not include anything like this "Here is the rewritten Professional Summary section:" while generating.

        """
        response = ollama.chat(
            model="llama3",
            messages=[{"role": "user", "content": prompt + "\n\n" + job_desc + "\n---\n" + text}]
        )
        return clean_llm_output(response["message"]["content"].strip())

    # ====== JOB DESCRIPTION TEXT ======
    jd_text = jd_data["job_summary"] + " " + " ".join(jd_data["required_skills"])

    # ====== FILTER SECTIONS ======
    filtered_skills = [
        s for s in resume_data["skills"]["programming_languages"]
        if any(skill.lower() in s.lower() for skill in matched_json["matched_required_skills"])
    ] or resume_data["skills"]["programming_languages"]

    filtered_projects = [
        proj for proj in resume_data["projects"]
        if proj["name"] in matched_json["projects_matches"]
    ] or resume_data["projects"]

    filtered_certs = [
        cert for cert in resume_data["certifications"]
        if any(c.lower() in cert["name"].lower() or c.lower() in cert["description"].lower()
               for c in matched_json["certifications_matches"])
    ] or resume_data["certifications"]

    # ====== OPTIMIZE SUMMARY ======
    summary_text = ats_optimize_section(
        "Professional Summary",
        "Aspiring software engineer with experience in full-stack and machine learning projects, seeking to contribute to scalable software solutions.",
        jd_text
    )

    # ====== BUILD EXPERIENCE ======
    exp_entries = []
    for exp in resume_data["experience"]:
        exp_points = "\\\\\n".join([f"-- {clean_for_latex(r)}" for r in exp["responsibilities"]])
        exp_entries.append(
            f"\\textbf{{{clean_for_latex(exp['role'])}}} at {clean_for_latex(exp['company'])} "
            f"\\hfill ({exp['start_date']} -- {exp['end_date']})\\\\\n{exp_points}\n"
        )
    exp_text = "\n\n".join(exp_entries)

    # ====== BUILD PROJECTS ======
    projects_text = "\\\\[4pt]\n".join([
        f"\\textbf{{{clean_for_latex(proj['name'])}}}: {clean_for_latex(proj['description'])}"
        for proj in filtered_projects
    ])

    # ====== BUILD CERTIFICATIONS ======
    certifications_text = "\n".join([
        f"\\textbf{{{clean_for_latex(cert['name'])}}}: {clean_for_latex(cert['description'])}\\\\"
        for cert in filtered_certs
    ])

    # ====== LATEX TEMPLATE ======
    latex_template = r"""
    \documentclass{resume}

    \name{ {{ name }} }

    \contact{
        \faEnvelope\ {{ contact.email }} \quad | \quad
        \faPhone\ {{ contact.phone }}
    }

    \begin{document}

    \begin{rSection}{Summary}
    {{ summary }}
    \end{rSection}

    \begin{rSection}{Education}
    {% for edu in education %}
    \textbf{ {{ edu.institution }} } \hfill {{ edu.degree }}\\
    CGPA / Percentage: {{ edu.cgpa if edu.cgpa != "null" else edu.percentage }}\\[6pt]
    {% endfor %}
    \end{rSection}

    \begin{rSection}{Experience}
    {{ experience }}
    \end{rSection}

    \begin{rSection}{Projects}
    {{ projects }}
    \end{rSection}

    \begin{rSection}{Skills}
    {% for s in skills %}
    {{ s | replace('%', '\%') | replace('&', '\&') }}\\
    {% endfor %}
    \end{rSection}

    \begin{rSection}{Certifications}
    {{ certifications }}
    \end{rSection}

    \end{document}
    """

    # ====== RENDER LATEX ======
    rendered_resume = Template(latex_template).render(
        name=resume_data["name"],
        contact=resume_data["contact"],
        education=resume_data["education"],
        experience=exp_text,
        projects=projects_text,
        skills=filtered_skills,
        certifications=certifications_text,
        summary=summary_text
    )

    # ====== SAVE AND COMPILE ======
    tex_path = "ATS_Resume.tex"
    with open(tex_path, "w", encoding="utf-8") as f:
        f.write(rendered_resume)

    print("✅ LaTeX file generated successfully!")

    try:
        subprocess.run(["pdflatex", "-interaction=nonstopmode", tex_path], check=True)
        subprocess.run(["pdflatex", "-interaction=nonstopmode", tex_path], check=True)
        print(f"🎉 PDF generated successfully: {output_pdf}")
    except subprocess.CalledProcessError:
        print("❌ Error while generating PDF.")
        return None

    return os.path.abspath(output_pdf)


@app.post("/resume")
async def resume_evaluate(
    resume_json: dict = Body(...),
    jd_json: dict = Body(...),
    matcher: dict = Body(...)
):
    try:
        generate_ats_resume(resume_json, jd_json, matcher)
        file_path = "./ATS_Resume.pdf"
        return FileResponse(file_path, media_type="application/pdf")
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

@app.get("/")
def root():
    return {"message": "Resume Maker API is running!"}



#  to run uvicorn routes:app --reload
