# Epic 2: Portfolio Company Discovery

## Overview
Once the system has a curated list of Top VC firms (from Epic 1), we need to extract the "Winners." This epic will use AI-driven scraping techniques to visit each VC firm's portfolio page, discover the companies they back, and insert them into our primary `Company` database table.

## Objectives
- Build an Agentic Scraper capable of navigating VC portfolio websites (e.g., `a16z.com/portfolio`).
- Extract company names and domains accurately from non-standardized portfolio grids.
- Automatically link each company to the VC firm that backs it.

## Functional Requirements

### 1. The Portfolio Scraper (Differential Ingestion)
- **Input**: The `VCFirm` database (list of ~200 top VCs and their websites).
- **Execution**: Point Playwright to the VC's portfolio URL.
- **HTML Hashing (State Detection)**: Before running the expensive AI extraction, compute a hash of the portfolio page's raw HTML.
    - If `new_hash == old_hash`: Skip extraction (no new investments detected).
    - If `new_hash != old_hash`: Trigger deep Agentic Extraction.
- **Weekly Refresh**: The orchestrator runs once a week, but only spends tokens on VCs that have updated their portfolio sites.
- **Extraction**: OpenAI (`gpt-4o-mini`) will take the HTML structure, locate the list of companies, and extract:
  - `company_name`
  - `website_url`
  - `description`

### 2. Company Ingestion Logic
- **De-duplication**: If multiple top VCs back the same startup, link the new VC firm to the existing company record.
- **Data Model update (`models.py`)**:
    - Update `VCFirm` with `portfolio_html_hash` and `last_scraped_at`.
    - Implement a Many-to-Many junction table between `Company` and `VCFirm`.

## Definition of Done
- Database is populated with 10,000+ unique startups sourced exclusively from the "Top 200" VC firms in Epic 1.
- A background or CLI script (`scripts/scrape_portfolios.py`) can be triggered against any `VCFirm.id`.
