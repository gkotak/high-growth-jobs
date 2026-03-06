# Multi-Level Testing Strategy

HighGrowthJobs requires extreme reliability. We don't just "test components"; we verify the entire "Audit Path."

## 1. Level 1: Unit & Component (Vitest + RTL)
- **Focus:** Logic and Primitives.
- **Targets:** Utility functions (date formatting, math), and Domain Components (`CurrencyDisplay`, `MatchStatus`).
- **Rule:** 100% coverage for math-heavy utility functions.

## 2. Level 2: Feature Integration (MSW)
- **Focus:** Data Coordination.
- **Pattern:** Use **Mock Service Worker (MSW)** to intercept network calls.
- **Scenario:** Render the `InvestigationWorkbench`, provide a mocked "Shortage" job-post, and verify that clicking "Approve" triggers the correct `POST` payload.

## 3. Level 3: Operational E2E (Playwright)
- **Focus:** The "Critical Path" (CFO Tests).
- **Automation:** 
    - Full Auth flow.
    - Filtering the Ledger and navigating to a Detail view.
    - The full "Audit Loop": Open JobPost -> Review 3-Way Match -> Edit Draft -> Click Approve.
- **Resilience:** Run E2E tests against a real (containerized) backend in CI.

## 4. Level 4: Visual Regression
- **Focus:** Brand Integrity (GrowthUI Blue).
- **Pattern:** Use Playwright snapshots to detect CSS regressions in key UI elements like the Sidebar, Status Badges, and Global Header.

## 5. Contract Verification
- **Automated Sync:** Run `openapi-typescript` before every test run to ensure mocks and components are using the latest backend schema.
