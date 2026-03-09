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
    try:
        # 1. Base query with eager loading
        stmt = select(Job).join(Company).options(
            selectinload(Job.company).selectinload(Company.vc_firms)
        ).where(Job.status == "active")

        # 2. Apply Full-Text Search if provided
        # We search across Job titles and Company names
        if search:
            search_query = func.websearch_to_tsquery('english', search)
            # Combine title and company name for the search vector
            search_vector = func.setweight(func.to_tsvector('english', Job.title), 'A') + \
                            func.setweight(func.to_tsvector('english', Company.name), 'A')
            
            stmt = stmt.where(search_vector.op('@@')(search_query))
            # Sort by rank
            stmt = stmt.order_by(func.ts_rank(search_vector, search_query).desc())
        else:
            # Default sort by date
            stmt = stmt.order_by(Job.created_at.desc())

        # 3. Apply Filters
        if roleType:
            # Map frontend role types to functional_area or department
            stmt = stmt.where(Job.functional_area.in_(roleType))
        
        if remote:
            # Map 'Remote' vs 'On-site' to boolean
            is_remote_filter = "Remote" in remote
            if len(remote) == 1: # Only filtered for one or the other
                 stmt = stmt.where(Job.is_remote == is_remote_filter)

        if fundingStage:
            # Stage names like 'Series A', 'Seed' etc
            stmt = stmt.where(Company.stage.in_(fundingStage))

        # 4. Count total matching rows (before pagination)
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
