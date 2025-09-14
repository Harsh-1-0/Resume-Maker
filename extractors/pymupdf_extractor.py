# install first: pip install pdfminer.six pymupdf

import fitz  # PyMuPDF


# Using PyMuPDF
def extract_with_pymupdf(path):
    doc = fitz.open(path)
    text = ""
    for page in doc:
        text += page.get_text("text")  # preserves layout more than pdfminer
    return text

# Test
pdf_path = "extractors/resume1.pdf"
# print(extract_with_pymupdf(pdf_path))
