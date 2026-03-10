# Centralized Prompts for all Agentic Evaluation and Extraction Tasks
# Moving these here ensures easy migration to an evaluation framework like LangFuse in the future.

# --- PRE-COMMIT PRE-FLIGHT ---
AI_PRE_COMMIT_REVIEW_PROMPT = """
You are an expert Senior Staff Software Engineer reviewing a Git commit.
Review the following split git diff.

Analyze the changes and categorize your findings as follows:

- [CRITICAL]: Security vulnerabilities (secrets/keys), obvious bugs, syntax errors, logic errors, or data integrity risks that MUST be fixed.
- [SUGGESTION]: Code quality improvements, non-blocking optimizations, or style concerns.

---
OUTPUT FORMAT:
- If you find ANY [CRITICAL] issues, or significant [SUGGESTION]s, output "FAIL" followed by your structured list.
- If the code is solid, output "PASS".
---

Git Diff:
```diff
{diff_text}
```
"""



# --- EPIC 3: JOB LISTING DISCOVERY (MULTIPASS SCRAPING) ---
MULTIPASS_LINK_DETECTION_PROMPT = """
You are analyzing the homepage or a landing page of a company's website: {url}
The text content of the page is provided below. 

Your goal: Find a link that leads to their list of job openings (Careers, Jobs, Open Roles, Join Us).

1. If you see a list of individual job titles (e.g. "Software Engineer", "Product Manager"), return 'ALREADY_ON_JOBS_PAGE'.
2. If you find a link to a careers page, return the absolute URL.
3. If no relevant link is found, return 'NONE'.

Output format: JSON with fields 'status' and 'url' and 'reason'.

Content:
{text}
"""

MULTIPASS_NAVIGATION_PROMPT = "Given these UI elements found on a career site's landing page, return the TEXT of the one most likely to lead to a list of ALL job openings or a 'Search jobs' view. If already looking at a list of job titles, return 'NONE'. \n\nElements: {elements}"

MULTIPASS_JOB_EXTRACTION_SYSTEM = "You are an expert at extracting job listings from website content. Return a JSON list of jobs found."

MULTIPASS_JOB_EXTRACTION_USER = "Extract all job listings from this content. Ensure URLs are absolute using {base_url} if needed. If jobs are explicitly grouped by department or function (e.g., under a 'Sales' or 'Engineering' header), ensure you extract that as the department for each job in that group. \n\nContent:\n{clean_text}"

# --- EPIC 3: JOB DEEP SCRAPING (PHASE 2) ---
DEEP_SCRAPE_JOB_DETAILS_SYSTEM = "You are an expert at analyzing job descriptions. Return a JSON object with the requested structural details."

DEEP_SCRAPE_JOB_DETAILS_USER = """Analyze this job description content.
Extract the core job description prose as a plain string, removing website headers, footers, and generic company boilerplate.
Extract requirements as a markdown bulleted list. 
Extract benefits as a markdown bulleted list. 
Determine the functional area (Engineering, Product, Sales, Marketing, Operations, Design, HR, Finance, Other).
Determine the experience level (Intern, Entry, Mid, Senior, Lead, Staff, Director, Executive).
Refine the exact location if clearly stated (e.g., 'New York, NY' or 'San Francisco, CA').
Determine if it is explicitly noted as a remote or remote-friendly role.
Extract the pay range or salary if explicitly mentioned (e.g., '$100k - $150k' or '£50,000 - £70,000'). 
Normalize the job title into a clean version (e.g. 'Software Engineer' instead of 'Ninja Developer').

Content:
{clean_text}
"""
