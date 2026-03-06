# Current State: HighGrowthJobs

**Last Updated**: 2026-03-06

## 1. Phase: Ingestion & Scaffolding
We have completed the core scraping engine and the background "Janitor" service. The system is now capable of ingesting high-volume job data from top-tier startups.

## 2. Key Achievements
- **Multi-Level Scraper**: Built a 4-speed hierarchy (API -> Proactive Probe -> Static -> Browser).
- **Agentic Navigation**: Implemented Level 2 Logic that uses Gemini to "click" through landing pages.
- **Janitor Service**: Created the background synchronization loop that handles deduplication (New/Closed jobs).
- **Core Database**: Established SQLModel-based Postgres schema in Supabase.
- **Data Load**: 1,600+ real jobs ingested from OpenAI (616), Stripe (569), and Anthropic (451).

## 3. Tech Stack
- **Backend**: FastAPI / Python
- **Database**: PostgreSQL (SQLModel / Alembic)
- **Scraping**: HTTpx + Playwright (Stealth)
- **AI**: Gemini 2.0 / 1.5 (via Instructor)

## 4. Pending Tasks
- [ ] **Epic 1: VC Firm Ingestion**: Curate the Top 200 VC firms + USER's personal network (Contacts).
- [ ] **Epic 2: Portfolio Company Discovery**: Build the agentic portfolio scraper to find all startups backed by Epic 1 VCs.
- [ ] **Epic 3: Job Scraping Engine**: (V1 completed for OpenAI, Stripe, Anthropic - Need to scale to the 10,000+ Epic 2 companies).
- [ ] **Epic 4: Discovery UI**: Build the searchable frontend for users to filter by "Growth Signal".
- [ ] **Railway Deployment**: Finalize automation of the Janitor cron task.
