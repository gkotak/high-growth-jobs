# Orchestration & Resilience Reference

Production-grade systems are designed to handle failure gracefully.

## 1. Idempotency Pattern
All background tasks must be safe to run multiple times.
- **Implementation:** Check if the work is already done (or in progress) before starting.
- **Locking:** Use `locked_at` and `locked_by` columns. Implement a timeout (e.g., 15 mins) after which the Janitor can "steal" the lock from a dead process.

## 2. Atomic Transitions
State changes must never be partial.
- **Transactional Unit:** Use `with session.begin():` to wrap the entity update, the `StatusHistory` record, and any event outbox commits.
- **Side Effects:** Never perform external actions (sending emails, calling AI) inside a DB transaction. Use the **Transactional Outbox** or the **Janitor** to trigger side effects after the commit.

## 3. The Janitor (Continuity)
The Janitor is the "Self-Healing" mechanism of HighGrowthJobs.
- **Role:** Finds job-posts in transitional states (e.g., `PROCESSING`) that are not currently locked and resumes their workflow.
- **Retry Logic:** Increment a `retry_count` on failure. Move to an `ERROR` status after X attempts for human intervention.
