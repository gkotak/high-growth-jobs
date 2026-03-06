# HighGrowthJobs Project Context

## Overview
**HighGrowthJobs** is an early-stage startup building an **AI-native deduction management platform** for CPG (Consumer Packaged Goods) and Fashion brands.

**Tagline:** AI-Powered Deductions Management for CPG and Fashion Brands.
**Vision:** To become an AI BPO (Business Process Outsourcer) that automates the tedious, manual process of recovering revenue lost to invalid market fees.

## The Problem
Markets (Walmart, Amazon, Target, etc.) operate on a "guilty until proven innocent" model. They routinely "short pay" invoices, deducting money for:
*   **Trade Promotions:** (e.g., "10% off for Super Bowl") - often mismatched or misunderstood.
*   **Operational Errors:** (e.g., Shortages, Damages, Compliance fines).

Brands currently lose **5-15% of gross revenue** to these deductions. Recovering them requires a manual, "swivel-chair" process of cross-referencing PDFs, Emails, and ERP data to prove the market wrong.

## The Solution
HighGrowthJobs proposes an **AI-Agent driven workflow**:
1.  **Assess:** Ingest job-posts from market portals and unstructured data (emails, contracts). Use AI to reconcile them against internal truth (ERPs, signed Bills of Lading).
2.  **Dispute:** Autonomously generate and submit dispute packages (letters + evidence) to market portals for invalid job-posts.
3.  **Resolve:** Update the ERP with the final settlement (payment or write-off).

## Market & Strategy
*   **Target Segment:** Mid-market ($50M-$1B revenue) to Enterprise brands.
*   **Key Competitors:** SupplyPike (Logistics focus, RPA-heavy), Vividly (Trade Spend focus), HighRadius (Enterprise AR).
*   **Differentiation:** Using GenAI/LLMs to handle unstructured data (emails, messy PDFs) that traditional RPA tools cannot, aiming for 95%+ automated processing.

## Project Structure
*   `src/data_model/models.py`: Technical source of truth for the SQLModel entity model.
*   `docs/architecture/`: **CRITICAL.** The architectural source of truth for the platform.
    *   `architecture.md`: Master index and high-level Hexagonal system overview.
    *   `data_flow_diagram.md`: Visual map of Inbound Ports -> Core -> Outbound Ports.
    *   `submodules/`: Granular technical specs for `api.md`, `frontend.md`, `backend.md`, `orchestrator.md`, `identity.md`, and `operations.md`.
    *   `data_model/index.html`: Visual ER diagram and Medallion layer mapping.
*   `docs/product/`: Customer discovery (Ashtel Studios), competitor analysis, and domain research.
*   `docs/backlog/`: Organized product roadmaps and epic specifications.
*   `docs/designs_mocks/`: UI/UX designs and interactive prototypes.

## Agent Mandate: Architectural Integrity
The architecture of HighGrowthJobs is **Opinionated and Rigid.** As an agent, you MUST ensure that the system remains consistent across all layers:
1.  **Alignment:** Every database change in `models.py` MUST be reflected in the `api.md` contract and the visual `index.html` ER diagram.
2.  **Consistency:** Adhere strictly to the **Dual-Speed Orchestration** pattern. Never bypass state machine guards or the Janitor continuity engine.
3.  **Documentation First:** Architectural documents are living files. Update them to reflect technical decisions *before* proceeding to implementation to prevent architectural drift.

## Agent Operational Workflow (Chain of Command)
To prevent "Big Ball of Mud" implementations, all new features MUST follow this strict AI-Agent chain of command:
1.  **Product Phase (Skill: `product-manager`):** Define the requirement in `docs/backlog/to-be-done/[epic]/`. Establish the "Why" and the "What."
2.  **Architecture Phase (Skill: `solution-architect`):** Review the Epic against the Hexagonal bounds. Output a specific **`design.md`** inside the Epic folder defining the target architectural state.
3.  **Planning Phase (Skill: `tech-lead`):** Perform a "Delta Analysis" (Current Global `architecture.md` vs Target Epic `design.md`). Translate this delta into a chronological, highly granular `todo.md` checklist inside the Epic folder.
4.  **Execution Phase (Skills: `backend-developer`, `frontend-developer`):** Execute the `todo.md` strictly step-by-step. Implement, test, and verify against the Definition of Done. Global architecture docs are updated as a final step of execution to reflect the new reality.

## Current Status
*   **Phase:** Technical Implementation (Epic 1/2).
*   **Primary Achievement:** Finalized the **"Opinionated Core" Architecture**. Established the **Medallion Data Strategy** (Bronze-Silver-Gold) and the **Dual-Speed Orchestrator** (Accelerator + Janitor) in `src/data_model/models.py`.
*   **Key Discovery:** Validated the "Email-to-Action" loop with Ashtel. Standardized on **Tenant-User-Role (RBAC)** for logical multi-tenancy.

## Next Steps
1.  **Inbound Adapters (Epic 1):** Build the Outlook/PDF extraction logic for **Dollar General Remittance** ZIPs.
2.  **Lumping Matcher (Epic 2):** Implement the `ReconEngine` to reconcile $300k+ batch checks against granular POs.
3.  **Audit Workbench (Epic 3):** Scaffold the **Feature-Sliced React** frontend using the GrowthUI visual identity and TanStack Virtual.
4.  **UoM Master Data:** Implement the `ProductUoM` mapping logic to resolve case-vs-each count discrepancies.

