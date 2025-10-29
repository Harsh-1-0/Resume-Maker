import os
from dotenv import load_dotenv
import requests
import json

load_dotenv()

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


def search_jobs(summary, sites=None, limit=10, provider="google", api_key=None, cx=None, serper_api_key=None):
  """
  Search for job postings similar to a job description summary across popular job portals.

  Parameters:
    - summary (str): short job description or summary to search for
    - sites (list|None): list of site domains to restrict search to (examples: "linkedin.com/jobs").
               If None, defaults to a curated list of popular job portals.
    - limit (int): maximum number of job results to return (default 10)
    - provider, api_key, cx, serper_api_key: forwarded to `web_search` (same semantics)

  Returns:
    - list of dicts: [{"title":..., "link":..., "snippet":..., "source":...}, ...]

  Notes:
    - This function uses the existing `web_search` function. For reliable results use the
    Google Custom Search provider and set `GOOGLE_API_KEY` and `GOOGLE_CX` env vars.
    - The function performs basic filtering and deduplication of links.
  """
  # reasonable default job portals
  if sites is None:
    sites = [
      "linkedin.com/jobs",
      "indeed.com",
      "glassdoor.com",
      "monster.com",
      "dice.com",
      "angel.co",
    ]

  if not isinstance(sites, (list, tuple)):
    raise ValueError("`sites` must be a list or tuple of site domain strings")

  # Build a site-scoped search query: include each site as `site:domain` joined by OR
  site_query = " OR ".join(f"site:{s}" for s in sites)
  query = f"{summary} {site_query}".strip()

  # Use the existing web_search function to perform the query
  results = web_search(query, provider=provider, api_key=api_key, cx=cx, serper_api_key=serper_api_key)

  # Filter, dedupe and attach a source field
  out = []
  seen = set()
  # Normalize site base domains for simple membership checks
  site_bases = [s.split('/')[0] for s in sites]

  for item in results:
    link = item.get("link")
    if not link:
      continue
    # remove query string and trailing slash for dedupe
    norm = link.split('?')[0].rstrip('/')
    if norm in seen:
      continue

    # check whether the link belongs to one of the requested sites
    if not any(base in link for base in site_bases):
      # skip results that do not match our chosen portals
      continue

    # determine source domain (first matching)
    source = next((base for base in site_bases if base in link), None)

    seen.add(norm)
    entry = {
      "title": item.get("title"),
      "link": link,
      "snippet": item.get("snippet"),
      "source": source,
    }
    out.append(entry)
    if len(out) >= int(limit):
      break

  return out

if __name__ == "__main__":
    # Example usage
    summary = "Associate Developer role at Sapiens, focusing on development, testing, and documentation of software products in an Agile/Scrum team."
    jobs = search_jobs(summary, limit=10, provider="google")
    print(json.dumps(jobs, indent=2))