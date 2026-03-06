# Tech Lead Planning Guidelines

When translating an Epic into a `todo.md`, you must be extremely explicit to eliminate ambiguity for the developers.

## 1. Backend Task Guidelines
Do not say: *"Build the Lumping Matcher API."*
Do say:
- *"Create `src/app/modules/reconciliation/schemas.py` and define `ReconciliationSummaryDTO` (Pydantic)."*
- *"Create `src/app/modules/reconciliation/service.py`."*
- *"Implement raw SQL window function in `service.py` to calculate `sum_invoices` vs `sum_deductions` for a given `Remittance.check_number`."*
- *"Implement `GET /v1/remittances/{id}/reconciliation` in `src/app/api/v1/remittances.py`, returning the standardized pagination envelope."*

## 2. Frontend Task Guidelines
Do not say: *"Build the Checks page."*
Do say:
- *"Create feature slice `@/features/remittances/`."*
- *"Define Zod schema and types in `@/features/remittances/types/index.ts` (sync with `openapi-typescript` output)."*
- *"Create `useRemittances` hook in `@/features/remittances/hooks/` wrapping `useQuery` with `staleTime: 5 mins`."*
- *"Build `RemittanceTable` component using `@tanstack/react-virtual` to handle 100+ rows."*
- *"Implement URL-as-State for the `status` filter using `useSearchParams`."*

## 3. Testing Mandates
For every functional block, require the appropriate test:
- **Backend:** Request Pytest coverage for any math, idempotency checks for Janitor tasks, and isolated tenant checks.
- **Frontend:** Request Vitest+MSW for component rendering, and Playwright for the critical UI path.

## 4. Avoiding Technical Debt
- Explicitly instruct developers to use `Decimal` for money.
- Explicitly instruct frontend devs to use `Skeleton` components instead of generic spinners.
- Explicitly instruct backend devs to log using `X-Request-ID`.
