# Epic 3: Discovery UI (GrowthUI) - Requirements

## Overview
**HighGrowthJobs** needs a premium, high-performance web interface that allows talent to discover roles at VC-backed startups. The primary differentiator is the "Signal-driven" filtering experience.

## User Persona
- **Tech Lead / Senior Engineer:** Searching for their next big move at a series A/B/C company with strong investors (Sequoia, Benchmark, etc.).
- **Product Manager:** Wants to filter companies by growth signals like G2 scores or recent funding rounds.

---

## 1. Functional Requirements (MVP)

### 1.1 Job Search & Discovery
- **Global Search**: Search by job title, company name, or skills.
- **Infinite Scroll / Pagination**: Handling 1,600+ jobs efficiently without page-load lag.
- **Job Card Details**:
    - Job Title (Normalized).
    - Company Name & Logo.
    - Location (Remote badge).
    - Salary Range (if available).
    - Post Date / "Last Seen".
    - "Signals Badge": (e.g., "Tier 1 VC", "Series B").

### 1.2 Advanced Filtering (The "Signal" Engine)
- **Role Type**: Engineering, Product, Design, Sales, etc.
- **Experience Level**: Junior, Mid, Senior, Lead.
- **Remote Status**: No, Hybrid, Fully Remote.
- **Funding Stage**: Seed, Series A, Series B, Series C+, Public.
- **Investor Tier**: Ability to filter by "Top Tier VCs" (Sequoia, a16z, etc.).
- **Location**: City-based filtering.

### 1.3 Company Profiling
- **Company Modal/Sheet**: Clicking a company name opens a detailed profile without leaving the search context.
- **Signals Display**:
    - Total Funding (USD).
    - List of key investors.
    - Description (AI-generated or scraped).
- **Direct Links**: Link to original career portal + LinkedIn page.

---

## 2. Aesthetic & UX Requirements (Premium Feel)

### 2.1 Design System
- **Theme**: Dark Mode by default (Modern/Tech aesthetic).
- **Color Palette**: Sleek Indigo/Violet accents with slate/zinc backgrounds.
- **Typography**: Clean, professional sans-serif (e.g., Inter or Outfit).

### 2.2 Micro-Animations
- **Hover States**: Subtle scale or glow effects on job cards.
- **Loading Skeletons**: Smooth skeleton screens while fetching data.
- **Transition**: Framer Motion for modal appearance and list filtering transitions.

### 2.3 Performance
- **Instant Filtering**: Clientside filtering for current page result, or debounced server-side search.
- **Image Optimization**: Lazy loading for company logos.

---

## 3. Technical Constraints
- **Framework**: React 18+ (Vite) with TypeScript.
- **Styling**: Tailwind CSS + Shadcn UI (Radix Primitives).
- **Icons**: Lucide React.
- **Data Fetching**: TanStack Query (React Query) for caching and optimistic UI.

---

## 4. Success Criteria
- [ ] User can find a "Senior Engineer" role at a "Sequoia-backed" company in under 3 clicks.
- [ ] Interface feels responsive on mobile and desktop.
- [ ] No layout shift (CLS) during job list hydration.
