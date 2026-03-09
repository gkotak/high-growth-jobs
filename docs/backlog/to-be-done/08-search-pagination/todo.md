# Implementation Plan: Server-Side Search & Pagination

## Phase 1: Database Setup
- [ ] Create a migration to add a computed `tsvector` column or GIN index for full-text search to the `Job` model to optimize query speed (target fields: title, description, skills).

## Phase 2: Backend API Refactor (`src/app/main.py`)
- [ ] Define the new input schemas for `/api/jobs` query parameters (page, limit, search, filters: roleType, experienceLevel, remote, fundingStage, investorTier).
- [ ] Define the paginated response model (`JobResponse` wrapper with `data` and `meta` containing `total_count`, `page`, `limit`, `has_next`).
- [ ] Refactor the `/api/jobs` endpoint logic:
  - Base SQLModel query joining `Job` and `Company`.
  - Apply filter `.where()` clauses based on query params.
  - Apply `func.to_tsvector` and `@@` match logic if `search` string is provided (using `websearch_to_tsquery` or `plainto_tsquery`).
  - Calculate `total_count` of filtered results.
  - Apply `.offset()` and `.limit()` and execute query.

## Phase 3: Frontend Data Hook (`web/src/hooks/useJobs.ts`)
- [ ] Update `/api/jobs` fetch call to append query parameters based on state.
- [ ] Switch `useQuery` to `@tanstack/react-query`'s `useInfiniteQuery`.
- [ ] Update the return type to match the new paginated API response schema (`data` + `meta`).

## Phase 4: Frontend UI Updates (`web/src/pages/Index.tsx`)
- [ ] Remove all client-side array filtering logic (`filteredJobs` via `useMemo`).
- [ ] Implement a debounced search hook (`useDebounce`) so typing in the HeroSection doesn't spam the API.
- [ ] Update state management so changing any filter (roles, remote, etc.) resets the infinite query to Page 1.
- [ ] Update `JobListSection` to render `data.pages.flatMap(...)` from React Query.
- [ ] Add a "Load More" button or an `IntersectionObserver` at the bottom of the list to trigger `fetchNextPage()`.
