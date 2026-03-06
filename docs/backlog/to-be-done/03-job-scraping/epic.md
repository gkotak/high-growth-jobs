# Epic: Automated Job Scraping & Normalization (Epic 2)

## Overview
Automate the extraction of job listings from individual startup career pages. Convert messy, unstructured job posts into a uniform, searchable format.

## Objectives
- Extract job data from diverse sources (Lever, Greenhouse, Workday, Custom portals).
- Normalize job attributes (Seniority, Function, Salary) using AI.

## Requirements

### Ingestion Adapters (The Edges)
- [ ] **Lever/Greenhouse Linker**: Auto-detect if a startup uses common ATS platforms and use their public APIs/Feeds.
- [ ] **Generic Web Scraper**: Fallback browser-based scraper for custom "Careers" pages.
- [ ] **OCR/Vision Sandbox**: Handle job descriptions that are non-standard or heavily formatted.

### HJGPlus Normalization (The Core)
- [ ] **Schema Mapping**: Map raw data to the `JobPost` canonical model.
- [ ] **AI Classifier**: Use LLM to extract:
    - **Functional Area**: (Engineering, Sales, Product, etc.)
    - **Seniority**: (Entry, Mid, Senior, Staff, Executive)
    - **Salary Range**: Extract from text or mark as "Not Specified".
- [ ] **Deduplication**: Logic to handle job posts that are refreshed hourly to avoid duplicates.

## Data Model (Proposed)
- `company_id`: UUID (FK to Company)
- `title`: string
- `location`: string (Remote/Hybrid/Onsite)
- `functional_area`: enum
- `seniority_level`: enum
- `salary_min`: decimal
- `salary_max`: decimal
- `original_url`: url
- `raw_description`: text
- `normalized_description`: text

## Definition of Done
- Successful "End-to-End" crawl of 5 test companies (Greenhouse, Lever, and 1 Custom).
- `JobPost` table populated with normalized attributes.
- Background "Janitor" job successfully orchestrates the scraping frequency.
