import os
import sys
import uuid
import random
import logging
from datetime import datetime, timedelta
from sqlmodel import Session, create_engine, select
from dotenv import load_dotenv

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from src.data_model.models import Company, Job, Tenant

# Configure logging
logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
logger = logging.getLogger(__name__)

load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    logger.error("Operational Error: DATABASE_URL is missing. Seeding aborted.")
    sys.exit(1)

engine = create_engine(DATABASE_URL)

JOB_TITLES = [
    ("Senior Software Engineer", "Engineering", "Senior", True),
    ("Product Manager", "Product", "Mid", False),
    ("Data Scientist", "Engineering", "Mid", True),
    ("Account Executive", "Sales", "Mid", False),
    ("Frontend Developer", "Engineering", "Junior", True),
    ("Marketing Director", "Marketing", "Senior", False),
    ("UX Designer", "Design", "Mid", True),
    ("VP of Engineering", "Engineering", "Executive", False),
    ("Staff Backend Engineer", "Engineering", "Lead", True),
    ("Customer Success Manager", "Customer Success", "Mid", False),
]

def generate_and_seed_jobs():
    """
    Generates dummy job listings for ingested companies to populate the Discovery UI.
    This is a temporary measure while the actual MarketScraper (Epic 3) is pending.
    """
    with Session(engine) as session:
        try:
            # Get system tenant
            tenant = session.exec(select(Tenant).where(Tenant.slug == "system")).first()
            if not tenant:
                logger.error("System tenant 'system' not found in database. Please run initial migrations/seeds.")
                return

            # Get some companies, prefer ones with high funding
            companies = session.exec(select(Company).where(Company.tenant_id == tenant.id).limit(100)).all()
            if not companies:
                logger.warning(f"No companies found for tenant_id {tenant.id}. Data ingestion (Epic 2) must run first.")
                return

            # Clear existing jobs to ensure a clean slate for the UI demo
            logger.info("Purging existing jobs for clean re-seed...")
            existing_jobs = session.exec(select(Job)).all()
            for j in existing_jobs:
                session.delete(j)
            
            logger.info(f"Generating synthetic roles for {len(companies)} discovered companies...")
            
            new_jobs = []
            for company in companies:
                # Generate 1 to 5 jobs per company
                num_jobs = random.randint(1, 5)
                for _ in range(num_jobs):
                    title, dept, exp, remote = random.choice(JOB_TITLES)
                    
                    # Basic salary validation logic
                    sal_min_base = 80 if exp == "Junior" else (120 if exp == "Mid" else 160)
                    sal_min = random.randint(sal_min_base, sal_min_base + 40) * 1000
                    sal_max = sal_min + random.randint(20, 60) * 1000
                    
                    safe_website = (company.website_url or "https://highgrowthjobs.ai").rstrip('/')
                    job_url = f"{safe_website}/careers/{uuid.uuid4()}"
                    
                    job = Job(
                        id=uuid.uuid4(),
                        company_id=company.id,
                        tenant_id=tenant.id,
                        title=title,
                        location=company.location or "San Francisco, CA",
                        department=dept,
                        job_url=job_url,
                        salary_range=f"${sal_min:,} - ${sal_max:,}",
                        experience_level=exp,
                        is_remote=remote,
                        functional_area=dept,
                        created_at=datetime.utcnow() - timedelta(days=random.randint(0, 30))
                    )
                    new_jobs.append(job)

            session.add_all(new_jobs)
            session.commit()
            logger.info(f"✅ Success: 🚀 Injected {len(new_jobs)} high-growth jobs into the portal.")

        except Exception as e:
            session.rollback()
            logger.error(f"❌ Transaction failed during seeding: {str(e)}")
            raise

if __name__ == "__main__":
    generate_and_seed_jobs()
