import os
import sys
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from sqlmodel import Session, select
from src.app.core.database import engine
from src.data_model.models import Company

def fix_urls():
    with Session(engine) as session:
        updates = {
            "OpenAI": "https://openai.com/careers",
            "Stripe": "https://stripe.com/jobs/search",
            "Anthropic": "https://boards.greenhouse.io/anthropic"
        }
        
        for name, url in updates.items():
            company = session.exec(select(Company).where(Company.name == name)).first()
            if company:
                company.website_url = url
                session.add(company)
        session.commit()
        print("Updated company URLs for scraping.")

if __name__ == "__main__":
    fix_urls()
