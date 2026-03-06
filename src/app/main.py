from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session, select
from typing import List

from src.app.core.database import get_session
from src.data_model.models import Company

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

@app.get("/companies", response_model=List[Company])
async def get_companies(session: Session = Depends(get_session)):
    companies = session.exec(select(Company)).all()
    return companies
