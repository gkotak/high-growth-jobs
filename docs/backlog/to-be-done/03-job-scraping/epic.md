# Epic: Automated Job Scraping & Normalization (Epic 3)

## Overview
Automate the extraction of job listings and **full job descriptions** from diverse startup career pages. Convert messy, unstructured job posts into a uniform, searchable format. The architecture relies on a **Dual-Phase Async Pipeline** to separate "Discovery" (finding job links) from "Enrichment" (deep-scraping job bodies without blocking execution).

## Objectives
- Extract both high-level job data (Title, Location) and deep-level data (Requirements, Salary, Full Description) from diverse sources (Lever, Greenhouse, Workday, Custom portals).
- Fix existing Playwright-Async thread crashes to scale the background daemon.
- Implement an ATS Fast-Track to bypass slow browser emulation for structured API portals.
- Normalize job attributes (Seniority, Function, Salary) using AI.

## Requirements

### 1. The Smart Router & ATS Fast-Track (The Edges)
- [ ] **ATS Detector**: Detect if a startup uses common ATS platforms (`greenhouse.io`, `lever.co`).
- [ ] **ATS API Scrapers**: Hit ATS JSON APIs to instantly retrieve Phase 1 and Phase 2 data concurrently, bypassing HTML scraping completely.
- [ ] **Generic Web Scraper**: Fallback browser-based scraper for custom "Careers" pages. Must use pure `async_playwright` to avoid breaking Railway's `asyncio` event loop.

### 2. Dual-Phase Scraping Pipeline (The Engine)
- [ ] **Phase 1: Discoverer Loop**: Scans root career pages finding new `job_url` links. Creates quick DB rows tagged with `needs_deep_scrape=True`.
- [ ] **Phase 2: Enricher Loop**: Continually queries for `needs_deep_scrape=True`. Issues lightweight HTTP GET requests to extract full raw body text. Converts it to `JobDetails` structure.

### 3. HJGPlus Normalization (The Core)
- [ ] **Schema Mapping**: Map raw data to the `Job` and `JobDetails` canonical models.
- [ ] **AI Classifier**: Use LLM to extract Functional Area, Seniority, and Salary Range from text.
- [ ] **Deduplication**: Logic to handle job posts that are refreshed hourly to avoid duplicates.

## Data Model (Proposed Table Additions)
- Expand `Job` table: `needs_deep_scrape` flag.
- New `JobDetails` Table (1-to-1):
  - `job_id`: UUID
  - `description_html`: Raw HTML
  - `description_text`: Clean block text
  - `extracted_requirements`: Text array
  - `extracted_benefits`: Text array

## Definition of Done
- Background "Janitor" runs multiple async loops (Discovery + Enrichment) without crashing.
- Successful "End-to-End" extraction of full job descriptions from 5 test companies (Greenhouse, Lever, and 1 Custom).
- `Job` and `JobDetails` tables populated with normalized attributes.
