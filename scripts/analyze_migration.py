import os
import sys
from sqlmodel import Session, create_engine, select, func
from dotenv import load_dotenv
from datetime import datetime

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from src.data_model.models import Company, Job

load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")
engine = create_engine(DATABASE_URL)

# Threshold for CSV import
CSV_START_DATE = datetime(2026, 3, 7)

def analyze_migration():
    with Session(engine) as session:
        # All companies
        all_comps = session.exec(select(Company)).all()
        seeds = [c for c in all_comps if c.created_at < CSV_START_DATE]
        csv_comps = [c for c in all_comps if c.created_at >= CSV_START_DATE]
        
        print(f"Total Companies: {len(all_comps)}")
        print(f"Seeded Companies (before Mar 7): {len(seeds)}")
        print(f"CSV Companies (on/after Mar 7): {len(csv_comps)}")
        
        # Check for name overlaps
        seed_names = {c.name.lower() for c in seeds}
        csv_names = {c.name.lower() for c in csv_comps}
        overlap = seed_names.intersection(csv_names)
        
        print(f"\nCompanies found in BOTH Seeded and CSV data: {len(overlap)}")
        print("Samples of overlap:")
        for name in list(overlap)[:20]:
            s_match = [c for c in seeds if c.name.lower() == name]
            c_match = [c for c in csv_comps if c.name.lower() == name]
            print(f"- {name}:")
            for c in s_match:
                print(f"  [SEED] ID: {c.id} | URL: {c.website_url}")
            for c in c_match:
                print(f"  [CSV]  ID: {c.id} | URL: {c.website_url}")

        # Job Analysis
        job_count = session.exec(select(func.count(Job.id))).one()
        print(f"\nTotal Jobs in DB: {job_count}")
        
        # Jobs tied to seeded companies vs CSV companies
        seed_ids = {c.id for c in seeds}
        jobs_on_seeds = session.exec(select(func.count(Job.id)).where(Job.company_id.in_(list(seed_ids)))).one() if seed_ids else 0
        print(f"Jobs tied to Seeded Companies: {jobs_on_seeds}")

if __name__ == "__main__":
    analyze_migration()
