# AI Integration Reference

AI agents are powerful but must be treated as untrusted actors in a financial system.

## 1. AI as Untrusted Input
- **Pattern:** AI agents only call a `propose_insight` endpoint.
- **Guardrail:** The proposal is validated against the mathematical truth of the ERP (Silver layer) before the `Verdict` is saved and the job-post moves to `NEEDS_REVIEW`.

## 2. Explainability & Traceability
Anish and Lenny must trust the AI's conclusions.
- **Evidence Snippets:** Store the bounding box coordinates, page numbers, and SHA-256 hashes of the source documents used by the AI.
- **Lineage:** Every `Verdict` record must link back to the specific `IngestionSource` and `Artifact` used for reasoning.
- **Logic:** Prefer chain-of-thought summaries in the `reasoning` field of the `Verdict` entity.
