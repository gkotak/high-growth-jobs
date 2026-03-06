# DevOps & Operational Standards

Reliability starts with consistent environments and ends with deep observability.

## 1. Local Development Parity
- **The Docker Rule:** All core infrastructure (PostgreSQL, LocalStack/S3, Redis) must run via `docker-compose.yml`.
- **Reproducibility:** A new engineer must be able to run `docker-compose up` and have a working local environment within 5 minutes.

## 2. Migration Discipline (Alembic)
- **Traceability:** Every migration must be descriptive and linked to a schema version.
- **Transaction Safety:** Alembic migrations must be wrapped in a single database transaction where supported.
- **Rollback:** Every `upgrade` function must have a corresponding `downgrade` function.

## 3. The Observability Pipeline
- **Correlation IDs:** Every log line must include the `X-Request-ID`. This ID must be passed to downstream services and AI workers.
- **Health Checks:** The `/health` endpoint must perform a deep check of:
    - Database connectivity.
    - S3/Object Storage connectivity.
    - Janitor Heartbeat (checking if the background worker has updated its `last_seen` timestamp).
- **Structured Logging:** All logs must be output in JSON format in production environments for ingestion by log aggregators.
