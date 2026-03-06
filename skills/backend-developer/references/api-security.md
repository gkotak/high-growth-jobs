# API Quality & Multi-tenant Security

Standardized interfaces and secure scoping are mandatory for financial SaaS.

## 1. DTO Isolation
Decouple the external API contract from the internal database schema.
- **Pattern:** Create Pydantic models (e.g., `JobPostRead`, `JobPostCreate`) for every endpoint.
- **Validation:** Use Pydantic's powerful validators to enforce business rules at the entry point.

## 2. Standardized Pagination
Every list response MUST follow this structure to support high-volume virtualized frontends:
```json
{
  "items": [],
  "pagination": {
    "total": 1250,
    "limit": 50,
    "offset": 0,
    "has_more": true
  }
}
```

## 3. Server-Side Filtering
- **Prohibited:** Fetching all records and filtering in the browser.
- **Required:** Implement Query Parameters for `min_amount`, `max_amount`, `start_date`, and `end_date`.
- **Multi-select:** Use array parameters for IDs or Enums (e.g., `statuses: List[JobPostStatus] = Query(None)`).

## 4. Standardized Errors (RFC 7807)
Never return generic errors.
- **Format:**
  ```json
  {
    "type": "https://high-growth-jobs.com/probs/insufficient-evidence",
    "title": "Missing BOL Signature",
    "status": 400,
    "detail": "JobPost CB-123 requires a signed BOL to proceed to Dispute.",
    "instance": "/v1/job-posts/uuid/audit"
  }
  ```

## 5. Logical Multitenancy
- **Scoping:** Every query must filter by `tenant_id`. 
- **Enforcement:** Use SQLAlchemy's `with_loader_criteria` or a shared repository base class to inject tenant filters automatically.
- **JWT:** Extract `tenant_id` from the JWT sub/job-posts in a FastAPI dependency.

## 6. Log Scrubbing
Protect sensitive data in system logs.
- **Redaction:** Implement a middleware or logging filter that masks patterns matching credit cards, bank accounts, or credentials.
