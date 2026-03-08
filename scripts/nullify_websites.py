import os
import sys
from sqlmodel import Session, create_engine, select
from dotenv import load_dotenv

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from src.data_model.models import Company

load_dotenv()
engine = create_engine(os.getenv("DATABASE_URL"))

def nullify_hash_websites():
    with Session(engine) as session:
        comps = session.exec(select(Company).where(Company.website_url == '#')).all()
        for c in comps:
            c.website_url = None
            session.add(c)
        session.commit()
        print(f"Updated {len(comps)} companies to NULL website")

if __name__ == "__main__":
    nullify_hash_websites()
