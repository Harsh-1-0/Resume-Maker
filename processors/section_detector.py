import re

SECTION_HEADERS = [
    "education",
    "experience",
    "work experience",
    "skills",
    "projects",
    "certifications",
    "achievements",
    "involvements"
]

text = """
Harsh Sinha
Email: harsh@example.com

Skills
Python, React, Node.js

Experience
Software Engineer at XYZ Corp (2021-2023)
Built scalable APIs

Education
B.Tech in Computer Science
"""


def detect_sections(text):
    # Normalize text (remove extra spaces)
    lines = [line.strip() for line in text.splitlines() if line.strip()]
    
    sections = {}
    current_section = None
    
    for line in lines:
        header_found = None
        for header in SECTION_HEADERS:
            if re.fullmatch(rf"(?i){header}", line):  # match ignoring case
                header_found = header.lower()
                sections[header_found] = []
                current_section = header_found
                break
        
        if current_section:
            sections[current_section].append(line)
    
    # Join section lines back into text blocks
    for key in sections:
        sections[key] = "\n".join(sections[key])
    
    return sections

# print(detect_sections(text))
