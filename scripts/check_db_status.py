import logging
from sqlmodel import Session, select, func
from src.app.core.database import engine
from src.data_model.models import Company, Job

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def check_db():
    with Session(engine) as session:
        # Check Companies
        company_count = session.exec(select(func.count(Company.id))).first() or 0
        logger.info(f"Total Companies: {company_count}")
        
        # Check Jobs
        job_count = session.exec(select(func.count(Job.id))).first() or 0
        active_jobs = session.exec(select(func.count(Job.id)).where(Job.status == "active")).first() or 0
        logger.info(f"Total Jobs: {job_count} (Active: {active_jobs})")
        

if __name__ == "__main__":
    check_db()
