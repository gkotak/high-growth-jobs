# HighGrowthJobs Scraping Strategy

This document defines the architecture used by the `MarketScraper` to ingest job data from diverse startup websites efficiently, and the `JanitorDaemon` that orchestrates this process in the background.

## 1. The Multi-Level Hierarchy (The "Multipass")

We use a tiered approach to maximize speed and minimize compute/LLM costs. Every scrape attempt starts at the cheapest, fastest tier and only escalates if necessary.

| Level | Name | Technology | Trigger Condition | Cost/Speed |
| :--- | :--- | :--- | :--- | :--- |
| **Level 0** | **ATS Linker** | `HTTpx` (JSON) | URL contains `greenhouse`, `lever`, or `ashby`. | Fastest / Free |
| **Level 0.5**| **Proactive Probe** | `HTTpx` (Guessing) | Custom domains. We guess slugs (e.g. `openai`) against known APIs. | Ultra-Fast |
| **Level 1** | **Static Scrape (BS4)** | `HTTpx` + `BS4` + LLM | Custom URL, no JS execution required. | Fast / Low Token Cost |
| **Level 1.5**| **AI Link Hopping** | `HTTpx` + `BS4` + LLM | Static page loaded, but no jobs found. AI finds "Careers" link. | Fast / Med Token Cost |
| **Level 2** | **Agentic Browser** | `Playwright` + LLM | JS Wall detected, lazy loading, or heavily dynamic SPA. | Slower / High Cost |

---

## 2. Smart Skip (Content Hashing optimization)

To avoid redundant AI extraction and Playwright runs, we employ a **Content Hashing** strategy:

1. During a `Static Scrape` (Level 1) or browser load (Level 2), the system extracts the visible text of the page.
2. A SHA-256 hash of this text is generated.
3. If this new hash matches the `last_content_hash` stored on the `Company` record, the system immediately halts the scrape for that company and returns `0` new jobs. 
4. This ensures we only pay for AI extraction and browser compute when a company *actually changes* their careers page.

---

## 3. Scraper vs. Janitor (Roles & Responsibilities)

### The Scraper (Atomic Action)
- **Role**: The "Special Agent."
- **Input**: A URL and an optional `current_hash`.
- **Output**: A raw list of `Job` objects and a `new_hash`.
- **Logic**: Executes the Multipass hierarchy (Levels 0 through 2).

### The Janitor Service (System Orchestration)
- **Role**: The "Database Manager."
- **Workflow**: 
    1. Selects priority companies sorted by `cb_rank` ascending.
    2. Only selects companies where `last_scraped_at` is NULL or older than 7 days.
    3. Calls the Scraper for each, passing in the `last_content_hash` for the Smart Skip optimization.
    4. **Deduplication / Sync**: Compares current result to existing DB entries. Inserts NEW jobs, marks missing jobs as CLOSED.
    5. Updates `last_scraped_at` and `last_content_hash`.

### The Janitor Daemon (Railway Background Worker)
- **Role**: The "Always-On Engine."
- **Workflow**:
    1. Runs continuously in a Docker container on Railway.
    2. Executes the Janitor Service for a batch of `JANITOR_LIMIT` companies (default 100).
    3. Sleeps for `JANITOR_INTERVAL_SECONDS` (default 3600s / 1 hour) before processing the next batch.
    4. This prevents system overload, respects rate limits, and safely chunks the massive dataset.

### Manual Overrides
A targeted script (`scripts/scrape_company.py`) exists to bypass the 7-day rule and the Smart Skip hash, allowing for immediate, forced re-scraping of a specific company by name or URL. Used for testing and immediate data refresh needs.
