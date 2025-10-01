from agents.jd_extractor import jd_extractor
from agents.jd_skill_extractor import  extract_skills_llm

if __name__ == "__main__":
    jd_text = jd_extractor("utils/jd.pdf",input_type="pdf")
    # skills = extract_skills(jd_text)
    llm_skills = extract_skills_llm(jd_text)
    # print("Extracted Skills (NER Model):", skills)
    print("Extracted Skills (LLM):", llm_skills)