import os
import sys
import uuid
import random
from datetime import datetime, timedelta
from sqlmodel import Session, create_engine, select
from dotenv import load_dotenv

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from src.data_model.models import Company, Job, Tenant

load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")
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

def seed_jobs():
    with Session(engine) as session:
        # Get system tenant
        tenant = session.exec(select(Tenant).where(Tenant.slug == "system")).first()
        if not tenant:
            print("System tenant not found!")
            return

        # Get some companies, prefer ones with high funding
        companies = session.exec(select(Company).where(Company.tenant_id == tenant.id).limit(100)).all()
        if not companies:
            print("No companies found to attach jobs to.")
            return

        # Clear existing jobs if any
        existing_jobs = session.exec(select(Job)).all()
        for j in existing_jobs:
            session.delete(j)
        session.commit()

        print(f"Generating dummy jobs for {len(companies)} companies...")
        
        new_jobs = []
        for company in companies:
            # Generate 1 to 5 jobs per company
            num_jobs = random.randint(1, 5)
            for _ in range(num_jobs):
                title, dept, exp, remote = random.choice(JOB_TITLES)
                sal_min = random.randint(80, 150) * 1000
                sal_max = sal_min + random.randint(30, 80) * 1000
                
                job = Job(
                    id=uuid.uuid4(),
                    company_id=company.id,
                    tenant_id=tenant.id,
                    title=title,
                    location=company.location or "San Francisco, CA",
                    department=dept,
                    job_url=f"{company.website_url.rstrip('/')}/careers/{uuid.uuid4()}",
                    salary_range=f"${sal_min:,} - ${sal_max:,}",
                    experience_level=exp,
                    is_remote=remote,
                    functional_area=dept,
                    created_at=datetime.utcnow() - timedelta(days=random.randint(0, 30))
                )
                new_jobs.append(job)

        session.add_all(new_jobs)
        session.commit()
        print(f"Successfully inserted {len(new_jobs)} dummy jobs!")

if __name__ == "__main__":
    seed_jobs()
