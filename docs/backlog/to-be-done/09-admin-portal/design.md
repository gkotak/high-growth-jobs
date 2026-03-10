# ExecutionLog Database Architecture

## Objective
Replace the ephemeral, stateful `tail -F` Server-Sent Events (SSE) log streaming solution with a robust, persistent, stateless Database logging table (`ExecutionLog`). The goal is to provide 30-day historical visibility into background daemons and manual UI triggers without actively managing state (e.g., polling for `status='running'`) or complex network pipes.

## 1. Revert Actions
- **`logging_setup.py`**: Remove the dual `server.log` and `scrape.log` split. Revert back to the single `app.log` configuration.
- **`admin.py`**: Delete `/api/admin/logs/stream` endpoint and the `log_generator()` background task.
- **`Admin.tsx`**: Delete the `EventSource` connection, `setLogs` state, and the auto-appending stream UI.

## 2. Database Schema Delta (`ExecutionLog`)
Add a new model to `models.py`:
```python
from sqlmodel import SQLModel, Field
from uuid import UUID, uuid4
from datetime import datetime
from typing import Optional
from sqlalchemy import Column
from sqlalchemy.dialects.postgresql import JSONB

class ExecutionLog(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    company_id: Optional[UUID] = Field(default=None, foreign_key="company.id", index=True)
    job_id: Optional[UUID] = Field(default=None, foreign_key="job.id", index=True)
    
    # "daemon" or "manual"
    source: str = Field(...) 
    
    # e.g., "discovery", "enrichment"
    action: str = Field(...) 
    
    # "success", "failed", "warning"
    status: str = Field(...) 
    
    # Granular JSON payload. e.g. {"new_jobs_found": 5} or {"error": "Cloudflare wall"}
    payload: dict = Field(default_factory=dict, sa_column=Column(JSONB))
    
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)
```

## 3. Backend API Delta
**GET `/api/admin/companies/{company_id}/logs`**
- Returns the last 100 `ExecutionLog` rows where `company_id = X` OR `job_id` belongs to company `X`.

## 4. Frontend UI Delta
- Modify `useAdmin.ts` to add a new `useCompanyLogs(companyId: string)` React Query hook.
- Modify `Admin.tsx` to render the logs for the `activeTab`.
- No automatic re-polling! The user must click a manual "Refresh" button in the tab to pull fresh logs.

## 5. Script & Service Integration
- `src/app/api/admin.py`: Log manual trigger starts and successes.
- `src/app/services/janitor.py`: Log daemon `discovery` loops and `enrichment` loops directly to the DB.
