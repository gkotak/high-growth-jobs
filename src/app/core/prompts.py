# Centralized Prompts for all Agentic Evaluation and Extraction Tasks
# Moving these here ensures easy migration to an evaluation framework like LangFuse in the future.

# --- PRE-COMMIT PRE-FLIGHT ---
AI_PRE_COMMIT_REVIEW_PROMPT = """
You are an expert Senior Staff Software Engineer reviewing a Git commit.
Review the following split git diff.

Identify ANY of the following:
1. Security vulnerabilities (especially secrets/API keys left in code).
2. Obvious bugs, syntax errors, or logic errors.
3. Severe performance bottlenecks.

If the code looks good and has no critical issues, ONLY output "PASS".
If there are critical issues that should block this commit, output "FAIL" followed by a concise bulleted list explaining why.

Git Diff:
```diff
{diff_text}
```
"""

# --- EPIC 2: PORTFOLIO DISCOVERY ---
PORTFOLIO_EXTRACTION_PROMPT = """
You are an expert data extractor. I am giving you the text content of the {vc_name} venture capital 'Portfolio' web page.

Extract a list of every single startup / company listed as an investment.
If a URL for the company is provided on the page (or you can confidently deduce their primary URL), include it.
If a short description is provided next to the name, include it.

PAGE TEXT:
{text_preview}
"""

# --- EPIC 3: JOB LISTING DISCOVERY (MULTIPASS SCRAPING) ---
MULTIPASS_NAVIGATION_PROMPT = "Given these UI elements found on a career site's landing page, return the TEXT of the one most likely to lead to a list of ALL job openings or a 'Search jobs' view. If already looking at a list of job titles, return 'NONE'. \n\nElements: {elements}"

MULTIPASS_JOB_EXTRACTION_SYSTEM = "You are an expert at extracting job listings from website content. Return a JSON list of jobs found."

MULTIPASS_JOB_EXTRACTION_USER = "Extract all job listings from this content. Ensure URLs are absolute using {base_url} if needed. \n\nContent:\n{clean_text}"
