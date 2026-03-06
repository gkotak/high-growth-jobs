# Epic 2: Portfolio Company Discovery

## Overview
Once the system has a curated list of Top VC firms (from Epic 1), we need to extract the "Winners." This epic will use AI-driven scraping techniques to visit each VC firm's portfolio page, discover the companies they back, and insert them into our primary `Company` database table.

## Objectives
- Build an Agentic Scraper capable of navigating VC portfolio websites (e.g., `a16z.com/portfolio`).
- Extract company names and domains accurately from non-standardized portfolio grids.
- Automatically link each company to the VC firm that backs it.

## Functional Requirements

### 1. The Portfolio Scraper
- **Input**: The `VCFirm` database (list of ~200 top VCs and their websites).
- **Execution**: Point Playwright to the VC's portfolio URL (often `/portfolio` or `/companies`).
- **Extraction**: Gemini will take the HTML structure of the page, locate the list of companies, and extract:
  - `company_name`
  - `website_url`
  - `description` (if available)

### 2. Company Ingestion Logic
- **De-duplication**: If multiple top VCs back the same startup, we must not create duplicate companies. We update the existing company record and link the new VC firm.
- **Data Model update (`models.py`)**:
    - Update the `Company` model to relate back to our new `VCFirm` model (Many-to-Many or a simple JSON array depending on DB constraints).

## Definition of Done
- Database is populated with 10,000+ unique startups sourced exclusively from the "Top 200" VC firms in Epic 1.
- A background or CLI script (`scripts/scrape_portfolios.py`) can be triggered against any `VCFirm.id`.
