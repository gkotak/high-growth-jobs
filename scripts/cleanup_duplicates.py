import os
import sys
import logging
from datetime import datetime
from sqlmodel import Session, create_engine, select, func
from dotenv import load_dotenv

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from src.data_model.models import Company, Job, CompanyVCFirmLink

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

load_dotenv()
engine = create_engine(os.getenv("DATABASE_URL"))

CSV_START_DATE = datetime(2026, 3, 7)

def cleanup():
    with Session(engine) as session:
        # 1. Get all seeded companies
        seeds = session.exec(select(Company).where(Company.created_at < CSV_START_DATE)).all()
        logger.info(f"Found {len(seeds)} seeded companies to process.")
        
        merged_count = 0
        deleted_count = 0
        
        for seed in seeds:
            # Look for a high-quality CSV match by name
            csv_match = session.exec(
                select(Company)
                .where(Company.name == seed.name)
                .where(Company.created_at >= CSV_START_DATE)
            ).first()
            
            if csv_match:
                # Merge career URL if seed URL looks like a job board
                seed_url = seed.website_url.lower()
                if "greenhouse.io" in seed_url or "lever.co" in seed_url or "boards." in seed_url:
                    csv_match.career_url = seed.website_url
                    logger.info(f"Merged career URL for {seed.name}: {seed.website_url}")
                
                # Move any jobs (should be 0 based on analysis, but safe to do)
                stmt = select(Job).where(Job.company_id == seed.id)
                jobs = session.exec(stmt).all()
                for job in jobs:
                    job.company_id = csv_match.id
                    session.add(job)
                
                # Move VC links
                stmt = select(CompanyVCFirmLink).where(CompanyVCFirmLink.company_id == seed.id)
                links = session.exec(stmt).all()
                for link in links:
                    # Check if CSV match already has this link
                    existing = session.exec(
                        select(CompanyVCFirmLink)
                        .where(CompanyVCFirmLink.company_id == csv_match.id)
                        .where(CompanyVCFirmLink.vc_firm_id == link.vc_firm_id)
                    ).first()
                    if not existing:
                        new_link = CompanyVCFirmLink(company_id=csv_match.id, vc_firm_id=link.vc_firm_id)
                        session.add(new_link)
                    session.delete(link)
                
                session.delete(seed)
                merged_count += 1
            else:
                # If no CSV match, we might want to keep it or delete if it's junk
                # For now, if it's seeded and has no jobs, delete it as requested ("nuke the noise")
                job_count = session.exec(select(func.count(Job.id)).where(Job.company_id == seed.id)).one()
                if job_count == 0:
                    session.delete(seed)
                    deleted_count += 1
        
        session.commit()
        logger.info(f"Phase 1 Complete: Merged {merged_count}, Deleted {deleted_count} seeded orphans.")

        # 2. Handle duplicates within the CSV data by Website URL
        # We want website_url to be unique.
        stmt = (
            select(Company.website_url, func.count(Company.id))
            .where(Company.website_url != "#")
            .group_by(Company.website_url)
            .having(func.count(Company.id) > 1)
        )
        dupes = session.exec(stmt).all()
        logger.info(f"Found {len(dupes)} duplicate website URLs in CSV data.")
        
        for url, count in dupes:
            comps = session.exec(
                select(Company)
                .where(Company.website_url == url)
                .order_by(Company.cb_rank.asc(), Company.created_at.desc())
            ).all()
            
            # Keep the first one, merge others into it
            primary = comps[0]
            for other in comps[1:]:
                # Move jobs
                jobs = session.exec(select(Job).where(Job.company_id == other.id)).all()
                for j in jobs:
                    j.company_id = primary.id
                    session.add(j)
                
                session.delete(other)
            
        session.commit()
        logger.info(f"Phase 2 Complete: Deduplicated website URLs.")

if __name__ == "__main__":
    cleanup()
