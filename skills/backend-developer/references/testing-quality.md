# Automated Regression & Quality Standards

In a financial system, tests are not optional; they are the "Golden Guard" of the Brand's revenue.

## 1. Unit Testing: The Math Guard
- **Scope:** `app.modules.reconciliation` and `app.domain.math`.
- **Requirement:** 100% path coverage. 
- **Pattern:** Use "Golden Data" (real-world anonymized samples) to verify the Lumping Matcher against known correct outputs.

## 2. Integration Testing: Resilience
- **Janitor Tests:** Simulate a partial task execution (e.g., `locked_at` is set, but task failed). Verify that the Janitor restarts the task after the timeout correctly.
- **Idempotency Tests:** Execute the same "Send Dispute" logic twice. Verify that only one outbound record/email is created.

## 3. Security Testing: Isolation
- **Pattern:** Every test suite must include an "Adversarial Tenant" test.
- **Logic:** Authenticate as `Tenant_A`, attempt to `GET /v1/job-posts/{tenant_b_job-post_id}`. Verify that the system returns a `404` or `403` automatically.

## 4. Contract Testing
- **OpenAPI Validation:** Use automated tools to verify that the current `src/` code perfectly matches the `docs/architecture/submodules/api.md` contract.
- **Regression:** Run CI checks that catch any breaking changes to the JSON response structure (e.g., renamed fields).
