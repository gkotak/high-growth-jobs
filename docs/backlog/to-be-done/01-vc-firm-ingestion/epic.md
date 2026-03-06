# Epic 1: VC Firm Ingestion

## Overview
The foundation of HighGrowthJobs is tracking the most successful venture capital firms. Epic 1 focuses on building the definitive, automated list of the top VC firms globally, which will later serve as our starting point for discovering high-growth startups.

## Objectives
- Build a comprehensive database of the Top 100 VC firms in the US and the Top 100 in Europe.
- Incorporate a custom list of VC firms based on the USER's personal network (contacts import).
- Establish the `VCFirm` database entity.

## Functional Requirements

### 1. The Global "Top 200" Ingestion
- **US Top 100**: Scrape/import from authoritative sources (e.g., TIME/Statista's "America's Top VC Firms 2025" or Vestbee US Top 100).
- **EU Top 100**: Scrape/import from authoritative sources (e.g., Dealroom "Prominent Investors EMEA" or Vestbee Europe Top 100).
- **Automation**: Use the existing `MultipassScraperAdapter` to hit the public articles, extract the top 100 names and domains into JSON, and populate the database.

### 2. Network-Driven Ingestion (User Contacts)
- **File Upload / Importer**: A mechanism (script or endpoint) to ingest a CSV/JSON of the USER's personal contacts.
- **Matching**: Read the contact's company/VC firm and ensure it is added to the `VCFirm` database (if not already present from the Top 200 list). Tag these firms specifically as "Network Connection".

## Data Model Changes
Add `VCFirm` entity to `models.py`:
- `id`: UUID
- `name`: string
- `website_url`: string
- `region`: string (US, EU, Global)
- `tier`: string (Tier 1, Tier 2, etc.)
- `is_network_connection`: boolean (True if sourced from user's contacts)

## Definition of Done
- Database contains ~200 top-tier VC firms with accurate website URLs.
- The USER's contact list has been parsed, and their associated VC firms are added/tagged in the database.
- A script exists (`scripts/seed_vcs.py`) capable of running the ingestion cleanly.
