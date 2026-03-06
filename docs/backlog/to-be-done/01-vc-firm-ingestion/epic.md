# Epic 1: VC Firm Ingestion

## Overview
The foundation of HighGrowthJobs is tracking the most successful venture capital firms. Epic 1 focuses on building the definitive, automated list of the top VC firms globally, which will later serve as our starting point for discovering high-growth startups.

## Objectives
- Build a comprehensive database of the Top 100 VC firms in the US and the Top 100 in Europe.
- Incorporate a manual mechanism to add custom VC firms that aren't in the Top 200 (if manually curated later).
- Establish the `VCFirm` database entity.

## Functional Requirements

### 1. The Global "Top 200" Ingestion
- **US Top 100**: Scrape/import from authoritative sources (e.g., TIME/Statista's "America's Top VC Firms 2025" or Vestbee US Top 100).
- **EU Top 100**: Scrape/import from authoritative sources (e.g., Dealroom "Prominent Investors EMEA" or Vestbee Europe Top 100).
- **Automation**: Use the existing `MultipassScraperAdapter` to hit the public articles, extract the top 100 names and domains into JSON, and populate the database.

### 2. Manual Custom Additions (V2/Later)
- Provide a simple mechanism or clear process to allow the USER to manually add specific VC firms they are interested in, even if missing from the core Top 200 list.

## Data Model Changes
Add `VCFirm` entity to `models.py`:
- `id`: UUID
- `name`: string
- `website_url`: string
- `region`: string (US, EU, Global)
- `tier`: string (Tier 1, Tier 2, etc.)

## Definition of Done
- Database contains ~200 top-tier VC firms mainly across US and Europe with accurate website URLs.
- A script exists (`scripts/seed_vcs.py`) capable of running the ingestion cleanly.
