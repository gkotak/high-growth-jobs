import logging
from typing import List
from uuid import UUID
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session, select, SQLModel
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

@app.get("/api/jobs", response_model=List[JobResponse])
async def get_jobs(session: Session = Depends(get_session)):
    """
    Fetches all active high-growth jobs with eager-loaded company and VC firm data.
    """
    try:
        stmt = select(Job).options(
            selectinload(Job.company).selectinload(Company.vc_firms)
        )
        jobs = session.exec(stmt).all()
        return jobs
    except Exception as e:
        logger.error(f"Failed to fetch jobs: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error while retrieving job data")
