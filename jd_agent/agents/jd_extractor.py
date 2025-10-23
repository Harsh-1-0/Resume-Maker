import requests
from bs4 import BeautifulSoup
from pdfminer.high_level import extract_text
import docx

def extract_from_url(url):
    resp = requests.get(url,timeout=10)
    soup = BeautifulSoup(resp.content, 'html.parser')
    for tag in soup(["header", "footer", "nav", "script", "style"]):
        tag.extract()
    return soup.get_text(separator=" ")

def extract_from_pdf(path):
    text = extract_text(path)
    return text


def jd_extractor(input_data, input_type="url"):
    if input_type == "url":
        return extract_from_url(input_data)
    elif input_type == "pdf":
        return extract_from_pdf(input_data)
    elif input_type == "text":
        return input_data
    else:
        raise ValueError("Unsupported input type")