import ollama
import json

def ats_extractor(resume_text: str):
    prompt = f"""
    Extract structured JSON from this resume text.
    The JSON should include fields like:
    - name
    - email
    - phone
    - education
    - skills
    - experience
    - projects
    - certifications

    if something is not there make it as "null" or empty list.
    
    Resume:
    {resume_text}
    """

    response = ollama.chat(
        model="llama3",   # you can also try "mistral" or others
        messages=[
            {"role": "system", "content": "You are an ATS resume parser."},
            {"role": "user", "content": prompt},
        ]
    )

        # Ollama response
    raw_output = response["message"]["content"]

    # 🧹 Clean markdown fences and junk
    raw_output = raw_output.strip()
    if "```" in raw_output:
        raw_output = raw_output.split("```")[1]  # extract code block
    raw_output = raw_output.replace("json", "").strip()

    # 🧩 Parse JSON safely
    try:
        parsed_json = json.loads(raw_output)
    except json.JSONDecodeError:
        # Try second cleanup: remove leading text before {
        if "{" in raw_output and "}" in raw_output:
            raw_output = raw_output[raw_output.find("{"): raw_output.rfind("}")+1]
            try:
                parsed_json = json.loads(raw_output)
            except:
                parsed_json = {"raw_output": raw_output}
        else:
            parsed_json = {"raw_output": raw_output}

    return parsed_json
