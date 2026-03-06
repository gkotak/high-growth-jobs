# Epic: Company Ingestion & VC Metadata (Epic 1)

## Overview
Establish the "Source of Truth" for high-growth, VC-backed startups. This epic focuses on maintaining the directory of companies that satisfy our "High Growth" criteria.

## Objectives
- Build a robust schema for Company entities (Metadata, Funding, Investors).
- Support manual bulk ingestion (V1) and automated discovery/refresh (V2).

## Requirements

### V1: Manual Seed Ingestion
- [ ] **Technical Source of Truth**: Define the `Company` model in `models.py`.
- [ ] **CSV/JSON Import**: Create a management script to ingest a seed list of startups provided by the USER.
- [ ] **Metadata Mapping**: Capture `company_name`, `domain_url`, `total_raised`, `last_funding_round`, and `top_investors`.

### V2: Automated Discovery (Refresh)
- [ ] **VC Portfolios**: Inbound adapter to crawl/scrape top-tier VC portfolio pages (e.g., Sequoia, a16z, Benchmark).
- [ ] **Crunchbase/Pitchbook Integration**: (Pending API choice) Automated refresh of funding amounts and headcount growth.
- [ ] **Verification Logic**: AI-assisted filter to ensure the company fits the "High Growth" profile based on recent news or signals.

## Data Model (Proposed)
- `name`: string
- `website_url`: url
- `career_page_url`: url (The primary target for Epic 2)
- `total_funding`: decimal
- `investors`: list[string]
- `last_updated`: datetime

## Definition of Done
- Database contains ~100+ seed startups with funding data.
- Management endpoint exists to add/edit company metadata.
- Multi-tenancy (tenant_id) is enforced on all company data.
