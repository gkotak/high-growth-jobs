# Data Integrity & Precision Reference

Maintaining financial and structural integrity is the primary responsibility of the Backend Developer.

## 1. Financial Precision
- **Data Type:** Use `Decimal(max_digits=12, decimal_places=2)` for all monetary fields in SQLModel and Pydantic.
- **Computation:** Perform all math in Python using `decimal.Decimal` or in PostgreSQL using appropriate numeric types. Never convert to `float`.

## 2. Medallion Layer Boundaries
- **Bronze (Ingestion):** Store raw JSON/Text in `metadata` JSONB columns. Keep pointers to original files in `IngestionSource`.
- **Silver (Canonical):** Transform raw data into structured entities (`JobPost`, `Invoice`, `PurchaseOrder`). Validation must occur at this transition.
- **Gold (Outcome):** Synthesize findings into `Verdict` and `StatusHistory`. These are the actionable conclusions derived from Silver data.

## 3. Database Constraints
Don't rely solely on application logic. Use PostgreSQL to guard the truth:
- **Logical Uniqueness:** e.g., `UniqueConstraint("chargeback_number", "tenant_id")`.
- **Check Constraints:** e.g., `CheckConstraint("amount != 0")` if applicable.
- **Foreign Keys:** Enforce all relationships at the schema level.
