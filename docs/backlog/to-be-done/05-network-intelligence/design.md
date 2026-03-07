# Technical Design: Epic 5 Network Intelligence

## 1. Systems Architecture Delta
We are adding a new Edge Adapter to interact with the external LinkedIn API ecosystem and a core `UserConnection` table to store relational mappings.

- **Port (`ports/linkedin.py`):** `ILinkedInAdapter` defining the contract to fetch user profile, fetch connections, and manage tokens.
- **Adapter (`adapters/linkedin_api.py`):** Implementation handling OAuth2 handshakes, rate limits, and JSON hydration.
- **Core Orchestrator:** A background worker task that iterates through stale user accounts and triggers `fetch_and_diff_connections()`.

## 2. Data Model Changes (models.py)

We need to store User authentication state for LinkedIn and map connections. We will introduce two models:
1. `UserLinkedInToken`: Stores OAuth Access Token, Refresh Token, and Expiry timestamp. Linked to the `Tenant`/User.
2. `UserConnection`: A mapped entity representing a known person in a designated company.

```python
class UserLinkedInTokenBase(SQLModel):
    linkedin_user_id: str = Field(index=True)
    access_token: str
    refresh_token: Optional[str] = None
    expires_at: datetime
    
class UserLinkedInToken(UserLinkedInTokenBase, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    tenant_id: UUID = Field(foreign_key="tenant.id", unique=True) # 1:1

class UserConnectionBase(SQLModel):
    full_name: str
    headline: Optional[str] = None
    linkedin_profile_url: Optional[str] = None
    raw_company_name: str

class UserConnection(UserConnectionBase, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    tenant_id: UUID = Field(foreign_key="tenant.id", index=True)
    
    # Optional direct link to our normalized companies
    company_id: Optional[UUID] = Field(foreign_key="company.id", default=None)
```

## 3. Implementation Workflow Path
1. **API Endpoints:** Build the FastAPI `/auth/linkedin/login` and `/auth/linkedin/callback` OAuth endpoints.
2. **Ingestion Engine:** Implement a Python batch job (`SyncConnections`) to hit the Connections API endpoint, parse results, and bulk upsert them into `UserConnection`.
3. **Fuzzy Matching Strategy:** Build a normalization step using `fuzzywuzzy` or direct DB similarity (pg_trgm extension) to automatically link `UserConnection.raw_company_name` -> `Company.name`.
4. **UI Updates:** Update the front-end to incorporate connection counts when rendering company lists or job detail pages.
