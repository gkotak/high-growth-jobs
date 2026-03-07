# HighGrowthJobs Project Context

## Overview
**HighGrowthJobs** is an AI-native job intelligence platform designed to connect talent with high-growth, VC-backed startups.

**Tagline:** AI-Powered Job Search for the Next Generation of Tech Leaders.
**Vision:** To become the primary source of truth for "Signal-driven" job searching, automating the discovery of roles at companies with high growth potential.

## The Problem
Passive and active job seekers struggle to filter through the noise of generic job boards (LinkedIn, Indeed). They want jobs at **winning companies** (those with recent high-tier VC funding), but finding these requires a manual "swivel-chair" process of:
1.  Checking VC portfolio pages (a16z, Sequoia, etc.).
2.  Visiting individual startup career pages.
3.  Manually verifying company health signals (G2 scores, growth rates).

## The Solution
HighGrowthJobs proposes an **AI-Agent driven search engine**:
1.  **Ingest:** Automatically discover VC-backed startups and scrape their proprietary career portals (leveraging AI to handle non-standard layouts).
2.  **Normalize:** Use LLMs to standardize job titles, seniority levels, and functional areas across thousands of diverse companies.
3.  **Enrich:** Add "Growth Signals" (Funding, Investor pedigree, Glassdoor/G2 scores) to every job listing.

## Market & Strategy
*   **Target Segment:** Tech talent (Engineers, PMs, Designers) seeking high-impact roles at VC-backed startups.
*   **Differentiation:** 100% focus on "VC-Backed" criteria and AI-driven normalization of "messy" job post data that traditional scrapers miss.

## Project Structure
*   `src/data_model/models.py`: Technical source of truth for the SQLModel entity model.
*   `docs/architecture/`: **CRITICAL.** The architectural source of truth for the platform.
    *   `architecture.md`: Master index and high-level Hexagonal system overview.
    *   `data_flow_diagram.md`: Visual map of Inbound Ports -> Core (HJGPlus) -> Web UI.
*   `docs/backlog/`: Organized product roadmaps and epic specifications (to-be-done/done-done).

## Agent Mandate: Architectural Integrity
The architecture of HighGrowthJobs follows the **Hexagonal Core** pattern.
1.  **Alignment:** Every database change in `models.py` MUST be reflected in the API contract.
2.  **Consistency:** Adhere strictly to the **Dual-Speed Orchestration** pattern (Accelerator for UI events + Janitor for background scraping).
3.  **Source Control:** DO NOT automatically commit or push code. Every commit and push must be explicitly requested and approved by the USER.
4.  **AI Code Review:** ALWAYS run the AI pre-commit code review and **PAUSE to present the full findings** (suggestions/warnings) to the USER before committing. The USER MUST approve the code review outcome before the commit proceeds. If the review returns 'FAIL', the agent MUST address the [CRITICAL] items before requesting approval again.

## Agent Operational Workflow (Chain of Command)
1.  **Product Phase (Skill: `product-manager`):** Define requirements in `docs/backlog/to-be-done/[epic]/`.
2.  **Architecture Phase (Skill: `solution-architect`):** Output a specific **`design.md`** defining the architectural delta.
3.  **Planning Phase (Skill: `tech-lead`):** Translate design into a file-level **`todo.md`** checklist.
4.  **Execution Phase:** Implement, test, and verify. Update global docs as a final step.

## Current Status
*   **Phase:** Initial Scaffolding.
*   **Primary Achievement:** Established the de-branded Agent Skill set and the "Universal Blueprint" directory structure.
*   **Roadmap:**
    1.  **VC Firm Ingestion (Epic 1):** Bulk ingest Top tier Crunchbase VC firms via CSV to act as the primary signaling database.
    2.  **Portfolio Company Discovery (Epic 2):** Bulk ingest Crunchbase Company CSVs, and implement an AI-powered daily pipeline to scrape Axios Pro Rata funding signals.
    3.  **Job Scraping (Epic 3):** Implement the `MarketScraper` to ingest and normalize job posts from our discovered companies.
    4.  **Discovery UI (Epic 4):** Build the searchable "GrowthUI" portal with advanced filtering.
    5.  **Network Intelligence (Epic 5):** LinkedIn integration to discover internal referrals.
    6.  **Signal Enrichment (Epic 6):** Ingest G2/Trustpilot scores and total growth metrics.
    7.  **Culture Agent (Epic 7):** Voice AI Agent for culture-focused interview preparation.

