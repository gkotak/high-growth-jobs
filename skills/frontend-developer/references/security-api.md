# API Strategy & Defensive Security

## 1. API Contract Negotiation (Front-of-the-Back)
A Staff Frontend Developer acts as a bridge between the UI needs and Backend efficiency.

- **Prevention:** Avoid **Over-fetching** (requesting 50 fields when the UI needs 3) and **Under-fetching** (requiring multiple round-trips to render one component).
- **Integrity:** Use **TypeScript interfaces** shared (or synced) with the backend's Pydantic models to ensure build-time safety.

## 2. Defensive Security Primitives
Ensure the application is secure by default through hardened patterns.

- **XSS Prevention:** Standardize how user-generated content (e.g., from market PDFs) is rendered. Use sanitization libraries for any raw HTML injection.
- **Auth Management:** Advocate for **HTTP-only Cookies** for JWT storage. If using Bearer tokens, store them in local memory with a silent refresh mechanism to prevent token theft via XSS.
- **Sanitization:** All data from "Dirty" external sources (S3 artifacts) must be treated as untrusted.
