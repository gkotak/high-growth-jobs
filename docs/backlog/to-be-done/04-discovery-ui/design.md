# Epic 3: Discovery UI - Architectural Design

## 1. System Overview
The Discovery UI (GrowthUI) provides a high-performance browsing experience for job seekers. It connects the **FastAPI Backend** (Core) to a **React (Vite) Frontend** (Inbound Port).

---

## 2. API Design (FastAPI)

### 2.1 `GET /api/v1/jobs`
**Purpose**: Main discovery feed with advanced filtering.
**Query Parameters**:
- `q`: Search string (title, company, skills).
- `remote`: Boolean (None = all, True = only remote).
- `department`: Filter by functional area (Engineering, Product, etc.).
- `funding_stage`: Filter by company funding round.
- `investor_tier`: Filter by common top-tier VC tags.
- `page`: Pagination index.
- `limit`: Jobs per page (default 30).

**Response Schema**:
```json
{
  "jobs": [
    {
      "id": "uuid",
      "title": "Senior AI Researcher",
      "company_name": "OpenAI",
      "company_logo": "https://...",
      "location": "San Francisco, CA",
      "is_remote": false,
      "salary_range": "$180k - $250k",
      "signals": {
        "stage": "Series C+",
        "is_top_tier": true
      },
      "posted_at": "2024-03-05T..."
    }
  ],
  "total": 1636,
  "pages": 55
}
```

---

## 3. Frontend Architecture (React)

### 3.1 Tech Stack
- **Framework**: Vite + React + TypeScript.
- **Styling**: Tailwind CSS + Shadcn UI.
- **State Management**: 
  - **Server state**: TanStack Query (React Query) for job list caching and background refetching.
  - **URL state**: Filter settings (search, remote, etc.) will be stored in URL search params (e.g. `?remote=true&q=Senior`).
- **Animations**: Framer Motion for list re-ordering and modal transitions.

### 3.2 Component Hierarchy
- `App.tsx`: Main entry / Layout.
- `layouts/MainLayout.tsx`: Sidebar + Main content.
- `features/jobs/`:
    - `JobFeed.tsx`: Container for the job list.
    - `JobCard.tsx`: Individual job display with "Signal Badges".
    - `FilterSidebar.tsx`: Checkboxes and sliders for funding/remote/etc.
    - `CompanyDetailSheet.tsx`: Sliding sidebar (Shadcn Sheet) for company profiles.

---

## 4. Signal Integration Logic

### 4.1 The "Top-Tier" Investor Tag
Backend logic will map the `investors` field in the `Company` model against a whitelist of elite VCs:
- **Elite List**: `["Sequoia", "a16z", "Benchmark", "Founders Fund", "Index", "Accel", "Greylock"]`.
- When `Company.investors` contains one of these, the UI renders the high-contrast **"Tier 1"** badge.

### 4.2 Salary Normalization
The UI will handle missing salary data by displaying "Salary Not Provided" vs. the extracted range, formatted cleanly.

---

## 5. Deployment Architecture (Railway)
- **Frontend**: Deployed as a static site (SPA) to Railway.
- **Backend**: Containerized FastAPI service.
- **Bypass CORS**: API will accept requests from frontend domain (Inbound Port security).

---

## 6. Success Metrics
- **Load Time**: < 1.0s for initial job hydration.
- **Search Latency**: < 200ms (debounce).
- **Mobile Friendly**: Grid layout collapses gracefully to single-column list.
