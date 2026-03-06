from datetime import datetime
import logging
from typing import List, Set
from sqlmodel import Session, select
from src.app.core.orchestrator import MarketScraperOrchestrator
from src.data_model.models import Company, Job
from src.app.core.database import engine

logger = logging.getLogger(__name__)

class JanitorService:
    def __init__(self):
        self.orchestrator = MarketScraperOrchestrator()

    def cleanup_and_sync(self):
        """
        The main Janitor loop:
        1. Find companies to scrape
        2. Run scraper
        3. Diff jobs vs DB
        4. Update status
        """
        with Session(engine) as session:
            # 1. Get all companies (in V2 we based this on last_scraped_at)
            statement = select(Company)
            companies = session.exec(statement).all()
            
            logger.info(f"Janitor starting sync for {len(companies)} companies")

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
        
        # A. Trigger Scraper
        scraped_jobs = self.orchestrator.run_for_company(company)
        if not scraped_jobs:
            logger.warning(f"No jobs found for {company.name}. Skipping diff.")
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

        session.commit()
        logger.info(f"Done with {company.name}. New: {new_count}, Closed: {stale_count}")
