# Epic 3: Discovery UI - Tech Checklist (TODO)

## Phase 1: Backend API Evolution
- [ ] **Job Feed Endpoint**:
    - [ ] Implement `GET /api/v1/jobs` in `src/app/main.py`.
    - [ ] Add pagination logic (skip/limit).
    - [ ] Add basic filtering: `q`, `location`, `is_remote`.
- [ ] **Signal Enrichment**:
    - [ ] Create a "Tier 1 VC" whitelist in `src/app/core/signals.py`.
    - [ ] Map `Company.investors` to a `tier_1` flag in the API response.
- [ ] **Company Profile Endpoint**:
    - [ ] Implement `GET /api/v1/companies/{id}` for modal detail views.

---

## Phase 2: Frontend Scaffolding (`web/`)
- [ ] **Project Setup**:
    - [ ] Confirm `web/` folder is initialized with React + TS + Tailwind.
    - [ ] Install dependencies: `lucide-react`, `@tanstack/react-query`, `framer-motion`, `axios`.
- [ ] **Shadcn UI Installation**:
    - [ ] Initialize `npx shadcn-ui@latest init`.
    - [ ] Add required components: `button`, `card`, `badge`, `input`, `sheet`, `skeleton`, `separator`.
- [ ] **API Client**:
    - [ ] Create `web/src/lib/api.ts` with Axios base configuration.

---

## Phase 3: UI Implementation
- [ ] **Job Discovery Page**:
    - [ ] Layout: `web/src/components/layout/Navbar.tsx` and `DashboardLayout`.
    - [ ] Filtering: `web/src/features/jobs/components/Filters.tsx`.
    - [ ] Feed: `web/src/features/jobs/components/JobCard.tsx` and `JobFeed.tsx`.
- [ ] **Company Detail Component**:
    - [ ] Build `web/src/features/companies/components/CompanyProfileSheet.tsx` using Shadcn Sheet.
- [ ] **Interactive States**:
    - [ ] Add **Search Debouncing** (500ms).
    - [ ] Implement **Loading Skeletons** for the job feed.
    - [ ] Add **Empty State** illustration if no jobs match filters.

---

## Phase 4: Verification & Polish
- [ ] **Mobile Responsiveness**: UI must be usable on small screens (Single-column feed).
- [ ] **Browser Testing**: Verify filtering works correctly across 1,600+ job records.
- [ ] **Environment Setup**: Ensure `VITE_API_URL` is configured correctly for local dev.
