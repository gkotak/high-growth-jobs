import os
import logging
from datetime import datetime, timedelta
from typing import List, Set
from sqlmodel import Session, select
from src.app.core.orchestrator import MarketScraperOrchestrator
from src.data_model.models import Company, Job
from src.app.core.database import engine

logger = logging.getLogger(__name__)

class JanitorService:
    def __init__(self):
        self.orchestrator = MarketScraperOrchestrator()

    def cleanup_and_sync(self, limit: int = 100):
        """
        The main Janitor loop:
        1. Find companies to scrape (sorted by cb_rank)
        2. Run scraper for each company
        3. Diff jobs vs DB (add new, close stale)
        4. Update last_scraped_at status
        """
        # Pull from environment with defensive parsing
        try:
            run_limit = int(os.getenv("JANITOR_LIMIT", str(limit)))
        except ValueError:
            run_limit = limit

        stale_threshold = datetime.utcnow() - timedelta(days=7) # Only re-scrape every 7 days

        with Session(engine) as session:
            # 1. Get companies (Prioritize top tier startups by cb_rank)
            statement = (
                select(Company)
                .where((Company.last_scraped_at.is_(None)) | (Company.last_scraped_at < stale_threshold))
                .order_by(Company.cb_rank.asc())
                .limit(run_limit)
            )
            companies = session.exec(statement).all()
            
            logger.info(f"Janitor starting sync for {len(companies)} priority companies (Limit: {run_limit})")

            for company in companies:
                try:
                    self._process_company(session, company)
                    # Update last_scraped_at
                    company.last_scraped_at = datetime.utcnow()
                    session.add(company)
                    session.commit()
                except Exception as e:
                    logger.error(f"Janitor failed for {company.name}: {e}")
                    session.rollback()

    def _process_company(self, session: Session, company: Company):
        logger.info(f"Cleaning/Syncing {company.name}...")
        
        # A. Trigger Scraper (Pass hash for Smart Skip)
        scraped_jobs, new_hash = self.orchestrator.run_for_company(company, current_hash=company.last_content_hash)
        
        # Update hash regardless of whether jobs were found (to track the check)
        if new_hash:
            company.last_content_hash = new_hash
            session.add(company)
            session.flush()

        if not scraped_jobs:
            # If we didn't get jobs, it might be because of a Smart Skip
            # In that case, we don't want to close existing jobs!
            logger.info(f"No new jobs or skip detected for {company.name}.")
            return

        # B. Get existing ACTIVE jobs from DB
        statement = select(Job).where(Job.company_id == company.id).where(Job.status == "active")
        db_active_jobs = session.exec(statement).all()
        
        # Maps for quick comparison (key: job_url or title+location)
        db_job_urls = {j.job_url: j for j in db_active_jobs}
        scraped_job_urls = {j.job_url: j for j in scraped_jobs}

        # C. Find NEW jobs (In scraped, not in DB)
        new_count = 0
        for url, job in scraped_job_urls.items():
            if url not in db_job_urls:
                # Add tenant_id from company if missing
                job.tenant_id = company.tenant_id
                session.add(job)
                new_count += 1
        
        # D. Find STALE jobs (In DB, not in scraped)
        # These are jobs that were filled or removed from the careers page
        stale_count = 0
        for url, db_job in db_job_urls.items():
            if url not in scraped_job_urls:
                db_job.status = "closed"
                session.add(db_job)
                stale_count += 1

        session.flush() # Let the outer loop commit to maintain atomicity
        logger.info(f"Done with {company.name}. New: {new_count}, Closed: {stale_count}")
