# Epic Execution Blueprint (todo.md Template)

Use this structure when creating the `todo.md` for a specific Epic. The file should be saved in `docs/backlog/to-be-done/[epic-folder]/todo.md`.

```markdown
# Epic Execution Plan: [Epic Name]

## 1. Prerequisites & Design Updates
- [ ] Review Epic Requirements against `docs/architecture/architecture.md`.
- [ ] Update `docs/architecture/submodules/api.md` with new endpoints/fields (if any).
- [ ] Generate updated `openapi.json` and sync `schema.d.ts` to Frontend.

## 2. Backend Implementation (Vertical Slice: [Slice Name])
### Database & Schema
- [ ] Create/Update SQLModel entity in `src/data_model/models.py`.
- [ ] Generate and review Alembic migration script.

### Logic & API (Pydantic / FastAPI)
- [ ] Define DTOs in `src/app/modules/[slice]/schemas.py`.
- [ ] Implement core logic in `src/app/modules/[slice]/service.py` (Ensure tenant isolation).
- [ ] Implement Router in `src/app/api/v1/[endpoint].py` (Apply standard pagination/errors).
- [ ] If background task: Implement Janitor polling and locking logic.

### Backend Testing (Pytest)
- [ ] Write unit tests for core domain math/logic (100% coverage on math).
- [ ] Write integration test verifying API endpoint and multi-tenant isolation.

## 3. Frontend Implementation (Feature Slice: [Feature Name])
### State & API (TanStack Query / Zod)
- [ ] Define Zod schemas and type definitions in `@/features/[feature]/types/`.
- [ ] Implement data fetching hooks in `@/features/[feature]/hooks/` (Ensure caching strategies).

### UI Components (React / Tailwind / shadcn)
- [ ] Build loading `Skeleton` components for primary views.
- [ ] Build domain components (e.g., `VirtualTable`, `StatusBadge`). Ensure URL-as-State for filters.
- [ ] Integrate forms using `react-hook-form` and Zod validation.

### Frontend Testing
- [ ] Write Vitest + MSW tests for component rendering and hook logic.
- [ ] Write/Update Playwright E2E test for the critical user path.

## 4. Final Review & Documentation
- [ ] Perform cross-browser testing and verify empty/error states.
- [ ] Update `architecture.md` (or specific submodules) to reflect any structural deviations taken during implementation.
- [ ] Move Epic from `to-be-done` to `done-done` in the backlog.
```
