import json
from resumeparser import ats_extractor
from utils import extract_text_from_pdf

if __name__ == "__main__":
    resume_path = "__DATA__/resume.pdf"
    resume_text = extract_text_from_pdf(resume_path)

    parsed_json = ats_extractor(resume_text)

    # 🎨 Pretty print JSON (no more \n mess)
    print(json.dumps(parsed_json, indent=4, ensure_ascii=False))
