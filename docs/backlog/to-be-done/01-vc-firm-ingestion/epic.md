# Epic 1: VC Firm Ingestion (Signal-First)

## Overview
The foundation of HighGrowthJobs is tracking the most successful venture capital firms. Instead of relying on manual lists or brittle web scraping, Epic 1 focuses on building the definitive automated list of top VC firms by bulk-ingesting high-signal data directly from Crunchbase exports.

## Objectives
- Build a comprehensive database of top VC firms globally using official Crunchbase CSV exports.
- Establish a robust `VCFirm` database entity that can track macro-level investor signals (number of investments, exits, ranking).
- Create a repeatable script to update investor metrics periodically via CSV drops.

## Functional Requirements

### 1. Crunchbase Bulk Ingestion
- **Static CSV Source:** Use a provided CSV file (e.g., `scripts/data/crunchbase_vc_firms_830.csv`).
- **Automation:** A Python script (`scripts/import_vcfirms_csv.py`) reads the CSV file and populates the PostgreSQL database.
- **De-duplication & Upserting:** The script must match existing firms by `Organization/Person Name` or `Website`. Uses an "Upsert" mechanism to update their latest stats (like Number of Investments or CB Rank) without creating duplicates.

### 2. Supported Data Columns
The ingestion script must parse and map the following columns from the Crunchbase format:
- Organization/Person Name
- Number of Portfolio Organizations
- Investor Type
- Number of Investments
- Number of Exits
- Location
- Website
- CB Rank (Investor)

## Data Model Changes
Update `VCFirm` entity in `models.py` to include:
- `id`: UUID
- `name`: string
- `website_url`: string
- `num_portfolio_orgs`: integer
- `investor_type`: string
- `num_investments`: integer
- `num_exits`: integer
- `location`: string
- `cb_rank`: integer

## Definition of Done
- Database contains hundreds of top-tier VC firms with accurate metrics and website URLs.
- A script exists (`scripts/import_vcfirms_csv.py`) capable of running the ingestion cleanly via CSV.
