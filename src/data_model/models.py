from datetime import datetime
from typing import Optional, List
from uuid import UUID, uuid4
from sqlmodel import SQLModel, Field, Relationship

class TenantBase(SQLModel):
    name: str
    slug: str = Field(unique=True, index=True)

class Tenant(TenantBase, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    companies: List["Company"] = Relationship(back_populates="tenant")

class VCFirmBase(SQLModel):
    name: str = Field(index=True, unique=True)
    website_url: str
    region: Optional[str] = None # US, EU, Global
    tier: Optional[str] = None # Tier 1, Tier 2, etc.

class VCFirm(VCFirmBase, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    # We will relate this to Companies in Epic 2

class CompanyBase(SQLModel):
    name: str = Field(index=True)
    website_url: str
    description: Optional[str] = None
    logo_url: Optional[str] = None
    linkedin_url: Optional[str] = None
    twitter_url: Optional[str] = None
    
    # Growth Signals
    total_funding_usd: Optional[float] = None
    last_funding_round: Optional[str] = None
    investors: Optional[str] = None # Comma-separated or JSON list

class Company(CompanyBase, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    tenant_id: UUID = Field(foreign_key="tenant.id", index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    last_scraped_at: Optional[datetime] = None
    
    tenant: Tenant = Relationship(back_populates="companies")
    jobs: List["Job"] = Relationship(back_populates="company")

class JobBase(SQLModel):
    title: str = Field(index=True)
    location: str
    department: Optional[str] = None
    job_url: str
    salary_range: Optional[str] = None
    experience_level: Optional[str] = None # Junior, Mid, Senior, etc.
    is_remote: bool = False
    
    # AI Normalization
    normalized_title: Optional[str] = None
    normalized_seniority: Optional[str] = None
    functional_area: Optional[str] = None

class Job(JobBase, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    company_id: UUID = Field(foreign_key="company.id", index=True)
    tenant_id: UUID = Field(foreign_key="tenant.id", index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    status: str = Field(default="active") # active, closed
    
    company: Company = Relationship(back_populates="jobs")
