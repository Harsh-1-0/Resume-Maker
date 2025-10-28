import os
from dotenv import load_dotenv
import requests
import json

load_dotenv()

import requests

import requests

def search_courses(skills):
    """
    Search online courses for each skill using RapidAPI's 'Online Courses API'.
    (https://rapidapi.com/tipsters/api/online-courses15/)
    
    Returns a list of course dictionaries with:
    skill, title, provider, url, and description.
    """
    if not skills:
        return []

    results = []
    seen = set()
    per_skill = 3

    RAPIDAPI_KEY = os.getenv("RAPIDAPI_KEY")  # ✅ consistent env var name

    url = "https://collection-for-coursera-courses.p.rapidapi.com/api/courses/search"  # ✅ full URL

    headers = {
        "x-rapidapi-key": RAPIDAPI_KEY,
        "x-rapidapi-host": "collection-for-coursera-courses.p.rapidapi.com"
    }
    for skill in skills:
        if not skill:
            continue

        try:
            params = {"query": skill}
            resp = requests.get(url, headers=headers, params=params, timeout=10)
            resp.raise_for_status()
            data = resp.json()

            # The API usually returns a "results" or "courses" list
            courses = data.get("results") or data.get("courses") or []

            for course in courses[:per_skill]:
                title = course.get("title") or course.get("name")
                desc = course.get("description") or ""
                link = course.get("url") or course.get("link")
                provider = course.get("source") or course.get("provider") or "Unknown"

                key = (link or title)
                if not key or key in seen:
                    continue
                seen.add(key)
                results.append({
                    "skill": skill,
                    "title": title,
                    "provider": provider,
                    "link": link,
                    "description": desc,
                })

        except Exception as e:
            print(f"[WARN] Failed for skill '{skill}': {e}")
            continue

    return results


def web_search(query, provider="google", api_key=None, cx=None, serper_api_key=None):
    """
    Search the web and return a list of results in a consistent JSON-friendly format.

    Parameters:
      - query (str): search query
      - provider (str): 'google' (uses Google Custom Search JSON API) or 'serper' (uses serper.dev)
      - api_key (str|None): Google API key (optional, falls back to env GOOGLE_API_KEY)
      - cx (str|None): Google Custom Search Engine ID (optional, falls back to env GOOGLE_CX)
      - serper_api_key (str|None): Serper API key (optional, falls back to env SERPER_API_KEY)

    Returns:
      - list of dicts: [{"title":..., "link":..., "snippet":...}, ...]

    Notes:
      - To use Google Custom Search you must enable the Custom Search JSON API and create a CSE (cx).
      - If credentials are missing for the selected provider the function raises ValueError.
    """
    provider = (provider or "google").lower()


    if provider == "google":
        api_key = api_key or os.getenv("GOOGLE_API_KEY")
        cx = cx or os.getenv("GOOGLE_CX")
        if not api_key or not cx:
            raise ValueError("Google provider requires `api_key` and `cx` (set GOOGLE_API_KEY and GOOGLE_CX env vars or pass them as args).")
        url = "https://www.googleapis.com/customsearch/v1"
        params = {"q": query, "key": api_key, "cx": cx}
        resp = requests.get(url, params=params, timeout=10)
        resp.raise_for_status()
        data = resp.json()
        items = data.get("items", [])
        results = []
        for it in items:
            results.append({
                "title": it.get("title"),
                "link": it.get("link"),
                "snippet": it.get("snippet") or it.get("htmlSnippet"),
            })
        return results

    else:
        raise ValueError(f"Unsupported provider: {provider}. Use 'google' or 'serper'.")
    



def recommend_for_skills(
    skills,
    web_provider="google",
    google_api_key=None,
    google_cx=None,
    serper_api_key=None,
    max_web_per_skill=3,
):
    """
    Top-level helper that takes a list of skills, calls `search_courses` and `web_search`,
    and returns a JSON-serializable dict with courses and web search results grouped by skill.

    Enhancements:
      - Web searches are focused on learning resources and certifications.
      - Prioritizes educational domains like Coursera, Udemy, edX, and Google.

    Parameters:
      - skills (list[str])
      - web_provider (str): 'google' or 'serper'
      - google_api_key, google_cx: optional credentials (fallback to env vars)
      - max_web_per_skill (int): number of web results per skill

    Returns:
      - dict: {
          "skills": [...],
          "courses": [...],
          "web": {skill: [results...]},
          "summary": {...}
        }
    """
    if not isinstance(skills, (list, tuple)):
        raise ValueError("skills must be a list of strings")

    # --- Fetch courses (Coursera) ---
    courses = search_courses(skills)

    # --- Web search per skill (targeted for learning + certification content) ---
    web = {}
    for skill in skills:
        if not skill:
            web[skill] = []
            continue

        # Focus search on structured learning and certification sources
        search_query = (
            f"{skill} certification OR online course OR learning resources "
            f"site:coursera.org OR site:udemy.com OR site:edx.org OR site:google.com/learn OR site:linkedin.com/learning"
        )

        try:
            results = web_search(
                search_query,
                provider=web_provider,
                api_key=google_api_key,
                cx=google_cx,
                serper_api_key=serper_api_key,
            )

            if isinstance(results, dict) and "raw" in results:
                web[skill] = [results]
            elif isinstance(results, list):
                web[skill] = results[:max_web_per_skill]
            else:
                web[skill] = [results]

        except Exception as e:
            web[skill] = [{"error": str(e)}]

    # --- Summarize the output ---
    result = {
        "skills": skills,
        "courses": courses,
        "web": web,
        "summary": {
            "num_skills": len(skills),
            "num_courses": len(courses),
            "num_web_sources": sum(
                len(v) if isinstance(v, list) else 1 for v in web.values()
            ),
        },
    }

    return result



if __name__ == "__main__":
    sample_skills = ["Python", "SQL", "JavaScript"]
    out = recommend_for_skills(sample_skills, web_provider="google")
    
    print(json.dumps(out, indent=2))
   


