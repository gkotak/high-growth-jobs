import os
import sys
from sqlmodel import Session, create_engine, select, func
from dotenv import load_dotenv

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from src.data_model.models import Company, Job

load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")
engine = create_engine(DATABASE_URL)

def analyze_duplicates():
    with Session(engine) as session:
        # Count companies with same name
        stmt = select(Company.name, func.count(Company.id).label("count")).group_by(Company.name).having(func.count(Company.id) > 1)
        duplicates = session.exec(stmt).all()
        
        print(f"Found {len(duplicates)} company names with duplicates.")
        
        for row in duplicates[:20]:
            name = row[0]
            count = row[1]
            print(f"\n- {name} ({count} entries)")
            comps = session.exec(select(Company).where(Company.name == name)).all()
            for c in comps:
                job_count = session.exec(select(func.count(Job.id)).where(Job.company_id == c.id)).one()
                print(f"  ID: {c.id} | URL: {c.website_url} | Jobs: {job_count}")

if __name__ == "__main__":
    analyze_duplicates()
