import os
import sys
import logging
from sqlmodel import Session, select

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from src.app.core.database import engine
from src.data_model.models import Job
from src.app.core.logging_setup import setup_logger

logger = setup_logger("ClearJobsScript")

def clear_all_jobs():
    logger.info("Connecting to database to delete all existing jobs...")
    try:
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
    except Exception as e:
        logger.error(f"Failed to clear jobs due to a database error: {e}")

if __name__ == "__main__":
    clear_all_jobs()
