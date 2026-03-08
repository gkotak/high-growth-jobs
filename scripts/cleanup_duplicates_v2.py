import os
import sys
import logging
from sqlmodel import Session, create_engine, select, func
from dotenv import load_dotenv

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from src.data_model.models import Company, Job

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

load_dotenv()
engine = create_engine(os.getenv("DATABASE_URL"))

def cleanup_phase2():
    with Session(engine) as session:
        # 2. Handle duplicates within the CSV data by Website URL
        stmt = (
            select(Company.website_url, func.count(Company.id))
            .where(Company.website_url != "#")
            .group_by(Company.website_url)
            .having(func.count(Company.id) > 1)
        )
        dupes = session.exec(stmt).all()
        logger.info(f"Found {len(dupes)} remaining duplicate website URLs.")
        
        for url, count in dupes:
            comps = session.exec(
                select(Company)
                .where(Company.website_url == url)
                .order_by(Company.cb_rank.asc(), Company.created_at.desc())
            ).all()
            
            # Keep the one with most data or best rank
            primary = comps[0]
            logger.info(f"Deduplicating {url} ({len(comps)} entries). Keeping {primary.id}")
            
            for other in comps[1:]:
                # Move jobs
                jobs = session.exec(select(Job).where(Job.company_id == other.id)).all()
                for j in jobs:
                    j.company_id = primary.id
                    session.add(j)
                
                # Delete other
                session.delete(other)
            
            session.commit() # Commit each group to avoid huge transaction
            
        logger.info("Deduplication complete.")

if __name__ == "__main__":
    cleanup_phase2()
