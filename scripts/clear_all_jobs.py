import os
import sys
import logging
from sqlmodel import Session, select

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from src.app.core.database import engine
from src.data_model.models import Job

# Configure logging
logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
logger = logging.getLogger(__name__)

def clear_all_jobs():
    logger.info("Connecting to database to delete all existing jobs...")
    with Session(engine) as session:
        jobs = session.exec(select(Job)).all()
        count = len(jobs)
        if count == 0:
            logger.info("No jobs found in the database. It is already empty.")
            return

        for job in jobs:
            session.delete(job)
        
        session.commit()
        logger.info(f"Successfully deleted {count} jobs from the database.")

if __name__ == "__main__":
    clear_all_jobs()
