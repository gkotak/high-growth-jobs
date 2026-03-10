# Epic: Admin Portal (Control Center)

## Overview
As the platform grows, we need a "God Mode" view to monitor data health, verify the performance of the scrapers, and manually intervene when a company's job board needs an immediate update.

**Route:** `/admin` (Initially unprotected)

## User Stories
- **As an admin**, I want to see a list of all companies in the system, including when they were last scraped and how many active jobs they have.
- **As an admin**, I want to click into a company and see the full list of its jobs (including those that might be hidden or pending deep scrape).
- **As an admin**, I want a "Force Scrape" button next to each company that triggers a real-time Discovery (Phase 1) and Enrichment (Phase 2) pass.
- **As an admin**, I want to see the "Deep Scrape" status of individual jobs and trigger a manual enrichment if the AI failed or was skipped.

## Requirements

### 1. Frontend: Navigation & Tables
- [ ] **Admin Layout**: A sidebar or header that separates the `/admin` view from the public `/` view.
- [ ] **Company Management Table**: 
  - Columns: Name, Website, Last Scraped At, Job Count, Needs Deep Scrape Count.
  - Action: "Refresh Scrape" icon/button.
- [ ] **Job Management Table**:
  - A global view of all jobs sorted by `created_at`.
  - Columns: Title, Company, Status (Active/Inactive), Scrape Status (Shallow vs Deep).
  - Action: "Deep Scrape Now" button for Phase 2.

### 2. Backend: Admin API Surface & Task Management
- [ ] `GET /api/admin/stats`: Summary counts of companies and jobs.
- [ ] `GET /api/admin/companies`: Paginated list of companies with ingestion metadata.
- [ ] **Throttled Task Queue**: 
    - Use an `asyncio.Semaphore(3)` to allow up to 3 parallel scrapes at once.
    - Subsequent clicks are queued in memory.
- [ ] `POST /api/admin/companies/{company_id}/scrape`: 
    - Triggers the `JanitorService` to run a Phase 1 + Phase 2 loop for the specific company.
    - Returns `{ status: "queued", position: X }` to the frontend.
- [ ] `POST /api/admin/jobs/{job_id}/enrich`: Triggers individual LLM extraction for a specific job.

### 3. Polish & Monitoring
- [ ] **Task Feedback**: Use real-time status updates (polling or WebSockets) to show:
    - ⏳ **Queued**: Waiting for a slot.
    - 🔍 **Discovery (Phase 1)**: Browser active.
    - 🧠 **Enriching (Phase 2)**: AI active.
    - ✅ **Success**: Updated log snippet.
- [ ] **Last Scraped Feedback**: Ensure the `last_scraped_at` timestamp updates in the UI in real-time or upon refresh.

## Design Suggestions (The "Antigravity" Twist)
- **Status Pills**: Use distinct status pills for jobs: `Shallow` (Phase 1 done), `Enriched` (Phase 2 done), `Failed` (AI error).
- **Scrape Log**: Since we are doing this for debugging, showing a small "Latest Scrape Log" snippet for the company (success vs error) would be extremely helpful.

## Definition of Done
- Admin can successfully trigger a scrape for "Anthropic" from the UI and see the new jobs appear in the table.
- A functional `/admin` route exists with a distinct, data-heavy dashboard aesthetic.
- Backend handles manual scrape requests without blocking the main event loop.
