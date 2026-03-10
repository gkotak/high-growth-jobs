from typing import List, Optional
from uuid import UUID
import asyncio
import logging
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query, BackgroundTasks
from sqlmodel import Session, select, func
from sqlalchemy.orm import selectinload

from src.app.core.database import get_session, engine
from src.data_model.models import Company, Job, JobDetails, VCFirm, ExecutionLog
from src.app.services.janitor import JanitorService
from sqlalchemy import or_
from fastapi.responses import StreamingResponse
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/admin", tags=["admin"])

# Global semaphore to limit concurrent scrapes to protect server memory/rate limits
scrape_semaphore = asyncio.Semaphore(3)

@router.get("/stats")
async def get_stats(session: Session = Depends(get_session)):
    """Summary stats for the admin dashboard."""
    company_count = session.exec(select(func.count(Company.id))).one()
    job_count = session.exec(select(func.count(Job.id))).one()
    active_jobs = session.exec(select(func.count(Job.id)).where(Job.status == "active")).one()
    pending_enrichment = session.exec(select(func.count(Job.id)).where(Job.needs_deep_scrape == True).where(Job.status == "active")).one()
    
    return {
        "company_count": company_count,
        "job_count": job_count,
        "active_jobs": active_jobs,
        "pending_enrichment": pending_enrichment
    }

@router.get("/companies")
async def get_admin_companies(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    search: Optional[str] = None,
    sort_by: Optional[str] = Query("name"), # name, rank, last_scraped
    sort_order: Optional[str] = Query("asc"), # asc, desc
    search_only: Optional[bool] = Query(False),
    session: Session = Depends(get_session)
):
    """List with pagination, cb_rank sorting, and filtering."""
    stmt = select(Company)
    
    if search:
        search_pattern = f"%{search.strip()}%"
        stmt = stmt.where(
            (Company.name.ilike(search_pattern)) | 
            (Company.website_url.ilike(search_pattern))
        )
    
    # Dynamic Sorting
    if sort_by == "rank":
        order_col = Company.cb_rank
    elif sort_by == "last_scraped":
        order_col = Company.last_scraped_at
    else:
        order_col = Company.name
        
    if sort_order == "desc":
        stmt = stmt.order_by(order_col.desc())
    else:
        stmt = stmt.order_by(order_col.asc())
        
    total_count = session.exec(select(func.count()).select_from(stmt.subquery())).one()
    
    stmt = stmt.offset((page - 1) * limit).limit(limit)
    companies = session.exec(stmt).all()
    
    results = []
    for c in companies:
        if search_only:
            # Lightweight response for autocomplete
            results.append({
                "id": c.id,
                "name": c.name,
                "job_count": 0,
                "pending_count": 0,
                "cb_rank": c.cb_rank or 999999
            })
            continue

        job_count = session.exec(select(func.count(Job.id)).where(Job.company_id == c.id)).one()
        pending_count = session.exec(select(func.count(Job.id)).where(Job.company_id == c.id).where(Job.needs_deep_scrape == True).where(Job.status == "active")).one()
        results.append({
            "id": c.id,
            "name": c.name,
            "website_url": c.website_url,
            "last_scraped_at": c.last_scraped_at,
            "job_count": job_count,
            "pending_count": pending_count,
            "cb_rank": c.cb_rank
        })
    
    return {
        "data": results,
        "total": total_count,
        "page": page,
        "limit": limit
    }

async def run_throttling_scrape(company_id: UUID):
    """
    Background worker that respects the semaphore limit.
    Performs Phase 1 (Discovery) and then Phase 2 (Enrichment) for the specific company.
    """
    async with scrape_semaphore:
        logger.info(f"Starting queued manual scrape for company_id: {company_id}")
        
        service = JanitorService()
        
        with Session(engine) as session:
            company = session.get(Company, company_id)
            if not company:
                logger.error(f"Company {company_id} not found for manual scrape.")
                return
            
            # Force Phase 1 by clearing hash
            company.last_content_hash = None
            try:
                # 1. Discovery Phase
                logger.info(f"🔍 Discovery Phase: Scraping {company.name} career portal...")
                await service._process_company(session, company, source="manual")
                company.last_scraped_at = func.now()
                session.add(company)
                session.commit()
                
                # 2. Enrichment Phase (The Backlog Clearer)
                logger.info(f"🧠 Enrichment Phase: Scrape complete for {company.name}. Checking for full backlog...")
                
                # Fetch EVERY job for this company that still needs deep scraping
                backlog_stmt = (
                    select(Job)
                    .where(Job.company_id == company.id)
                    .where(Job.needs_deep_scrape == True)
                    .where(Job.status == "active")
                    .order_by(Job.created_at.desc())
                )
                backlog_jobs = session.exec(backlog_stmt).all()
                total_pending = len(backlog_jobs)
                
                if total_pending > 0:
                    logger.info(f"✨ Backlog detected: {total_pending} jobs for {company.name} need enrichment. Starting high-priority batch...")
                    
                    # Create a clear log entry for the UI
                    start_log = ExecutionLog(
                        company_id=company.id,
                        source="manual",
                        action="enrichment",
                        status="success",
                        payload={"message": f"Clearing backlog of {total_pending} pending jobs"}
                    )
                    session.add(start_log)
                    session.commit()
                    
                    # Process the entire backlog (limit set high to ensure we get them all)
                    await service.enrich_pending_jobs(limit=total_pending + 10, source="manual", company_id=company_id)
                else:
                    logger.info(f"✅ No pending enrichment backlog for {company.name}")
                
                logger.info(f"✅ Manual scrape/enrich successfully finished for {company.name}")
            except Exception as e:
                logger.error(f"❌ Force scrape failed for {company.name}: {e}", exc_info=True)
                return

@router.post("/companies/{company_id}/scrape")
async def force_scrape_company(company_id: UUID, background_tasks: BackgroundTasks, session: Session = Depends(get_session)):
    """Trigger an immediate Discovery + Enrichment pass for a company."""
    try:
        background_tasks.add_task(run_throttling_scrape, company_id)
        return {"message": "Scrape task queued"}
    except Exception as e:
        logger.error(f"Error in force_scrape_company: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/logs")
async def get_global_logs(limit: int = 100, session: Session = Depends(get_session)):
    """Fetch global structured execution history for all companies/daemons."""
    try:
        stmt = select(ExecutionLog).options(
            selectinload(ExecutionLog.company),
            selectinload(ExecutionLog.job)
        ).order_by(ExecutionLog.created_at.desc()).limit(limit)
        logs = session.exec(stmt).all()
        
        # Include names for UI
        results = []
        for l in logs:
            payload = dict(l.payload)
            if l.company:
                payload["company_name"] = l.company.name
            if l.job:
                payload["job_title"] = l.job.title
            
            # Create a dict to return with these extra fields
            res = l.dict()
            res["payload"] = payload
            results.append(res)
            
        return results
    except Exception as e:
        logger.error(f"Error fetching global logs: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/companies/{company_id}/logs")
async def get_company_logs(company_id: UUID, limit: int = 100, session: Session = Depends(get_session)):
    """Fetch structured execution history for a company and its jobs."""
    try:
        stmt = select(ExecutionLog).options(
            selectinload(ExecutionLog.company),
            selectinload(ExecutionLog.job)
        ).where(
            or_(
                ExecutionLog.company_id == company_id,
                ExecutionLog.job_id.in_(
                    select(Job.id).where(Job.company_id == company_id)
                )
            )
        ).order_by(ExecutionLog.created_at.desc()).limit(limit)
        logs = session.exec(stmt).all()
        
        results = []
        for l in logs:
            payload = dict(l.payload or {})
            if l.company:
                payload["company_name"] = l.company.name
            if l.job:
                payload["job_title"] = l.job.title
            
            res = l.dict()
            res["payload"] = payload
            results.append(res)
            
        return results
    except Exception as e:
        logger.error(f"Error fetching logs for {company_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/jobs")
async def get_admin_jobs(
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=100),
    search: Optional[str] = None,
    status: Optional[str] = None,
    needs_deep_scrape: Optional[bool] = None,
    session: Session = Depends(get_session)
):
    """Full job list with detailed status for admin auditing."""
    stmt = select(Job).options(selectinload(Job.company)).join(Company)
    
    if search:
        search_pattern = f"%{search.strip()}%"
        stmt = stmt.where(
            (Job.title.ilike(search_pattern)) | 
            (Company.name.ilike(search_pattern))
        )
        
    if status:
        stmt = stmt.where(Job.status == status)
    if needs_deep_scrape is not None:
        stmt = stmt.where(Job.needs_deep_scrape == needs_deep_scrape)
    
    stmt = stmt.order_by(Job.created_at.desc())
    
    total_count = session.exec(select(func.count()).select_from(stmt.subquery())).one()
    
    stmt = stmt.offset((page - 1) * limit).limit(limit)
    jobs = session.exec(stmt).all()
    
    # Format response slightly for UI
    results = []
    for j in jobs:
        results.append({
            "id": j.id,
            "title": j.title,
            "company_id": j.company_id,
            "company_name": j.company.name,
            "status": j.status,
            "needs_deep_scrape": j.needs_deep_scrape,
            "created_at": j.created_at,
            "functional_area": j.functional_area,
            "experience_level": j.experience_level,
            "job_url": j.job_url
        })
    
    return {
        "data": results,
        "total": total_count,
        "page": page,
        "limit": limit
    }

@router.post("/jobs/{job_id}/enrich")
async def force_enrich_job(job_id: UUID, background_tasks: BackgroundTasks, session: Session = Depends(get_session)):
    """Manually trigger Phase 2 expansion for a specific job."""
    
    # Get company info for task creation
    job = session.get(Job, job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    async def run_single_enrich(jid: UUID):
        logger.info(f"Starting queued manual enrichment for job_id: {jid}")
        service = JanitorService()
        with Session(engine) as session:
            job = session.get(Job, jid)
            if job:
                try:
                    logger.info(f"🧠 Normalizing '{job.title}' with LLM...")
                    # We ensure the flag is set
                    job.needs_deep_scrape = True
                    session.add(job)
                    session.commit()
                    await service.enrich_pending_jobs(limit=1, source="manual", company_id=job.company_id) # Process just this one (or first for company)
                    logger.info(f"✅ Successfully enriched job: {job.title}")
                except Exception as e:
                    logger.error(f"❌ Enrichment failed for job {job.title}: {str(e)}")
                    return

    background_tasks.add_task(run_single_enrich, job_id)
    return {"message": "Enrichment task queued"}
