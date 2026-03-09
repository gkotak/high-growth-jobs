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

    async def cleanup_and_sync(self, limit: int = 100):
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
                    await self._process_company(session, company)
                    # Update last_scraped_at
                    company.last_scraped_at = datetime.utcnow()
                    session.add(company)
                    session.commit()
                except Exception as e:
                    logger.error(f"Janitor failed for {company.name}: {e}")
                    session.rollback()

    async def _process_company(self, session: Session, company: Company):
        logger.info(f"Cleaning/Syncing {company.name}...")
        
        # A. Trigger Scraper (Pass hash for Smart Skip)
        scraped_jobs, new_hash = await self.orchestrator.run_for_company(company, current_hash=company.last_content_hash)
        
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

    async def enrich_pending_jobs(self, limit: int = 50):
        """
        Phase 2: Deep scrapes a batch of jobs reading their raw HTML descriptions
        and extracting AI structured details to attach to JobDetails.
        """
        logger.info(f"🧹 Phase 2 Enricher looking for up to {limit} pending jobs...")
        with Session(engine) as session:
            statement = (
                select(Job)
                .where(Job.needs_deep_scrape == True)
                .where(Job.status == "active")
                .limit(limit)
            )
            jobs = session.exec(statement).all()
            
            if not jobs:
                logger.info("No pending jobs need deep scraping right now.")
                return

            logger.info(f"Found {len(jobs)} jobs needing deep scrape. Starting enrichment...")
            from src.data_model.models import JobDetails
            from bs4 import BeautifulSoup
            
            for job in jobs:
                try:
                    logger.info(f"🔍 Deep scraping job: {job.title} at {job.job_url}")
                    html, details = await self.orchestrator.run_deep_scrape_for_job(job)
                    
                    if not html:
                        logger.warning(f"⚠️ Could not retrieve HTML for {job.job_url}. Skipping...")
                        continue
                        
                    soup = BeautifulSoup(html, "html.parser")
                    desc_text = soup.get_text(separator="\n", strip=True)
                    
                    # Check if JobDetails already exist (edge case)
                    existing_details = session.exec(select(JobDetails).where(JobDetails.job_id == job.id)).first()
                    job_details = existing_details if existing_details else JobDetails(job_id=job.id)
                    
                    job_details.description_html = html
                    job_details.description_text = desc_text
                    
                    if details:
                        job_details.extracted_requirements = details.extracted_requirements
                        job_details.extracted_benefits = details.extracted_benefits
                        
                        # Phase 2 AI Normalization
                        if details.functional_area:
                            job.functional_area = details.functional_area
                        if details.experience_level:
                            job.experience_level = details.experience_level
                        if details.refined_location:
                            job.location = details.refined_location
                        if details.is_remote:
                            job.is_remote = True
                    
                    job.needs_deep_scrape = False
                    
                    session.add(job_details)
                    session.add(job)
                    session.commit()
                    logger.info(f"✅ Successfully enriched: {job.title}")
                    
                except Exception as e:
                    logger.error(f"❌ Failed to enrich job {job.id}: {e}")
                    session.rollback()
