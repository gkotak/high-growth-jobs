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

class CompanyVCFirmLink(SQLModel, table=True):
    company_id: UUID = Field(foreign_key="company.id", primary_key=True)
    vc_firm_id: UUID = Field(foreign_key="vcfirm.id", primary_key=True)

class VCFirmBase(SQLModel):
    name: str = Field(index=True, unique=True)
    website_url: str
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
    website_url: Optional[str] = Field(unique=True, index=True)
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
