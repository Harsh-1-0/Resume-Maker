# from transformers import AutoTokenizer, AutoModelForTokenClassification, pipeline

# MODEL_NAME = "jcklie/skill-extraction"

# tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
# model = AutoModelForTokenClassification.from_pretrained(MODEL_NAME)

# skill_pipeline = pipeline("ner", model=model, tokenizer=tokenizer, aggregation_strategy="simple")

# def extract_skills(text):
#     """
#     Extract skills from the given text using a pre-trained NER model.

#     Args:
#         text (str): The input text from which to extract skills.

#     Returns:
#         List[str]: A list of extracted skills.
#     """
#     ner_results = skill_pipeline(text)
#     skills = [result['word'] for result in ner_results if result['entity_group'] == 'SKILL']
#     return skills

import requests
import json

OLLAMA_URL = "http://127.0.0.1:11434"
MODEL_NAME = "llama3"

def extract_skills_llm(text, max_tokens=512, temperature=0.0):
    prompt = f"""
        You are an expert resume/job description parser. 
        Extract only the skills from the following job description.
        Give detailed summery of the job description which can help identify similar kind of jobs.
        
        ⚠️ Important rules:
        - Output must be valid JSON only (no explanations, no extra text). 
        - Use only keywords (single words or short phrases). 
        - Do not include full sentences or descriptions. 
        - Categorize skills into "required_skills" and "soft_skills".

        Format the output exactly as:
        {{
            "required_skills": ["skill1", "skill2", "skill3"],
            "soft_skills": ["skillA", "skillB"],
            "job_summary": "A brief summary of the job description goes here."
        }}
        JD: {text}
    """
    url = f"{OLLAMA_URL}/api/generate"
    data = {
        "model": MODEL_NAME,
        "prompt": prompt,
        "max_tokens": max_tokens,
        "temperature": temperature
    }

    resp = requests.post(url, json=data, stream=True, timeout=6000)
    resp.raise_for_status()

    output = ""
    for line in resp.iter_lines():
        if line:
            obj = json.loads(line.decode("utf-8"))
            if "response" in obj:
                output += obj["response"]
            if obj.get("done", False):
                break

    # Try parsing final output as JSON
    try:
        return json.loads(output)
    except json.JSONDecodeError:
        return {"raw_output": output}

    