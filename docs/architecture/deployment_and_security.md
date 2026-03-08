# Deployment and Security Architecture

## 1. Overview
HighGrowthJobs utilizes a **Dual-Speed Infrastructure** model designed to balance high-speed user interactivity (Vercel) with heavy-duty background intelligence (Railway/Scrapers).

## 2. The "Backend Gateway" Security Model
The system explicitly avoids direct browser-to-database communication (e.g., direct Supabase Client) to maintain tight control over AI logic and data integrity.

### Data Flow
`User Browser` --> `FastAPI (Vercel)` --> `SQLModel/PostgreSQL (Supabase)`

### Security Constraints
- **Secrets Isolation**: Only variables prefixed with `VITE_` are exposed to the client-side JavaScript. 
- **Server-Side Secrets**: `DATABASE_URL`, `OPENAI_API_KEY`, and `GEMINI_API_KEY` are kept strictly in the Vercel/Railway server memory. They are never transmitted to the browser.
- **The Bouncer Pattern**: The FastAPI layer enforces business logic and prevents raw database access. Even with a valid database URL, an external attacker cannot bypass the API's defined endpoints without bypassing Vercel's secure environment.

## 3. Infrastructure Split

### A. The "Discovery UI" (Vercel)
- **Role**: Serves the React frontend and the FastAPI REST endpoints.
- **Architecture**: Serverless (AWS Lambda backend).
- **Optimization**: Optimized for < 1s response times for search and filtering.
- **Limit**: Strictly enforces a 10-60s execution timeout.

### B. The "Janitor Service" (Railway/Local)
- **Role**: Orchestrates high-latency tasks: Axios news ingestion, MarketScraper (Playwright), and AI signal enrichment.
- **Architecture**: Persistent Container (Docker).
- **Optimization**: Pre-baked with Google Chrome/Playwright binaries to avoid cold-start delays in scraping.
- **Capability**: No timeout; can run for hours if processing massive job boards.

## 4. Environment Checklist for Engineers
| Key | Type | Audience | Use Case |
| :--- | :--- | :--- | :--- |
| `DATABASE_URL` | Secret | Server-Only | Connection to primary PostgreSQL. |
| `OPENAI_API_KEY` | Secret | Server-Only | LLM-based data normalization. |
| `VITE_SUPABASE_URL` | Public | Client/Server | Supabase metadata. |
| `VITE_SUPABASE_ANON_KEY` | Public | Client/Server | Publishable key for future Auth/RLS. |

---
**Verification Date**: 2026-03-08
**Architectural Approval**: AI Agent (Antigravity)
