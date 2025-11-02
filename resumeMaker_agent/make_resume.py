# make_resume.py
import subprocess
import re
import os
from jinja2 import Template
import ollama

# NOTE: Ensure dependencies are installed:
# pip install jinja2 ollama-python-client   (or whatever ollama client you use)
# Also ensure `pdflatex` (TeX Live / MiKTeX) is installed and available in PATH.

def generate_ats_resume(resume_data, jd_data, matched_json, output_pdf_name="ATS_Resume.pdf"):
    """
    Generate ATS-optimized PDF and .tex file in the same directory as this script.

    Returns: absolute path to generated PDF on success, or None on failure.
    """
    agent_dir = os.path.dirname(os.path.abspath(__file__))  # directory of this script
    tex_basename = os.path.splitext(output_pdf_name)[0] + ".tex"
    tex_path = os.path.join(agent_dir, tex_basename)
    pdf_path = os.path.join(agent_dir, output_pdf_name)

    # ====== LATEX CLEANERS ======
    # def clean_for_latex(text):
    #     if text is None:
    #         return ""
    #     text = str(text)
    #     replacements = {
    #         "&": r"\&", "%": r"\%", "$": r"\$", "#": r"\#",
    #         "_": r"\_", "{": r"\{", "}": r"\}", "~": r"\textasciitilde{}",
    #         "^": r"\textasciicircum{}", "–": "-", "—": "-",
    #         "“": '"', "”": '"', "’": "'", "•": "-", "…": "..."
    #     }
    #     for k, v in replacements.items():
    #         text = text.replace(k, v)
    #     # collapse excessive whitespace
    #     return re.sub(r'\s+', ' ', text).strip()

    # def clean_llm_output(text):
    #     if not text:
    #         return ""
    #     text = str(text)
    #     # remove common markdown/bullets and helper phrases
    #     text = re.sub(r'\*\*(.*?)\*\*', r'\1', text)
    #     text = re.sub(r'\*(.*?)\*', r'\1', text)
    #     text = re.sub(r'`(.*?)`', r'\1', text)
    #     text = re.sub(r"(?i)here('?s| is) (a )?rewritten.*?:", "", text)
    #     text = re.sub(r"(?i)here('?s| is) the optimized.*?:", "", text)
    #     text = re.sub(r"(?i)this rewritten.*", "", text)
    #     text = re.sub(r"(?i)note:.*", "", text)
    #     text = re.sub(r"(?i)i made the following changes.*", "", text, flags=re.DOTALL)
    #     # take first paragraph up to common separators to avoid long trailing notes
    #     parts = re.split(r"(?i)(Key points:|Key changes:|\n\s*\*|\n\s*-\s)", text)
    #     if parts:
    #         text = parts[0]
    #     text = clean_for_latex(text)
    #     return text



    def clean_for_latex(text):
        """
        Make text safe for direct insertion into LaTeX:
        - ensure it's a Python string, replace literal backslash escapes like '\n' with real newlines
        - remove/escape backslashes so LaTeX doesn't see them as macros
        - escape LaTeX special characters
        - collapse repeated whitespace into single spaces or single/newline where appropriate
        """
        if text is None:
            return ""
        # ensure string
        s = str(text)

        # If the LLM returned a JSON-escaped string (contains literal \n, \t etc), unescape common escapes:
        # Convert literal backslash-letter sequences into actual characters where safe:
        s = s.replace("\\r\\n", "\n").replace("\\n", "\n").replace("\\r", "\n").replace("\\t", " ")

        # Remove any remaining backslash characters (they are dangerous for LaTeX).
        # We replace a single backslash with a space to avoid joining words.
        s = s.replace("\\", " ")

        # Replace / collapse multiple newlines -> single newline; then trim spaces at line ends
        s = re.sub(r'\n\s*\n+', '\n\n', s)          # keep at most one blank line between paragraphs
        s = "\n".join([ln.rstrip() for ln in s.splitlines()])

        # Escape LaTeX special characters (keep order stable)
        replacements = {
            "&": r"\&",
            "%": r"\%",
            "$": r"\$",
            "#": r"\#",
            "_": r"\_",
            "{": r"\{",
            "}": r"\}",
            "~": r"\textasciitilde{}",
            "^": r"\textasciicircum{}",
            "–": "-",  # replace en-dash with normal dash
            "—": "-",
            "“": '"',
            "”": '"',
            "’": "'",
            "•": "-", 
            "…": "..."
        }
        for k, v in replacements.items():
            s = s.replace(k, v)

        # Collapse many spaces into one (but preserve newlines)
        s = "\n".join([re.sub(r'[ \t]{2,}', ' ', ln) for ln in s.splitlines()])

        # Finally strip leading/trailing whitespace
        s = s.strip()

        return s


    def clean_llm_output(text):
        """
        Sanitize LLM output:
        - remove markdown markers and typical LLM scaffolding text
        - extract only the first useful paragraph
        - then run through clean_for_latex
        """
        if not text:
            return ""

        s = str(text)

        # If the model returned JSON-like object (stringified), remove wrapping quotes if present
        if s.startswith('"') and s.endswith('"'):
            s = s[1:-1]

        # Remove common markdown bold/italic/backticks
        s = re.sub(r'\*\*(.*?)\*\*', r'\1', s, flags=re.S)
        s = re.sub(r'\*(.*?)\*', r'\1', s, flags=re.S)
        s = re.sub(r'`(.*?)`', r'\1', s, flags=re.S)

        # Remove "Here is the rewritten..." style prefixes (case-insensitive)
        s = re.sub(r"(?is)here('?s| is) (the )?rewritten.*?:", "", s)
        s = re.sub(r"(?is)here('?s| is) the optimized.*?:", "", s)
        s = re.sub(r"(?is)this rewritten.*", "", s)
        s = re.sub(r"(?is)note:.*", "", s)
        s = re.sub(r"(?is)key changes:.*", "", s, flags=re.S)

        # If there are bullet lists, take the first paragraph before the bullets
        # or stop at common separators to avoid appended explanations
        parts = re.split(r"(?i)(Key points:|Key changes:|\n\s*[-*•]\s|\n\s*\d+\.\s)", s, maxsplit=1)
        if parts:
            s = parts[0]

        # Unescape common JSON escaped newlines if still present
        s = s.replace("\\n", "\n").replace("\\r", "\n").replace("\\t", " ")

        # Now pass through LaTeX-safe cleaning
        return clean_for_latex(s)


#     def ats_optimize_section(section_name, text, job_desc):
#         """
#         Call to Ollama to rewrite a given section for ATS. Kept simple.
#         If Ollama fails, return the input `text` (cleaned).
#         """
#         try:
#             prompt = f"""
# You are an expert resume optimizer.
# Rewrite the following {section_name} section to be:
#  - Highly ATS-friendly with strong action verbs and relevant keywords.
#  - Include quantifiable metrics (if plausible).
#  - Keep it concise and professional.
# Return only the rewritten professional text (no explanations).
# Resume section:
# {text}

# Job / JD:
# {job_desc}
# """
#             response = ollama.chat(
#                 model="llama3",
#                 messages=[{"role": "user", "content": prompt}],
#             )
#             content = None
#             if isinstance(response, dict):
#                 # Ollama Python client tends to return dict with message.content
#                 msg = response.get("message") or response.get("content")
#                 if isinstance(msg, dict):
#                     content = msg.get("content")
#                 elif isinstance(msg, str):
#                     content = msg
#             if content is None:
#                 # fallback to str()
#                 content = str(response)
#             return clean_llm_output(content)
#         except Exception as e:
#             # if LLM fails, return cleaned original text so generation continues
#             print("⚠️ Ollama ATS optimization failed:", e)
#             return clean_for_latex(text)
    
    def ats_optimize_section(section_name, text, job_desc):
        """
        Call Ollama to rewrite a given section for ATS.
        Ensures only the assistant's text content is extracted — never raw metadata.
        """
        try:
            prompt = f"""
    You are an expert resume optimizer.
    Rewrite the following {section_name} section to be:
    - Highly ATS-friendly with strong action verbs and relevant keywords.
    - Include quantifiable metrics (if plausible).
    - Keep it concise and professional.
    Return only the rewritten professional text (no explanations).
    Resume section:
    {text}

    Job / JD:
    {job_desc}
    """
            response = ollama.chat(
                model="llama3",
                messages=[{"role": "user", "content": prompt}],
            )

            # Handle different response shapes
            content = None

            # Case 1: Ollama returns dict-like
            if isinstance(response, dict):
                msg = response.get("message") or response.get("content")
                if isinstance(msg, dict):
                    content = msg.get("content")
                elif isinstance(msg, str):
                    content = msg

            # Case 2: Ollama returns object (typical with `ollama` Python client)
            elif hasattr(response, "message"):
                msg = getattr(response, "message", None)
                if isinstance(msg, dict):
                    content = msg.get("content")
                elif hasattr(msg, "content"):
                    content = msg.content
                elif isinstance(msg, str):
                    content = msg
            elif hasattr(response, "content"):
                content = response.content

            # Final safety: ensure we only keep the model text, not the metadata
            if not content:
                # Try textual representation but extract only assistant’s message if present
                textified = str(response)
                # Use regex to isolate “content='…'” part if present
                match = re.search(r"content='(.*?)'", textified, re.DOTALL)
                if match:
                    content = match.group(1)
                else:
                    content = textified  # last resort

            # Clean the extracted text
            return clean_llm_output(content)

        except Exception as e:
            print("⚠️ Ollama ATS optimization failed:", e)
            # fallback to cleaned original text so generation continues
            return clean_for_latex(text)


    # ====== JOB DESCRIPTION TEXT ======
    # Create an aggregated JD_text for LLM prompt
    jd_text = ""
    if isinstance(jd_data, dict):
        job_summary = jd_data.get("job_summary", "") if jd_data.get("job_summary") else ""
        req_skills = jd_data.get("required_skills", [])
        if isinstance(req_skills, (list, tuple)):
            jd_text = job_summary + " " + " ".join([str(s) for s in req_skills])
        else:
            jd_text = job_summary + " " + str(req_skills)
    else:
        jd_text = str(jd_data)

    # ====== FILTER SECTIONS (basic filters using matched_json) ======
    filtered_skills = []
    raw_prog = []
    # resume_data may have skills in various shapes; try to collect programming languages list
    try:
        if isinstance(resume_data.get("skills"), dict):
            raw_prog = resume_data["skills"].get("programming_languages", []) or []
        else:
            raw_prog = resume_data.get("skills") or []
    except Exception:
        raw_prog = []

    # if matched_required_skills provided, filter; else keep list
    try:
        matched_required = matched_json.get("matched_required_skills", []) or []
    except Exception:
        matched_required = []

    if matched_required:
        for s in raw_prog:
            s_str = str(s)
            if any(m.lower() in s_str.lower() for m in matched_required):
                filtered_skills.append(s_str)
        if not filtered_skills:
            filtered_skills = [str(x) for x in raw_prog]
    else:
        filtered_skills = [str(x) for x in raw_prog]

    # ====== FILTER PROJECTS ======
    projects_list = resume_data.get("projects", []) or []
    proj_matches = matched_json.get("projects_matches", {}) or {}
    filtered_projects = []
    if proj_matches:
        # if projects_matches is a dict of projectname -> matches
        for p in projects_list:
            name = p.get("name") if isinstance(p, dict) else None
            if name and name in proj_matches:
                filtered_projects.append(p)
    if not filtered_projects:
        filtered_projects = projects_list

    # ====== FILTER CERTIFICATIONS ======
    certs_list = resume_data.get("certifications", []) or []
    cert_matches = matched_json.get("certifications_matches", []) or []
    filtered_certs = []
    if cert_matches:
        for c in certs_list:
            n = c.get("name", "") if isinstance(c, dict) else str(c)
            d = c.get("description", "") if isinstance(c, dict) else ""
            if any(m.lower() in (n + d).lower() for m in cert_matches):
                filtered_certs.append(c)
    if not filtered_certs:
        filtered_certs = certs_list

    # ====== OPTIMIZE SUMMARY (LLM) ======
    try:
        summary_seed = resume_data.get("summary") or "Aspiring software engineer with experience in full-stack and machine learning projects."
        summary_text = ats_optimize_section("Professional Summary", summary_seed, jd_text)
    except Exception:
        summary_text = clean_for_latex(resume_data.get("summary") or "")

    # ====== BUILD EXPERIENCE TEXT (LaTeX) ======
    exp_entries = []
    for exp in resume_data.get("experience", []) or []:
        company = clean_for_latex(exp.get("company") or "")
        role = clean_for_latex(exp.get("role") or "")
        start_date = exp.get("start_date") or ""
        end_date = exp.get("end_date") or ""
        # responsibilities to latex lines
        resp_items = exp.get("responsibilities") or []
        if isinstance(resp_items, str):
            resp_items = [resp_items]
        resp_lines = [clean_for_latex(r) for r in resp_items if r]
        resp_text = "\\\\\n".join([f"-- {r}" for r in resp_lines]) if resp_lines else ""
        entry = f"\\textbf{{{role}}} at {company} \\hfill ({start_date} -- {end_date})\\\\\n{resp_text}"
        exp_entries.append(entry)
    exp_text = "\n\n".join(exp_entries)

    # ====== BUILD PROJECTS TEXT ======
    projects_text_items = []
    for proj in filtered_projects:
        pname = clean_for_latex(proj.get("name") if isinstance(proj, dict) else str(proj))
        pdesc = ""
        if isinstance(proj, dict):
            pdesc = proj.get("description") or proj.get("desc") or ""
        pdesc = clean_for_latex(pdesc)
        if pname:
            projects_text_items.append(f"\\textbf{{{pname}}}: {pdesc}")
    projects_text = "\\\\[4pt]\n".join(projects_text_items)

    # ====== BUILD CERTIFICATIONS TEXT ======
    certifications_text_items = []
    for cert in filtered_certs:
        if isinstance(cert, dict):
            cname = clean_for_latex(cert.get("name") or "")
            cdesc = clean_for_latex(cert.get("description") or "")
        else:
            cname = clean_for_latex(str(cert))
            cdesc = ""
        certifications_text_items.append(f"\\textbf{{{cname}}}: {cdesc}\\\\")
    certifications_text = "\n".join(certifications_text_items)

    # ====== SKILLS LIST (flatten) ======
    # filtered_skills already a list of strings
    skills_for_tex = [clean_for_latex(s) for s in filtered_skills]

    # ====== LATEX TEMPLATE ======
    latex_template = r"""
\documentclass{article}
\usepackage[margin=0.7in]{geometry}
\usepackage{fontawesome5}
\usepackage{parskip}
\usepackage{hyperref}
\begin{document}

\begin{center}
    {\LARGE \textbf{ {{ name }} }}\\[4pt]
    \href{mailto:{{ contact.email }}}{{ contact.email }} \quad | \quad {{ contact.phone }}
\end{center}

\section*{Summary}
{{ summary }}

\section*{Education}
{% for edu in education %}
\textbf{ {{ edu.institution }} } \hfill {{ edu.degree }}\\
CGPA / Percentage: {{ edu.cgpa if edu.cgpa != "null" else edu.percentage }}\\[6pt]
{% endfor %}

\section*{Experience}
{{ experience }}

\section*{Projects}
{{ projects }}

\section*{Skills}
{% for s in skills %}
{{ s }}\\
{% endfor %}

\section*{Certifications}
{{ certifications }}

\end{document}
"""

    # Render Jinja template
    rendered_resume = Template(latex_template).render(
        name=resume_data.get("name", ""),
        contact=resume_data.get("contact", {}),
        education=resume_data.get("education", []),
        experience=exp_text,
        projects=projects_text,
        skills=skills_for_tex,
        certifications=certifications_text,
        summary=summary_text
    )

    # ====== SAVE TEX FILE ======
    try:
        with open(tex_path, "w", encoding="utf-8") as f:
            f.write(rendered_resume)
        print("✅ LaTeX .tex file written to:", tex_path)
    except Exception as e:
        print("❌ Failed to write .tex file:", e)
        return None

    # ====== CHECK pdflatex availability ======
    try:
        subprocess.run(["pdflatex", "--version"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)
    except Exception:
        print("❌ 'pdflatex' not found in PATH. Please install TeX (TeX Live or MiKTeX) and ensure 'pdflatex' is available.")
        return None

    # ====== COMPILE TEX -> PDF (run twice for references) ======
    # run in agent_dir to keep all aux files local
    try:
        subprocess.run(["pdflatex", "-interaction=nonstopmode", tex_basename], cwd=agent_dir, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        subprocess.run(["pdflatex", "-interaction=nonstopmode", tex_basename], cwd=agent_dir, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    except subprocess.CalledProcessError as e:
        print("❌ Error while running pdflatex:", e)
        return None

    if os.path.exists(pdf_path):
        print("🎉 PDF generated successfully:", pdf_path)
        return pdf_path
    else:
        # pdf name may be basename with .pdf in same dir
        alt_pdf = os.path.join(agent_dir, tex_basename.replace(".tex", ".pdf"))
        if os.path.exists(alt_pdf):
            print("🎉 PDF generated (alternate name):", alt_pdf)
            return alt_pdf
        print("❌ PDF file not found after pdflatex run.")
        return None


# If run directly, produce a sample PDF using embedded sample data
if __name__ == "__main__":
    # small sample data (you already provided similar)
    resume_data = {
        "name": "Shubham Kumar",
        "contact": {"email": "shubhamkr77555@gmail.com", "phone": "+91 7257912783"},
        "education": [
            {"institution": "Vellore Institue of Technology", "degree": "BTech. in Computer Science Engineering", "cgpa": 8.8, "percentage": "null"},
            {"institution": "Delhi Public School Patna, Bihar", "degree": "Senior Secondary Education (CBSE)", "cgpa": "null", "percentage": 93.6},
        ],
        "skills": {"programming_languages": ["C++", "Python", "Java"]},
        "experience": [
            {"company": "Just Logic Software Pvt. Ltd.", "role": "Full Stack Developer Intern", "start_date": "May 2025", "end_date": "July 2025",
             "responsibilities": ["Developed 3+ production-ready modules (React.js, Node.js, REST APIs).", "Optimized MongoDB queries."]},
        ],
        "projects": [{"name": "AutismScope", "description": "Implemented a full-stack web app."}],
        "certifications": [{"name": "Complete A.I. & Machine Learning, Data Science Bootcamp (Udemy)", "description": "44-hour bootcamp."}]
    }
    jd_data = {"required_skills": ["C++", "SQL"], "job_summary": "Associate Developer role focusing on software development."}
    matched_json = {"matched_required_skills": ["C++"], "projects_matches": {"AutismScope": []}, "certifications_matches": []}

    path = generate_ats_resume(resume_data, jd_data, matched_json, output_pdf_name="ATS_Resume.pdf")
    print("Output path:", path)
