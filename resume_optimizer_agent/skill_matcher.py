import re
import json
from collections import defaultdict


def _normalize(s):
  if not s:
    return ""
  return re.sub(r"[^a-z0-9+#/ ]+", " ", s.lower()).strip()


def _skill_variants(skill):
  parts = re.split(r"[\/,]", skill)
  variants = [p.strip().lower() for p in parts if p.strip()]
  variants.append(skill.strip().lower())
  return list(dict.fromkeys(variants))


def _contains(text, skill):
  if not text:
    return False
  text_n = _normalize(text)
  for var in _skill_variants(skill):
    var_n = _normalize(var)
    if not var_n:
      continue
    if re.search(r"\b" + re.escape(var_n) + r"\b", text_n):
      return True
  return False


def match_skills(resume_json, jd_json):
  """
  Deterministic matcher that compares `jd_json` required and soft skills to fields in `resume_json`.
  Returns a JSON-serializable dict with matched/unmatched skills and locations.
  """
  sources = {}

  # Flatten explicit skills
  skills_flat = []
  for cat, items in resume_json.get("skills", {}).items():
    if isinstance(items, (list, tuple)):
      skills_flat.extend([str(x) for x in items])
  sources["skills_list"] = " ".join(skills_flat)

  # Projects
  proj_text = []
  projects = resume_json.get("projects", []) or []
  for p in projects:
    techs = p.get("technologies") or []
    proj_text.append(" ".join([str(t) for t in techs]))
    if p.get("description"):
      proj_text.append(str(p.get("description")))
  sources["projects"] = " ".join(proj_text)

  # Certifications
  cert_text = []
  for c in resume_json.get("certifications", []) or []:
    if c.get("name"):
      cert_text.append(str(c.get("name")))
    if c.get("description"):
      cert_text.append(str(c.get("description")))
  sources["certifications"] = " ".join(cert_text)

  # Experience
  exp_text = []
  for e in resume_json.get("experience", []) or []:
    if e.get("role"):
      exp_text.append(str(e.get("role")))
    if e.get("company"):
      exp_text.append(str(e.get("company")))
    for r in e.get("responsibilities") or []:
      exp_text.append(str(r))
  sources["experience"] = " ".join(exp_text)

  # Education
  edu_text = []
  for ed in resume_json.get("education", []) or []:
    edu_text.extend([str(v) for v in ed.values() if v])
  sources["education"] = " ".join(edu_text)

  def find_locations(skill):
    found = []
    for name, txt in sources.items():
      if _contains(txt, skill):
        found.append(name)
    proj_matches = defaultdict(list)
    for p in projects:
      p_name = p.get("name", "<project>")
      p_txt = " ".join([p.get("description") or "", " ".join(p.get("technologies") or [])])
      if _contains(p_txt, skill):
        proj_matches[p_name].append(skill)
    return found, dict(proj_matches)

  required = jd_json.get("required_skills", []) or []
  soft = jd_json.get("soft_skills", []) or []

  matched_required = []
  matched_required_locations = {}
  unmatched_required = []

  for rs in required:
    locs, proj_map = find_locations(rs)
    if locs or proj_map:
      matched_required.append(rs)
      matched_required_locations[rs] = {"sources": locs, "projects": proj_map}
    else:
      unmatched_required.append(rs)

  matched_soft = []
  matched_soft_locations = {}
  unmatched_soft = []
  for ss in soft:
    locs, proj_map = find_locations(ss)
    if locs or proj_map:
      matched_soft.append(ss)
      matched_soft_locations[ss] = {"sources": locs, "projects": proj_map}
    else:
      unmatched_soft.append(ss)

  projects_matches = {}
  for p in projects:
    p_name = p.get("name", "<project>")
    matches = []
    for rs in required:
      if _contains(" ".join([p.get("description") or "", " ".join(p.get("technologies") or [])]), rs):
        matches.append(rs)
    if matches:
      projects_matches[p_name] = matches

  cert_matches = []
  for c in resume_json.get("certifications", []) or []:
    text = " ".join([c.get("name") or "", c.get("description") or ""]) 
    for rs in required:
      if _contains(text, rs) and rs not in cert_matches:
        cert_matches.append(rs)

  result = {
    "matched_required_skills": matched_required,
    "matched_required_locations": matched_required_locations,
    "unmatched_required_skills": unmatched_required,
    "matched_soft_skills": matched_soft,
    "matched_soft_locations": matched_soft_locations,
    "unmatched_soft_skills": unmatched_soft,
    "projects_matches": projects_matches,
    "certifications_matches": cert_matches,
    "summary": {
      "total_required": len(required),
      "matched_required": len(matched_required),
      "total_soft": len(soft),
      "matched_soft": len(matched_soft),
    },
  }
  return result


resume = {"resume_json": {
    "name": "Shubham Kumar",
    "contact": {
      "email": "shubhamkr77555@gmail.com",
      "phone": "+91 7257912483"
    },
    "education": [
      {
        "institution": "Vellore Institute of Technology",
        "degree": "BTech. in Computer Science Engineering",
        "cgpa": 8.8,
        "percentage": "null",
        "start_date": "null",
        "end_date": "null"
      },
      {
        "institution": "Delhi Public School",
        "degree": "Senior Secondary Education (CBSE)",
        "cgpa": "null",
        "percentage": 93.6,
        "start_date": "null",
        "end_date": "null"
      },
      {
        "institution": "Delhi Public School",
        "degree": "High School Education (CBSE)",
        "cgpa": "null",
        "percentage": 95.6,
        "start_date": "null",
        "end_date": "null"
      }
    ],
    "skills": {
      "programming_languages": [
        "C++",
        "Python",
        "Java",
        "GitHub",
        "Postman",
        "Vercel",
        "Render"
      ],
      "web_development": [
        "HTML",
        "CSS",
        "JavaScript",
        "React.js",
        "Node.js",
        "Express.js",
        "REST APIs"
      ],
      "databases": [
        "MongoDB",
        "SQL"
      ],
      "machine_learning": [
        "Pandas",
        "NumPy",
        "Matplotlib",
        "Scikit-learn",
        "TensorFlow",
        "Keras"
      ]
    },
    "experience": [
      {
        "company": "Just Logic Software Pvt. Ltd.",
        "role": "Full Stack Developer Intern",
        "start_date": "null",
        "end_date": "null",
        "responsibilities": []
      }
    ],
    "projects": [
      {
        "name": "AutismScope",
        "description": "Implemented a full-stack web app for Autism Spectrum Disorder prediction, integrating a React.js frontend with a Flask backend, delivering real-time results in under 1 second. Benchmarked Decision Tree, Random Forest, and XGBoost classifiers, selecting the best model with 92% accuracy and deployed on Render + GitHub Pages for scalable access.",
        "technologies": [
          "Python",
          "Scikit-learn",
          "NumPy",
          "Pandas",
          "Matplotlib",
          "React.js",
          "Flask",
          "Render"
        ],
        "github": "null"
      },
      {
        "name": "Nexus",
        "description": "Built a student-centric platform during a 48-hour hackathon with a team of 3, helping users reconnect lost belongings and match with peers having complementary skills. Designed and developed a responsive front-end using HTML, CSS, and vanilla JavaScript, ensuring smooth usability across devices. Collaborated with backend and design teammates to deliver an MVP, integrating authentication, UI, and APIs.",
        "technologies": [
          "HTML",
          "CSS",
          "JavaScript",
          "Node.js",
          "Express.js",
          "Render"
        ],
        "github": "null"
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
}

jd = {
     "jd_json": {
    "required_skills": [
      "C++",
      "SQL",
      "HTML/DHTML",
      "CSS",
      "JavaScript",
      "Service Oriented Architecture",
      "Web Services/SOAP",
      "Object-Oriented Programming",
      "Data Structures",
      "Algorithms"
    ],
    "soft_skills": [
      "Communication skills",
      "Analytical skills",
      "Problem-solving skills",
      "Team player",
      "Independent",
      "Out-of-the-box thinker",
      "Self-learner",
      "Passion for process automation and software quality"
    ]
  }
}

jd = {
  "jd_json": {
    "required_skills": [
      "C++",
      "SQL",
      "HTML/DHTML",
      "CSS",
      "JavaScript",
      "Service Oriented Architecture",
      "Web Services/SOAP",
      "Object-Oriented Programming",
      "Data Structures",
      "Algorithms"
    ],
    "soft_skills": [
      "Communication skills",
      "Analytical skills",
      "Problem-solving skills",
      "Team player",
      "Independent",
      "Out-of-the-box thinker",
      "Self-learner",
      "Passion for process automation and software quality"
]
   }
}

if __name__ == "__main__":
    result = match_skills(resume['resume_json'], jd['jd_json'])
    print(result)