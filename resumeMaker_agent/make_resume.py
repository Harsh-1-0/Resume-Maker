# import subprocess
# import re
# from jinja2 import Template
# import ollama
# import os

# def generate_ats_resume(resume_data, jd_data, matched_json, output_pdf="ATS_Resume.pdf"):
#     """Generates an ATS-optimized PDF resume using Ollama and LaTeX."""
    
#     # ====== LATEX CLEANERS ======
#     def clean_for_latex(text):
#         replacements = {
#             "&": r"\&", "%": r"\%", "$": r"\$", "#": r"\#",
#             "_": r"\_", "{": r"\{", "}": r"\}", "~": r"\textasciitilde{}",
#             "^": r"\textasciicircum{}", "–": "-", "—": "-",
#             "“": '"', "”": '"', "’": "'", "•": "-", "…": "..."
#         }
#         for k, v in replacements.items():
#             text = text.replace(k, v)
#         return text

#     def clean_llm_output(text):
#         text = re.sub(r'\*\*(.*?)\*\*', r'\1', text)
#         text = re.sub(r'\*(.*?)\*', r'\1', text)
#         text = re.sub(r'`(.*?)`', r'\1', text)
#         text = re.sub(r"(?i)here.?s a rewritten.*?:", "", text)
#         text = re.sub(r"(?i)here.?s the optimized.*?:", "", text)
#         text = re.sub(r"(?i)this rewritten.*", "", text)
#         text = re.sub(r"(?i)note:.*", "", text)
#         text = re.sub(r"(?i)i made the following changes.*", "", text, flags=re.DOTALL)
#         text = re.sub(r"(?i)key changes.*", "", text, flags=re.DOTALL)
#         text = re.split(r"(?i)(\n\s*\*|\n\s*-\s|Key points:|Key changes:)", text)[0]
#         text = clean_for_latex(text)
#         text = re.sub(r'\s+', ' ', text).strip()
#         return text

#     def ats_optimize_section(section_name, text, job_desc):
#         prompt = f"""
#         You are an expert resume optimizer.
#         Rewrite the following {section_name} section to be:
#          - Highly ATS-friendly with strong action verbs and relevant keywords.
#          - Include quantifiable metrics (e.g., percentages, time reductions, user counts) if plausible.
#          - Keep it concise and professional.
#           Return *only* the rewritten professional text.
#         Do not include explanations, notes, bullet points, or reasons for your changes.
#         Do not include anything like this "Here is the rewritten Professional Summary section:" while generating.

#         """
#         response = ollama.chat(
#             model="llama3",
#             messages=[{"role": "user", "content": prompt + "\n\n" + job_desc + "\n---\n" + text}]
#         )
#         return clean_llm_output(response["message"]["content"].strip())

#     # ====== JOB DESCRIPTION TEXT ======
#     jd_text = jd_data["job_summary"] + " " + " ".join(jd_data["required_skills"])

#     # ====== FILTER SECTIONS ======
#     filtered_skills = [
#         s for s in resume_data["skills"]["programming_languages"]
#         if any(skill.lower() in s.lower() for skill in matched_json["matched_required_skills"])
#     ] or resume_data["skills"]["programming_languages"]

#     filtered_projects = [
#         proj for proj in resume_data["projects"]
#         if proj["name"] in matched_json["projects_matches"]
#     ] or resume_data["projects"]

#     filtered_certs = [
#         cert for cert in resume_data["certifications"]
#         if any(c.lower() in cert["name"].lower() or c.lower() in cert["description"].lower()
#                for c in matched_json["certifications_matches"])
#     ] or resume_data["certifications"]

#     # ====== OPTIMIZE SUMMARY ======
#     summary_text = ats_optimize_section(
#         "Professional Summary",
#         "Aspiring software engineer with experience in full-stack and machine learning projects, seeking to contribute to scalable software solutions.",
#         jd_text
#     )

#     # ====== BUILD EXPERIENCE ======
#     exp_entries = []
#     for exp in resume_data["experience"]:
#         exp_points = "\\\\\n".join([f"-- {clean_for_latex(r)}" for r in exp["responsibilities"]])
#         exp_entries.append(
#             f"\\textbf{{{clean_for_latex(exp['role'])}}} at {clean_for_latex(exp['company'])} "
#             f"\\hfill ({exp['start_date']} -- {exp['end_date']})\\\\\n{exp_points}\n"
#         )
#     exp_text = "\n\n".join(exp_entries)

#     # ====== BUILD PROJECTS ======
#     projects_text = "\\\\[4pt]\n".join([
#         f"\\textbf{{{clean_for_latex(proj['name'])}}}: {clean_for_latex(proj['description'])}"
#         for proj in filtered_projects
#     ])

#     # ====== BUILD CERTIFICATIONS ======
#     certifications_text = "\n".join([
#         f"\\textbf{{{clean_for_latex(cert['name'])}}}: {clean_for_latex(cert['description'])}\\\\"
#         for cert in filtered_certs
#     ])

#     # ====== LATEX TEMPLATE ======
#     latex_template = r"""
#     \documentclass{resume}

#     \name{ {{ name }} }

#     \contact{
#         \faEnvelope\ {{ contact.email }} \quad | \quad
#         \faPhone\ {{ contact.phone }}
#     }

#     \begin{document}

#     \begin{rSection}{Summary}
#     {{ summary }}
#     \end{rSection}

#     \begin{rSection}{Education}
#     {% for edu in education %}
#     \textbf{ {{ edu.institution }} } \hfill {{ edu.degree }}\\
#     CGPA / Percentage: {{ edu.cgpa if edu.cgpa != "null" else edu.percentage }}\\[6pt]
#     {% endfor %}
#     \end{rSection}

#     \begin{rSection}{Experience}
#     {{ experience }}
#     \end{rSection}

#     \begin{rSection}{Projects}
#     {{ projects }}
#     \end{rSection}

#     \begin{rSection}{Skills}
#     {% for s in skills %}
#     {{ s | replace('%', '\%') | replace('&', '\&') }}\\
#     {% endfor %}
#     \end{rSection}

#     \begin{rSection}{Certifications}
#     {{ certifications }}
#     \end{rSection}

#     \end{document}
#     """

#     # ====== RENDER LATEX ======
#     rendered_resume = Template(latex_template).render(
#         name=resume_data["name"],
#         contact=resume_data["contact"],
#         education=resume_data["education"],
#         experience=exp_text,
#         projects=projects_text,
#         skills=filtered_skills,
#         certifications=certifications_text,
#         summary=summary_text
#     )

#     # ====== SAVE AND COMPILE ======
#     tex_path = "ATS_Resume.tex"
#     with open(tex_path, "w", encoding="utf-8") as f:
#         f.write(rendered_resume)

#     print("✅ LaTeX file generated successfully!")

#     try:
#         subprocess.run(["pdflatex", "-interaction=nonstopmode", tex_path], check=True)
#         subprocess.run(["pdflatex", "-interaction=nonstopmode", tex_path], check=True)
#         print(f"🎉 PDF generated successfully: {output_pdf}")
#     except subprocess.CalledProcessError:
#         print("❌ Error while generating PDF.")
#         return None

#     return os.path.abspath(output_pdf)

# resume_data = { "name": "Shubham Kumar", "contact": { "email": "shubhamkr77555@gmail.com", "phone": "+91 7257912483" }, "education": [ {"institution": "Vellore Institute of Technology", "degree": "B.Tech in Computer Science and Engineering", "cgpa": 8.8, "percentage": "null"}, {"institution": "Delhi Public School", "degree": "Senior Secondary Education (CBSE)", "cgpa": "null", "percentage": 93.6}, {"institution": "Delhi Public School", "degree": "High School Education (CBSE)", "cgpa": "null", "percentage": 95.6} ], "skills": { "programming_languages": [ "Programming Languages: C++, Python, Java", "Web Development: HTML, CSS, JavaScript, React.js, Node.js, Express.js, REST APIs", "Databases: MongoDB, SQL", "Machine Learning: Pandas, NumPy, Matplotlib, Scikit-learn, TensorFlow, Keras", "Tools & Platforms: GitHub, Postman, Vercel, Render" ] }, "experience": [ { "company": "Just Logic Software Pvt. Ltd.", "role": "Full Stack Developer Intern", "start_date": "May 2025", "end_date": "July 2025", "responsibilities": [ "Developed 3+ production-ready modules (React.js, Node.js, REST APIs), deployed to live users.", "Optimized MongoDB queries, reducing data retrieval time by 30%.", "Collaborated in a 6-member Agile team, delivering 5+ full-stack features within sprint deadlines." ] } ], "projects": [ { "name": "AutismScope", "description": "Implemented a full-stack web app for Autism Spectrum Disorder prediction using React.js and Flask, delivering real-time results under 1 second." }, { "name": "Nexus", "description": "Built a student-centric platform during a 48-hour hackathon that reconnects lost belongings using C++ backend logic." } ], "certifications": [ { "name": "Complete A.I. & Machine Learning, Data Science Bootcamp (Udemy)", "description": "Completed a 44-hour bootcamp on AI, Machine Learning, and Data Science, led by Andrei Neagoie and Daniel Bourke." }, { "name": "Data Structures & Algorithms Mastery", "description": "Achieved LeetCode Contest Rating of 1750 (Top 9% globally) and solved 600+ problems." } ] } 
# jd_data = { "required_skills": [ "C++", "SQL", "HTML/DHTML", "CSS", "Javascript", "Service Oriented Architecture", "Object-Oriented Programming" ], "job_summary": "Associate Developer role at Sapiens, focusing on software development and Agile/Scrum collaboration." } # ====== HARD-CODED MATCHED SKILLS ====== 
# matched_json = { 'matched_required_skills': ['SQL', 'HTML/DHTML', 'CSS', 'JavaScript', 'Data Structures', 'Algorithms'], 'projects_matches': {'Nexus': ['HTML/DHTML', 'CSS', 'JavaScript']}, 'certifications_matches': [] }


# pdf_path = generate_ats_resume(resume_data, jd_data, matched_json)
# print("✅ Final resume saved at:", pdf_path)