
from pdfminer.high_level import extract_text

# Using pdfminer.six
def extract_with_pdfminer(path):
    text = extract_text(path)
    return text

# Test
pdf_path = "JD.pdf"
print(extract_with_pdfminer(pdf_path))