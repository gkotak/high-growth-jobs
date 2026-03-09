import os
import sys
import argparse
import logging
import asyncio
from sqlmodel import Session, select
from dotenv import load_dotenv
import json

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from src.app.core.database import engine
from src.data_model.models import Job, JobDetails
from src.app.services.janitor import JanitorService
from src.app.core.logging_setup import setup_logger

logger = setup_logger("TestEnricher")

async def test_enrich_jobs(limit: int):
    """
    Manually runs Phase 2 Deep Scraper on a small batch of jobs to verify extraction.
    """
    load_dotenv()
    
    with Session(engine) as session:
        # Check how many total jobs are in the queue
        pending_count = len(session.exec(select(Job).where(Job.needs_deep_scrape == True).where(Job.status == "active")).all())
        logger.info(f"📊 There are currently {pending_count} active jobs in the database waiting for a Deep Scrape.")
        
        if pending_count == 0:
            logger.info("✅ No jobs to enrich!")
            return

        logger.info(f"🚀 Triggering JanitorService.enrich_pending_jobs(limit={limit})...")
        service = JanitorService()
        
    # Run the actual enricher task
    await service.enrich_pending_jobs(limit=limit)
    
    # Verify the results!
    with Session(engine) as session:
        logger.info("🔎 Verifying database updates...")
        recently_enriched = session.exec(
            select(Job, JobDetails)
            .join(JobDetails)
            .order_by(JobDetails.updated_at.desc())
            .limit(limit)
        ).all()
        
        for job, details in recently_enriched:
            print("\n" + "="*80)
            print(f"✅ SUCCESSFULLY ENRICHED: {job.title} at {job.company.name}")
            print("="*80)
            print(f"- Functional Area: {job.functional_area}")
            print(f"- Experience Level: {job.experience_level}")
            print(f"- Location: {job.location}")
            print(f"- Remote: {job.is_remote}")
            print(f"- URL: {job.job_url}")
            print("-"*80)
            print("📝 CORE DESCRIPTION:")
            print(details.extracted_description)
            print("-"*80)
            print("📜 REQUIREMENTS:")
            print(details.extracted_requirements)
            print("-"*80)
            print("🎁 BENEFITS:")
            print(details.extracted_benefits)
            print("="*80 + "\n")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Manually test the Phase 2 Deep Scrape loop.")
    parser.add_argument("--limit", type=int, default=5, help="Number of jobs to process in this test run.")
    args = parser.parse_args()
    
    asyncio.run(test_enrich_jobs(args.limit))
