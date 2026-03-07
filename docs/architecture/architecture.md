# HighGrowthJobs High-Level Architecture

*This document serves as the master **Directive Blueprint** for the HighGrowthJobs platform. It defines the "Target State" and the strict technical laws (patterns, stack, boundaries) that all implementations MUST follow.*

> ⚠️ **Implementation Reality Check:** To see what has *actually* been built so far, refer to the **[Current Implementation State](./current_state.md)** document. Do not assume all components described here are active in the codebase.

## Architecture Documentation Index
*   **[Current Implementation State](./current_state.md):** The "You Are Here" map of the codebase.
*   **[High-Level Data Flow](./data_flow_diagram.md):** A Mermaid diagram showing the interaction between external inputs (Adapters), the Core Engine, and the UI.
*   **[Data Model Overview (HTML)](./data_model/index.html):** A visual map of the entities, their relationships, and the Medallion architecture layers.
*   **[Full Entity Model (SQLModel Source Code)](../../src/data_model/models.py):** The technical source of truth for all database entities, types, and relationships.
*   **[HighGrowthJobs API Design Submodule](./submodules/api.md):** The RESTful API contract between the React Discovery UI and the FastAPI Core (Updated to reflect the UI prototype's data structures, including computed statuses and line items).
*   **[HighGrowthJobs Frontend Architecture Submodule](./submodules/frontend.md):** The technical design of the GrowthUI Workbench UI (React/TS/Tailwind).
*   **[HighGrowthJobs Identity & IAM Submodule](./submodules/identity.md):** The multi-tenant RBAC, authentication, and user-tenant mapping logic.
*   **[HighGrowthJobs Operational Observability](./submodules/operations.md):** Background job tracking, system health, and production monitoring.

---

## 1. System Overview (The Hexagonal Core)
HighGrowthJobs employs a **Hexagonal Architecture (Ports and Adapters)** to manage the complexity of robust data ingestion vs. flexible UI mapping.

The philosophy is simple: **An Opinionated Canonical Core with Flexible Ingestion Edges.**
*   **The Core:** The system enforces a rigid, standardized "HighGrowthJobs Workflow" (Ingest VCs -> Match Companies -> Scrape Jobs -> Enrich).
*   **The Edges:** We provide ultimate flexibility by pushing all external integrations (Crunchbase, Axios Pro Rata, Company Career Pages) to the perimeter as swappable Adapters.

## 2. Backend Architecture (Python/FastAPI)
Focus: Type safety, modularity, and explicit data contracts.

- **Framework:** **FastAPI** for high performance and native Pydantic support.
- **Dependency Management:** **uv** is the mandatory tool for all Python package management. It ensures sub-second environment synchronization and reproducible builds.
- **Directory Structure (Hexagonal Vertical Slices):**
  ```text
  src/
  └── app/
      ├── core/            # App-wide config, logging, telemetry, dependencies
      ├── domain/          # Pure Python business logic
      ├── api/             # FastAPI Routers and DTOs (v1, v2)
      ├── ports/           # ABSTRACT definitions for external systems (SOLID)
      └── adapters/        # IMPLEMENTATIONS of Systems (MarketScraper, OpenAI Scrapers)
  ```
- **Database Interaction:** **SQLModel** (by the creator of FastAPI).
  - **Source of Truth:** All entities are defined in [`src/data_model/models.py`](../../src/data_model/models.py).
  - *Philosophy:* We use it primarily for schema definition and simple CRUD.
  - **Migrations:** **Alembic** (natively supported by SQLModel).
- **Data Validation:** **Pydantic v2** for all incoming payloads and outgoing responses.
- **Background Tasks:** Use FastAPI's `BackgroundTasks` for simple async logic, alongside standalone batch scripts for LLM parsing (e.g., Axios Pro Rata).

## 3. Frontend Architecture (React/TypeScript)
Focus: Performance at scale, data discovery, and "GrowthUI" premium brand alignment.

- **Framework:** **React 18 (LTS)** via **Vite**.
- **Validation Law:** All data crossing the network boundary (Request/Response/Errors) MUST be validated.
- **State & Logic:** 
    - **Server State:** **TanStack Query (React Query) v5** is the mandatory standard for all data fetching.
    - **Forms & Validation:** **React Hook Form + Zod** for strict, schema-based data entry.
- **Styling:** **Tailwind CSS** + **shadcn/ui**. All UI aligns with the **GrowthUI** high-contrast premium startup palette.
- **Data & Navigation Patterns:**
    - **URL-as-State:** All filters (e.g., funding stage, VC firm) and active tabs are persisted in the URL for deep-linking.

## 4. Automated Testing Strategy
Quality is enforced at the local level to ensure predictable ingestion pipelines.

- **Backend (Pytest):**
  - **Unit Tests:** Business logic in vertical slices.
  - **Integration Tests:** Endpoint testing and LLM parser stability checks.
- **Frontend (Vitest & Playwright):**
  - **E2E:** **Playwright** for the "Critical Path" (e.g., filtering companies, viewing job cards).

## 5. CI/CD & Environment Strategy

HighGrowthJobs maintains strict separation between **Local Development** and **Production** while ensuring API parity.

- **Docker Performance Law:** To handle ARM64 (host) vs. Linux (container) native binding conflicts, dependencies are containerized.
- **CI (GitHub Actions):** 
  - Run `ruff` (linting) and `mypy` (type checking) on every push.
- **CD Deployment:** 
  - Docker Compose orchestration on target cloud instances.
  - **Reverse Proxy:** **Caddy** (containerized) handles SSL/TLS (Automatic Let's Encrypt).

## 6. Key Architectural Patterns

- **Dependency Inversion (DI):** 
    - Adapters for scraping use standard interfaces (e.g., `IScraperPort`) so Playwright scrapers and LLM parsers act interchangeably.

- **Ingestion & Reconciliation Orchestration:** 
    - **Logic:** Background data ingestion triggers updates to Canonical logic (`Company`, `VCFirm`) cleanly via Upserts and `is_stub` generation.
    - **Human-in-the-Loop (HITL):** Users browse the output in the Discovery Dashboard.

- **Logical Multitenancy (Day 1):** To avoid a nightmare migration later, every core transactional table includes a **tenant_id** (UUID). This allows users to track their own custom shortlists or LinkedIn connections privately.

## 7. Security Architecture & Guardrails
- **Inbound Data Guardrails (The Sandbox):**
    - **LLM Scoping:** AI agents have **Zero** direct access to write raw executing code. They produce strict Pydantic Output payloads which must be explicitly committed by the Python engine.
- **API Security:**
    - OAuth / JWT for standard endpoint access.

## 8. Disaster Recovery & Reliability
- **Database Backups:**
    - **Frequency:** **Hourly** `pg_dump` backups for critical relational data.
