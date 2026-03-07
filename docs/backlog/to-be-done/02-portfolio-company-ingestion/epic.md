# Epic 2: High-Growth Company Discovery & Signal Enrichment

## Overview
Once the system has a curated list of Top VC firms (from Epic 1), we need to extract the "Winners." This epic abandons brittle web scraping of VC portfolio pages in favor of robust, structured CSV bulk-ingestion (Crunchbase) combined with high-frequency, AI-driven delta updates via the Axios Pro Rata newsletter. This guarantees accurate metadata (Funding Rounds, Valuation Data, Lead Investors) while massively reducing scraping failures.

## Objectives
- Build an ingestion engine to import rich company profiles and funding signals directly from Crunchbase exports.
- Build an intelligent "Signal Watcher" to parse daily financial newsletters and identify new, relevant funding events.
- Automatically link each company via a Many-to-Many junction to the VC firm that backs it based on parsed text.

## Functional Requirements

### 1. The Bulk Crunchbase Loader
- **Input:** A provided CSV file (e.g., `scripts/data/crunchbase_companies_968.csv`).
- **Execution:** A Python script (`scripts/import_companies_csv.py`) reads the file, parses columns, and handles database operations.
- **De-duplication:** Upsert companies based on `Organization Name` and `Website`.
- **Many-to-Many Linking:** 
  - Collapse and de-duplicate the "Top 5 Investors" and "Lead Investors" columns.
  - Look up matching entities in the `VCFirm` table.
  - Populate the `CompanyVCFirmLink` junction table. Create "Stub" VCFirm records if an investor doesn't exist yet.

### 2. The Axios Pro Rata Daily Signal Ingestion
- **Input:** The HTML view of the daily Axios Pro Rata newsletter (specifically the "Venture Capital Deals" section).
- **Execution:** A scheduled background script (`scripts/ingest_axios_prorata.py`).
- **Extraction:** Use `gpt-4o-mini` with strict structured output parsing logic to read the newsletter's conversational bullet points.
- **Data Capture Elements:**
  - Company Name & Target Website URL
  - Size of the funding round (Extracted as raw number / string text)
  - Funding Stage (e.g., Series A, Seed)
  - Date (assumed from publication date)
  - List of Investors mentioned
- **Database Upsert:** Search for the company. If it exists, overwrite/update `total_funding_amount`, `last_funding_date`, `stage`. If missing, insert as a new company record, and create linking structures for the mentioned investors.

## Data Model Changes
Update the `Company` model in `models.py`:
- `last_funding_date`: date/datetime
- `total_funding_amount`: string or numeric float depending on scaling
- `stage`: string
- `industries`: string
- `location`: string (Headquarters location)
- `estimated_revenue_range`: string
- `cb_rank`: integer

## Definition of Done
- A bulk ingestion script (`scripts/import_companies_csv.py`) successfully populates thousands of high-growth companies with complete metadata and investor linkage.
- An AI-powered newsletter scraper (`scripts/ingest_axios_prorata.py`) correctly identifies and inserts deals daily from Axios outputs.
