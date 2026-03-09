import logging
from typing import List, Optional
from uuid import UUID
from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session, select, SQLModel, func, and_
from sqlalchemy.orm import selectinload

from src.app.core.database import get_session
from src.data_model.models import Company, Job, JobBase, CompanyBase

# Configure logging for the API
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="HighGrowthJobs API",
    description="AI-Powered Job Search for the Next Generation of Tech Leaders",
    version="0.1.0",
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class VCFirmResponse(SQLModel):
    name: str

class CompanyResponse(CompanyBase):
    id: UUID
    vc_firms: List[VCFirmResponse] = []

class JobResponse(JobBase):
    id: UUID
    company: CompanyResponse

class JobPaginationMeta(SQLModel):
    total_count: int
    page: int
    limit: int
    has_next: bool

class PaginatedJobResponse(SQLModel):
    data: List[JobResponse]
    meta: JobPaginationMeta

@app.get("/")
async def root():
    return {
        "message": "Welcome to HighGrowthJobs API",
        "status": "online",
        "version": "0.1.0"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.get("/api/companies", response_model=List[Company])
async def get_companies(session: Session = Depends(get_session)):
    """
    Returns all indexed companies.
    """
    try:
        companies = session.exec(select(Company)).all()
        return companies
    except Exception as e:
        logger.exception("Final trace for Fetch Companies operation failure:")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.get("/api/jobs", response_model=PaginatedJobResponse)
async def get_jobs(
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=100),
    search: Optional[str] = None,
    roleType: Optional[List[str]] = Query(None),
    remote: Optional[List[str]] = Query(None),
    fundingStage: Optional[List[str]] = Query(None),
    investorTier: bool = Query(False),
    session: Session = Depends(get_session)
):
    """
    Fetches active high-growth jobs with eager-loaded company and VC firm data.
    Supports server-side pagination, filtering, and PostgreSQL full-text search.
    """
    # Debug logging
    print(f"--- API Search Request: search='{search}', page={page}, roles={roleType}, remote={remote}, stage={fundingStage} ---")

    try:
        # 1. Base query with eager loading
        stmt = select(Job).join(Company).options(
            selectinload(Job.company).selectinload(Company.vc_firms)
        ).where(Job.status == "active")

        # 2. Apply Search if provided (Full Text + ILIKE combination)
        if search and search.strip():
            s = search.strip()
            # websearch_to_tsquery handles double quotes and operators nicely
            search_query = func.websearch_to_tsquery('english', s)
            # combine title and company into one searchable field
            combined_text = func.coalesce(Job.title, '') + ' ' + func.coalesce(Company.name, '')
            search_vector = func.to_tsvector('english', combined_text)
            
            # Use ILIKE as a direct fallback for substring matching (fixes 'soft' vs 'software')
            search_pattern = f"%{s}%"
            stmt = stmt.where(
                (Job.title.ilike(search_pattern)) | 
                (Company.name.ilike(search_pattern)) |
                (search_vector.op('@@')(search_query))
            )
            
            # Sort relevant matches first if possible, or just by date
            stmt = stmt.order_by(Job.created_at.desc())
        else:
            # Default sort by date
            stmt = stmt.order_by(Job.created_at.desc())

        # 3. Apply Filters
        if roleType and len(roleType) > 0:
            stmt = stmt.where(Job.functional_area.in_(roleType))
        
        if remote and len(remote) > 0:
            is_remote_filter = "Remote" in remote
            if len(remote) == 1:
                 stmt = stmt.where(Job.is_remote == is_remote_filter)

        if fundingStage and len(fundingStage) > 0:
            stmt = stmt.where(Company.stage.in_(fundingStage))
            
        if investorTier:
            # Placeholder/Stub: Assuming we filter for Tier 1 VCs
            # Note: This logic depends on your VCFirm tier classification
            stmt = stmt.join(Company.vc_firms).where(VCFirm.tier == "Tier 1")

        # 4. Count total matching rows (before pagination)
        # Use a CTE for cleaner count logic on complex queries
        count_stmt = select(func.count()).select_from(stmt.subquery())
        total_count = session.exec(count_stmt).one()

        # 5. Apply Pagination
        stmt = stmt.offset((page - 1) * limit).limit(limit)
        jobs = session.exec(stmt).all()

        has_next = total_count > (page * limit)

        return PaginatedJobResponse(
            data=jobs,
            meta=JobPaginationMeta(
                total_count=total_count,
                page=page,
                limit=limit,
                has_next=has_next
            )
        )
    except Exception as e:
        logger.error(f"Failed to fetch jobs: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error while searching job data")
