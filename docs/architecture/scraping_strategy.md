# HighGrowthJobs Scraping Strategy

This document defines the "Hierarchy of Efficiency" used by the `MarketScraper` to ingest job data from diverse startup websites.

## 1. The Multi-Level Hierarchy

We use a tiered approach to maximize speed and minimize compute/LLM costs.

| Level | Name | Technology | Trigger Condition | Cost/Speed |
| :--- | :--- | :--- | :--- | :--- |
| **Level 0** | **ATS Linker** | `HTTpx` (JSON) | URL contains `greenhouse`, `lever`, or `ashby`. | Fastest / Free |
| **Level 0.5**| **Proactive Probe** | `HTTpx` (Guessing) | Custom domains. We guess slugs (e.g. `openai`) against known APIs. | Ultra-Fast |
| **Level 1** | **Static Scrape** | `HTTpx` + `BS4` + `Gemini` | Custom URL, no JS execution required. | Fast / Low Token Cost |
| **Level 2** | **Agentic Browser** | `Playwright` + `Gemini` | JS Wall detected (403, empty body, or React app). | Slower / Higher Cost |

---

## 2. Scraping Flow (The "Multipass")

1. **Detection**: Orchestrator checks for known ATS signatures. If found, use **Level 0**.
2. **Attempt 1 (Static)**: Try to fetch raw HTML.
    - If successful and content is structured -> Use **Level 1** (LLM Extraction).
    - If `403 Forbidden` or "Enable JS" detected -> **Escalate**.
3. **Attempt 2 (Agentic Browser)**: Boot Headless Playwright.
    - **Navigation**: Ask Gemini to identify the "See All Jobs" button from a page snapshot.
    - **Extraction**: Wait for DOM renders, then use **Level 2** (LLM Extraction).

---

## 3. Scraper vs. Janitor (Roles & Responsibilities)

### The Scraper (Atomic Action)
- **Role**: The "Special Agent."
- **Input**: A URL.
- **Output**: A raw list of `Job` objects.
- **State**: Stateless. It doesn't care about what happened yesterday.

### The Janitor (System Orchestration)
- **Role**: The "Database Manager."
- **Input**: The entire `Company` table.
- **Workflow**: 
    1. Selects companies with `last_scraped_at > 24 hours ago`.
    2. Calls the Scraper for each.
    3. **Deduplication**: Compares current result to existing DB entries.
    4. **CRUD**: Inserts new jobs, deletes/archives stale jobs.
    5. Updates the master signal (e.g., `Job Velocity Score`).
