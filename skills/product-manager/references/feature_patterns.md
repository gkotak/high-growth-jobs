# Feature & Epic Patterns

This reference provides the structural patterns for defining HighGrowthJobs features and epics in `docs/backlog/`.

## 1. High-Level Backlog: `roadmap.md`
Located at `docs/backlog/to-be-done/roadmap.md`. This file serves as the master roadmap and source of truth for priority and timing.

### Format:
```markdown
# HighGrowthJobs Product Roadmap

## [TO-BE-DONE] Backlog
### [Priority #]. [Epic Name] (Priority: [Level])
- **Goal:** [High-level business outcome]
- **EE:** [Estimated Effort in weeks]
- **CFO Value:** [Why this matters to finance]
- **Status:** [Planning / In-Progress / Backlog]

## [DONE-DONE] Completed Epics
### [Priority #]. [Epic Name]
- **Completed:** [Date]
- **Outcome:** [Brief result]
```

## 2. Epic Folder Structure
Epics are organized into two primary categories:
*   **Active/Pending:** `docs/backlog/to-be-done/[XX]-[epic-name]/`
*   **Completed:** `docs/backlog/done-done/[XX]-[epic-name]/`

Example: `docs/backlog/to-be-done/01-reconciliation-matching/`

## 3. Feature Specification
Each feature is a Markdown file within an active epic folder.
Example: `docs/backlog/to-be-done/01-reconciliation-matching/payment-matching-engine.md`

### Feature Template:
```markdown
# Feature: [Feature Name]

## Problem Statement
[Description of the manual pain point, referencing GLOSSARY.md terms if applicable]

## CFO Objective
[How this impacts the bottom line, risk, or auditability]

## Functional Requirements
- [ ] Requirement 1
- [ ] Requirement 2

## Financial Constraints/Logic
- [e.g., Must handle 'Unit of Measure' mapping (Lbs -> Cases)]
- [e.g., Must maintain audit trail for every automated deduction job-post]

## User Feedback (Ashtel/Discovery)
[Reference specific quotes or insights from customer interview summaries]
```

## 4. CFO Persona Priorities
When defining features, prioritize:
1. **Auditability:** Every AI action must have a clear "why" and a link to the evidence.
2. **Reconciliation:** Matching the "lumped" payments to granular line items.
3. **Data Integrity:** Handling "Dirty Data" (blurry PDFs, messy emails) without failing.
4. **Efficiency:** Reducing the time spent in Excel (VLOOKUPs) through native automation.
