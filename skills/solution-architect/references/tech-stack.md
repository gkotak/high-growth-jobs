# Tech Stack Recommendations (Stable Feb 2026)

These are the preferred "boring" technologies for HighGrowthJobs to ensure LLM friendliness and ease of development.

## Backend (Python/FastAPI)
- **Framework:** FastAPI (High performance, standard types).
- **Validation:** Pydantic v2.
- **Database Interaction:** **SQLModel** (SQLAlchemy + Pydantic wrapper).
    - **Philosophy:** Use for schema definition and simple CRUD.
    - **Performance:** Strictly utilize `session.exec(text("RAW SQL"))` for complex reporting, bulk reconciliation, or performance-critical logic to avoid ORM state-management nightmares.
- **Migrations:** Alembic.
- **Authentication:** `python-jose` for JWT, `passlib` for password hashing.

## Database (PostgreSQL)
- **Image:** `postgres:15-alpine`.
- **Schema:** Use UUIDs for primary keys to support distributed data ingestion.

## Frontend (React/TypeScript)
- **React:** 18 (LTS) - *Stable production choice.*
- **Build Tool:** Vite 7.3.
- **State Management:** TanStack Query 5.90+ for server state; standard `useState/useContext` for UI state.
- **Routing:** React Router 7.13.
- **Styling:** Tailwind CSS 4.2 (GrowthUI Blue: `#007bff`).
- **Components:** shadcn/ui (Radix UI) + TanStack Virtual for large lists.
- **Forms:** React Hook Form + Zod (Strict schema validation).
- **UX:** Skeleton Screens + URL-as-State (Search Param Persistence).

## Infrastructure & Recovery
- **Hosting:** Hetzner Cloud (ARM64 or x86).
- **Object Storage:** Hetzner Object Storage (S3-compatible).
- **SSL/TLS:** Caddy (Automatic HTTPS).
- **Observability:** Sentry (Errors) + Slack (Alerts) + X-Request-ID Correlation.
- **Backups:** Hourly `pg_dump` to Object Storage.

## Key Design Patterns
- **Multitenancy:** Explicit `tenant_id` propagation and RBAC (User-Tenant-Role).
- **Reliability:** **Transactional Outbox** or **State Machine + Janitor** for event consistency.
- **Orchestration:** **Dual-Speed Execution** (Events + Janitor Polling).
- **Security:** **PII Redactor Middleware** and Sandboxed OCR.
- **AI Integration:** **LangGraph** for stateful multi-step agent workflows.
- **Frontend Architecture:** **Feature-Sliced Architecture** with Barrels and Absolute Imports (`@/*`).
- **Data Architecture:** **Medallion Architecture** (Bronze-Silver-Gold) in Relational DB.
