from datetime import datetime
from typing import Optional, List
from uuid import UUID, uuid4
from sqlmodel import SQLModel, Field, Relationship
from sqlalchemy import Column
from sqlalchemy.dialects.postgresql import JSONB

class TenantBase(SQLModel):
    name: str
    slug: str = Field(unique=True, index=True)

class Tenant(TenantBase, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    companies: List["Company"] = Relationship(back_populates="tenant")

class CompanyVCFirmLink(SQLModel, table=True):
    company_id: UUID = Field(foreign_key="company.id", primary_key=True)
    vc_firm_id: UUID = Field(foreign_key="vcfirm.id", primary_key=True)

class VCFirmBase(SQLModel):
    name: str = Field(index=True, unique=True)
    website_url: Optional[str] = Field(default=None, nullable=True)
    portfolio_url: Optional[str] = None
    region: Optional[str] = None # US, EU, Global
    tier: Optional[str] = None # Tier 1, Tier 2, etc.
    
    # Crunchbase specific
    num_portfolio_orgs: Optional[int] = None
    investor_type: Optional[str] = None
    num_investments: Optional[int] = None
    num_exits: Optional[int] = None
    location: Optional[str] = None
    cb_rank: Optional[int] = None
    
    # Differential Ingestion Tracking
    portfolio_html_hash: Optional[str] = None
    last_scraped_at: Optional[datetime] = None
    
    is_stub: bool = False

class VCFirm(VCFirmBase, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Relationship to companies
    companies: List["Company"] = Relationship(back_populates="vc_firms", link_model=CompanyVCFirmLink)

class CompanyBase(SQLModel):
    name: str = Field(index=True)
    website_url: Optional[str] = Field(default=None, unique=True, index=True, nullable=True)
    career_url: Optional[str] = None
    description: Optional[str] = None
    logo_url: Optional[str] = None
    linkedin_url: Optional[str] = None
    twitter_url: Optional[str] = None
    
    # Growth Signals
    total_funding_amount: Optional[str] = None
    last_funding_amount: Optional[str] = None
    last_funding_date: Optional[datetime] = None
    last_funding_round: Optional[str] = None
    employee_count: Optional[str] = None
    founded_date: Optional[str] = None
    
    # Crunchbase specific
    stage: Optional[str] = None
    industries: Optional[str] = None
    location: Optional[str] = None
    estimated_revenue_range: Optional[str] = None
    cb_rank: Optional[int] = None

    # Performance Tracking
    last_content_hash: Optional[str] = None

class Company(CompanyBase, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    tenant_id: UUID = Field(foreign_key="tenant.id", index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    last_scraped_at: Optional[datetime] = None
    
    tenant: Tenant = Relationship(back_populates="companies")
    jobs: List["Job"] = Relationship(back_populates="company")
    
    # Relationship to VCs back-populates
    vc_firms: List[VCFirm] = Relationship(back_populates="companies", link_model=CompanyVCFirmLink)

class JobBase(SQLModel):
    # Raw Data (stored as found on site)
    title: str = Field(index=True)
    location: str
    department: Optional[str] = None
    job_url: str
    salary_range: Optional[str] = None
    
    # Normalized/AI Enrichment Data
    experience_level: Optional[str] = None  # Standardized: Intern, Entry, Mid, Senior, Lead, Staff, Director, Executive
    is_remote: bool = False
    
    normalized_title: Optional[str] = None  # Cleaned title (e.g. 'Senior Software Engineer')
    functional_area: Optional[str] = None   # Category (e.g. Engineering, Product, Sales)

class Job(JobBase, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    company_id: UUID = Field(foreign_key="company.id", index=True)
    tenant_id: UUID = Field(foreign_key="tenant.id", index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    status: str = Field(default="active") # active, closed
    needs_deep_scrape: bool = Field(default=True, index=True)
    
    company: Company = Relationship(back_populates="jobs")
    details: Optional["JobDetails"] = Relationship(back_populates="job")

class JobDetailsBase(SQLModel):
    description_html: Optional[str] = None
    description_text: Optional[str] = None
    extracted_description: Optional[str] = None
    extracted_requirements: Optional[str] = None
    extracted_benefits: Optional[str] = None

class JobDetails(JobDetailsBase, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    job_id: UUID = Field(foreign_key="job.id", unique=True, index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    job: Job = Relationship(back_populates="details")

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
    
    company: Optional["Company"] = Relationship()
    job: Optional["Job"] = Relationship()
    
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)
