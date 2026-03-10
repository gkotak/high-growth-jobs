# HighGrowthJobs Script Guide

This guide provides instructions on how to use the various utility scripts located in the `scripts/` directory for local testing, data ingestion, and maintenance.

## 🚀 Prerequisites

1.  **Environment Variables**: Ensure your `.env` file is populated with `DATABASE_URL` and `OPENAI_API_KEY`.
2.  **Virtual Environment**: Scripts should be run using `uv run` to ensure all dependencies are resolved.

---

## 🏗️ 1. Company & VC Ingestion

### Ingest Axios Pro Rata
Discovers and ingests new venture-funded companies from the latest Axios Pro Rata newsletter.
*   **Usage**: `uv run scripts/ingest_axios_prorata.py [latest | URL]`
*   **Parameters**:
    *   `latest`: Automatically finds and parses the most recent Pro Rata newsletter.
    *   `URL`: A specific Axios Pro Rata newsletter link.
*   **Example**: `uv run scripts/ingest_axios_prorata.py latest`

### Import Companies (Crunchbase CSV)
Bulk imports companies from Crunchbase export files located in `scripts/data/`.
*   **Usage**: `uv run scripts/import_companies_csv.py`
*   **Notes**: Expects files matching `crunchbase_companies_new_*.csv` in the `scripts/data/` folder.

### Import VC Firms (Crunchbase CSV)
Bulk imports VC firms from a master Crunchbase export.
*   **Usage**: `uv run scripts/import_vcfirms_csv.py`
*   **Notes**: Expects `scripts/data/crunchbase_vc_firms_830.csv`.

---

## 🧹 2. Scraping & Enrichment

### Target Company Scrape (Phase 1)
Forces a fresh scrape of a specific company's career page, bypassing the 7-day "Smart Skip" rule.
*   **Usage**: `uv run scripts/scrape_company.py "Company Name or URL"`
*   **Example**: `uv run scripts/scrape_company.py "Anthropic"`

### Job Enrichment (Phase 2)
Manually triggers the "Deep Scrape" (LLM extraction) for pending jobs in the database.
*   **Usage**: `uv run scripts/enrich_jobs.py [--limit N]`
*   **Parameters**:
    *   `--limit`: Maximum number of jobs to process (default: 5).
*   **Example**: `uv run scripts/enrich_jobs.py --limit 10`

### Janitor Daemon
Runs the full background loop (Discovery + Enrichment) perpetually. This is what runs on Railway.
*   **Usage**: `uv run scripts/janitor.py`

---

## 🛠️ 3. Maintenance & Testing

### AI Pre-Commit Review
Runs an AI-powered code review on your currently staged Git changes.
*   **Usage**: `uv run scripts/ai_pre_commit.py`
*   **Notes**: Returns `FAIL` and blocks the commit if critical issues are found. Use `--no-verify` with `git commit` to bypass in emergencies.

### Clear All Jobs
Deletes all rows from the `Job` and `JobDetails` tables. Use with caution!
*   **Usage**: `uv run scripts/clear_all_jobs.py`

### Test Janitor Sync
Runs a single, non-perpetual pass of the Janitor discovery phase limited to 2 companies.
*   **Usage**: `uv run scripts/test_janitor.py`

---

## 📁 Directory Structure
```text
scripts/
├── data/                       # CSV source files for bulk imports
├── ai_pre_commit.py            # AI code review gatekeeper
├── clear_all_jobs.py           # DB maintenance
├── enrich_jobs.py              # Manual Phase 2 trigger
├── import_companies_csv.py     # Bulk company loader
├── import_vcfirms_csv.py       # Bulk VC loader
├── ingest_axios_prorata.py     # Daily news discovery
├── janitor.py                  # Production background daemon
├── scrape_company.py           # Targeted Phase 1 trigger
└── test_janitor.py             # Lightweight sync test
```
