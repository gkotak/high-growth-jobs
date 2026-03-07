# Current State: HighGrowthJobs

**Last Updated**: 2026-03-06

## 1. Phase: Ingestion & Seed Data Population
We have completed Epics 1 and 2, transitioning entirely to a robust "Signal-First" ingestion methodology rather than brittle DOM scraping of VC websites. Data mapping is managed through our SQLModel canonical layers, and differential updates handle new signals with high precision.

## 2. Key Achievements
- **VC Firm Seed Ingestion (Epic 1)**: Integrated Crunchbase top VCs utilizing our `/scripts/import_vcfirms_csv.py` batch job. Enabled "Stub Creation" allowing graceful handling of un-seeded niche investors.
- **Company Seed Ingestion & Linkages (Epic 2a)**: Integrated >900 high-growth companies from Crunchbase, dynamically deriving `CompanyVCFirmLink` junction table objects directly from string names in memory.
- **Daily Signal Monitoring (Epic 2b)**: Deployed `scripts/ingest_axios_prorata.py`—an LLM-powered background task (`gpt-4o-mini`) to seamlessly parse unformatted financial newsletter bullets (Axios Pro Rata) and extract structured Pydantic representations of Company Funding rounds (including Seed and Pre-Seed).
- **Multi-Level Scraper Prototype**: Built a 4-speed hierarchy (API -> Proactive Probe -> Static -> Browser) initially. Scaled to handle OpenAI, Stripe, and Anthropic.
- **Core Database**: Established SQLModel-based Postgres schema in Supabase with fully normalized types (Stage, Investment Bounds, CB Rank).

## 3. Tech Stack
- **Backend**: FastAPI / Python
- **Database**: PostgreSQL (SQLModel / Alembic)
- **Scraping/Ingestion**: HTTpx + Playwright (Stealth), plus robust local CSV loaders decoupled from DB locks.
- **AI**: OpenAI `gpt-4o-mini` with Pydantic strict parsing for unstructured text; Gemini 2.0 / 1.5 (via Instructor) for complex site navigation.

## 4. Pending Tasks
- [x] **Epic 1: VC Firm Ingestion**
- [x] **Epic 2: Portfolio Company Discovery**
- [ ] **Epic 3: Job Scraping Engine**: (Scale the V1 prototype across our new 1,000+ Company targets).
- [ ] **Epic 4: Discovery UI**: Build the searchable frontend for users to filter by "Growth Signal".
- [ ] **Epic 5: Network Intelligence**: LinkedIn integration to display referral warmth.
- [ ] **Epic 6: Signal Enrichment**: Ingest contextual quality scores (G2, TrustPilot, etc).
- [ ] **Epic 7: Culture Agent**: Voice AI Agent for culture-focused interview preparation.
