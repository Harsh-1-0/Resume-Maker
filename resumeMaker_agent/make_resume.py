import subprocess
from jinja2 import Template
import ollama


# ====== HARD-CODED RESUME JSON ======
resume_data = {
    "name": "Shubham Kumar",
    "contact": {
        "email": "shubhamkr77555@gmail.com",
        "phone": "+91 7257912483"
    },
    "education": [
        {
            "institution": "Vellore Institute of Technology",
            "degree": "B.Tech in Computer Science and Engineering",
            "cgpa": 8.8,
            "percentage": "null"
        },
        {
            "institution": "Delhi Public School",
            "degree": "Senior Secondary Education (CBSE)",
            "cgpa": "null",
            "percentage": 93.6
        },
        {
            "institution": "Delhi Public School",
            "degree": "High School Education (CBSE)",
            "cgpa": "null",
            "percentage": 95.6
        }
    ],
    "skills": {
        "programming_languages": [
            "Programming Languages: C++, Python, Java",
            "Web Development: HTML, CSS, JavaScript, React.js, Node.js, Express.js, REST APIs",
            "Databases: MongoDB, SQL",
            "Machine Learning: Pandas, NumPy, Matplotlib, Scikit-learn, TensorFlow, Keras",
            "Tools & Platforms: GitHub, Postman, Vercel, Render"
        ]
    },
    "experience": [
        {
            "company": "Just Logic Software Pvt. Ltd.",
            "role": "Full Stack Developer Intern",
            "start_date": "May 2025",
            "end_date": "July 2025",
            "responsibilities": [
                "Developed 3+ production-ready modules (React.js, Node.js, REST APIs), deployed to live users.",
                "Optimized MongoDB queries, reducing data retrieval time by 30% for 10k+ records.",
                "Collaborated in a 6-member Agile team, delivering 5+ full-stack features within sprint deadlines."
            ]
        }
    ],
    "projects": [
        {
            "name": "AutismScope",
            "description": "Implemented a full-stack web app for Autism Spectrum Disorder prediction, integrating a React.js frontend with a Flask backend, delivering real-time results in under 1 second."
        },
        {
            "name": "Nexus",
            "description": "Built a student-centric platform during a 48-hour hackathon with a team of 3, helping users reconnect lost belongings and match with peers having complementary skills."
        }
    ],
    "certifications": [
        {
            "name": "Complete A.I. & Machine Learning, Data Science Bootcamp (Udemy)",
            "description": "Completed a 44-hour bootcamp on AI, Machine Learning, and Data Science, led by Andrei Neagoie and Daniel Bourke."
        },
        {
            "name": "Data Structures & Algorithms Mastery",
            "description": "Achieved LeetCode Contest Rating of 1750 (Top 9% globally) and solved 600+ problems."
        }
    ]
}


# ====== HARD-CODED JOB DESCRIPTION JSON ======
jd_data = {
    "required_skills": [
        "C++",
        "SQL",
        "HTML/DHTML",
        "CSS",
        "Javascript",
        "Service Oriented Architecture",
        "Object-Oriented Programming"
    ],
    "soft_skills": [
        "Analytical skills",
        "Problem-solving skills",
        "Communication skills",
        "Team player",
        "Independent",
        "Out-of-the-box thinker",
        "Self-learner"
    ],
    "job_summary": "Associate Developer role at Sapiens, focusing on software development and Agile/Scrum team collaboration."
}


# ====== HARD-CODED MATCHED SKILL SUMMARY ======
matched_json = {
    'matched_required_skills': ['SQL', 'HTML/DHTML', 'CSS', 'JavaScript', 'Data Structures', 'Algorithms'],
    'unmatched_required_skills': ['C++', 'Service Oriented Architecture', 'Object-Oriented Programming']
}


# ====== FUNCTION TO OPTIMIZE CONTENT VIA LLAMA3 ======
def ats_optimize_section(section_name, text, job_desc):
    prompt = f"""
    You are an expert resume optimizer.
    Rewrite the following {section_name} content to be ATS-friendly, 
    keyword-rich, concise, and tailored for this job description.
    Maintain a professional and impactful tone.

    --- JOB DESCRIPTION ---
    {job_desc}

    --- CONTENT TO OPTIMIZE ---
    {text}

    Return only the improved version.
    """

    response = ollama.chat(
        model="llama3",
        messages=[{"role": "user", "content": prompt}]
    )

    return response['message']['content'].strip()


# ====== GENERATE CONTEXT FROM JD ======
jd_text = jd_data["job_summary"] + " " + " ".join(jd_data["required_skills"])


# ====== OPTIMIZE EACH SECTION ======
summary_text = ats_optimize_section(
    "Professional Summary",
    "Aspiring software engineer with experience in full-stack and machine learning projects, seeking to contribute to scalable software solutions.",
    jd_text
)

exp_text = "\n".join(
    f"{exp['role']} at {exp['company']} ({exp['start_date']} - {exp['end_date']}): "
    + ats_optimize_section("Experience", " ".join(exp['responsibilities']), jd_text)
    for exp in resume_data["experience"]
)

projects_text = "\n".join(
    f"{proj['name']}: " + ats_optimize_section("Project", proj["description"], jd_text)
    for proj in resume_data["projects"]
)


# ====== LATEX TEMPLATE (Jake’s Resume Style) ======
latex_template = r"""
\documentclass[]{resume}
\usepackage[left=0.6in,top=0.4in,right=0.6in,bottom=0.4in]{geometry}
\name{ {{ name }} }
\contact{ {{ contact.email }} \\ {{ contact.phone }} }

\begin{document}

\begin{rSection}{Summary}
{{ summary }}
\end{rSection}

\begin{rSection}{Education}
{% for edu in education %}
	extbf{ {{ edu.institution }} } \hfill {{ edu.degree }} \\
CGPA: {{ edu.cgpa if edu.cgpa != "null" else edu.percentage }} \\
{% endfor %}
\end{rSection}

\begin{rSection}{Experience}
{{ experience }}
\end{rSection}

\begin{rSection}{Projects}
{{ projects }}
\end{rSection}

\begin{rSection}{Skills}
{% for s in skills.programming_languages %}
- {{ s }}\\
{% endfor %}
\end{rSection}

\begin{rSection}{Certifications}
{% for c in certifications %}
- \textbf{ {{ c.name }} }: {{ c.description }}\\
{% endfor %}
\end{rSection}

\end{document}
"""


# ====== RENDER THE FINAL RESUME ======
template = Template(latex_template)
rendered_resume = template.render(
    name=resume_data["name"],
    contact=resume_data["contact"],
    education=resume_data["education"],
    experience=exp_text,
    projects=projects_text,
    skills=resume_data["skills"],
    certifications=resume_data["certifications"],
    summary=summary_text,
)


# ====== SAVE TO .TEX FILE ======
with open("ATS_Resume.tex", "w", encoding="utf-8") as f:
    f.write(rendered_resume)

print("✅ ATS-friendly resume (ATS_Resume.tex) generated successfully!")
