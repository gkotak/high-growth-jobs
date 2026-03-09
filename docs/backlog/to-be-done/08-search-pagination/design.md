# Design Document: Server-Side Search, Filtering & Pagination (Epic 08)

## Overview
As the job database scales (14,000+ jobs), the current client-side filtering and search approach is causing performance bottlenecks and browser hanging. We need to move the heavy lifting to the backend. This epic transitions the application to server-side cursor/offset-based pagination, dynamic SQL filtering, and advanced PostgreSQL full-text search.

## Objectives
1.  **Eliminate Client-Side Data Bloat:** The frontend should only fetch the jobs it needs to display (e.g., 50 at a time).
2.  **Advanced Fuzzy Search (v1):** Implement PostgreSQL full-text search (`tsvector` / `tsquery`) to handle complex text matching across job titles, descriptions, and company names, skipping basic `ILIKE`.
3.  **Vector/Semantic Search Placeholder (v2):** Design the system to easily swap out or augment full-text search with vector embeddings (pgvector) in the future.
4.  **Server-Side Filtering:** All UI filters (Role Type, Experience, Remote, Funding Stage, Investor Tier) must be translated into dynamic SQL `WHERE` clauses.

---

## Architectural Delta

### 1. Database Layer (PostgreSQL)

To support performant fuzzy text search, we will leverage PostgreSQL's native Full-Text Search capabilities.

*   **Search Vector Column (Optional but recommended for speed):** We can add a generated `tsvector` column to the `Job` model (and potentially `Company`), OR compute it on the fly during the query. For 14k rows, on-the-fly (`to_tsvector`) with a GIN index on the text columns could work initially, but a materialized column is faster.
*   **Target Fields:**
    *   `Job.title` (Weight A)
    *   `Company.name` (Weight A)
    *   `Job.description` (Weight B)
    *   `Job.skills` (Weight C)

*   **Vector Search Placeholder (v2):**
    *   We will structure the query logic so that the "search strategy" can be easily swapped.
    *   *Future State:* Introduce `pgvector`, generate embeddings for job descriptions via OpenAI/Gemini during ingestion, and use cosine similarity in the search query.

### 2. Backend API Layer (`src/app/main.py`)

The `GET /api/jobs` endpoint will be significantly refactored.

**New Request Schema (Query Parameters):**
*   `page`: int (default: 1)
*   `limit`: int (default: 50)
*   `search`: string (optional)
*   `roleType`: list of strings (optional)
*   `experienceLevel`: list of strings (optional)
*   `remote`: list of strings (optional)
*   `fundingStage`: list of strings (optional)
*   `investorTier`: boolean (optional)

**New Response Schema:**
```json
{
  "data": [ ... array of Job objects ... ],
  "meta": {
    "total_count": 14052,
    "page": 1,
    "limit": 50,
    "has_next": true
  }
}
```

**Query Construction Logic (SQLModel/SQLAlchemy):**
1.  **Base Query:** `select(Job).join(Company)`
2.  **Apply Filters:** Conditionally append `.where()` clauses for each active filter (e.g., `Job.is_remote == True`, `Company.stage.in_(fundingStage)`).
3.  **Apply Full-Text Search:** If `search` is present, use `func.to_tsvector()` and `func.plainto_tsquery()` (or `websearch_to_tsquery` for better user query handling) combined with the `@@` operator. Rank results using `func.ts_rank()`.
4.  **Pagination:** Apply `.offset((page - 1) * limit).limit(limit)`. Use an additional `select(func.count()).select_from(...)` query to get the `total_count` for metadata.

### 3. Frontend Layer (`web/src/hooks/useJobs.ts` & UI)

**Data Fetching (`useJobs.ts`):**
*   Transition from `useQuery` to `@tanstack/react-query`'s **`useInfiniteQuery`** or parameterized `useQuery`. `useInfiniteQuery` is ideal for "Load More" / infinite scroll UI.
*   The hook must construct the query string based on the active filter state and search input.

**UI Components (`Index.tsx` & `JobListSection.tsx`):**
*   **Remove Client Filtering:** Delete all the `useMemo` filtering logic in `Index.tsx`.
*   **Debounce Search:** Add a debounce hook (e.g., 500ms) to the Search input so typing doesn't spam the API.
*   **Pagination UI:** Implement a `Load More` button at the bottom of the `JobListSection`, or attach an `IntersectionObserver` to the last item to trigger fetching the next page automatically.
*   **State Management:** When a filter is toggled, it triggers a refetch from page 1.

---

## Technical Dependencies
*   **PostgreSQL Full-Text Search functions:** `to_tsvector`, `websearch_to_tsquery`, `ts_rank` via SQLAlchemy's `func`.
*   **Frontend:** `useInfiniteQuery` from `@tanstack/react-query`, `lodash.debounce` or a custom debounced value hook.

## Future Vector Search Integration (v2 Notes)
When ready for semantic search:
1.  Run `CREATE EXTENSION vector;` on the Postgres DB.
2.  Add `embedding = Field(sa_column=Column(Vector(768)))` (or similar dimension based on the model) to the `Job` model.
3.  Update the `JobIngestPort` to generate embeddings when a job is saved.
4.  Add a generic switch in the `GET /api/jobs` endpoint: `if search_type == 'semantic': query.order_by(Job.embedding.l2_distance(query_embedding))`.
