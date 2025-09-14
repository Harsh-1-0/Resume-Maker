from extractors.pymupdf_extractor import extract_with_pymupdf
from processors.section_detector import detect_sections

# pdf_path="extractors/resume.pdf"

def parse_resume(pdf_path):
    # Step 1: Extract text
    text = extract_with_pymupdf(pdf_path)
    
    # Step 2: Detect sections
    sections = detect_sections(text)
    
    return sections


if __name__ == "__main__":
    pdf_path = "extractors/resume1.pdf"   # adjust path to your test resume
    result = parse_resume(pdf_path)
    
    # Pretty print
    import json
    print(json.dumps(result, indent=4))
